import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { ProfileCharacter } from '../profile/entities/profile-character.entity';
import { Field } from '../roadmap/entities/field.entity';
import { Quiz } from '../roadmap/entities/quiz.entity';
import { Step } from '../roadmap/entities/step.entity';
import { Unit } from '../roadmap/entities/unit.entity';

import type {
  ProfileCharacterJsonlRow,
  ProfileCharacterUploadSummary,
} from './dto/profile-characters-upload.dto';
import type { QuizJsonlRow, UploadSummary } from './dto/quizzes-upload.dto';
import type {
  UnitOverviewJsonlRow,
  UnitOverviewUploadSummary,
} from './dto/unit-overview-upload.dto';

interface UpsertResult<T> {
  entity: T;
  created: boolean;
  updated?: boolean;
}

@Injectable()
export class BackofficeService {
  constructor(private readonly dataSource: DataSource) {}

  async uploadQuizzesFromJsonl(fileBuffer: Buffer): Promise<UploadSummary> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('파일을 업로드해주세요.');
    }

    // JSONL을 먼저 파싱해서 잘못된 라인을 빠르게 확인
    const rows = this.parseJsonl(fileBuffer.toString('utf8'));
    if (rows.length === 0) {
      throw new BadRequestException('유효한 JSONL 데이터가 없습니다.');
    }

    const summary: UploadSummary = {
      processed: rows.length,
      fieldsCreated: 0,
      fieldsUpdated: 0,
      unitsCreated: 0,
      unitsUpdated: 0,
      stepsCreated: 0,
      stepsUpdated: 0,
      quizzesCreated: 0,
      quizzesUpdated: 0,
    };

    // 트랜잭션 처리
    await this.dataSource.transaction(async manager => {
      for (const [index, row] of rows.entries()) {
        const lineNumber = index + 1;
        this.validateRow(row, lineNumber);

        // Field -> Unit -> Step -> Quiz 순서로 계층 업서트
        const fieldResult = await this.upsertField(row, manager);
        summary.fieldsCreated += fieldResult.created ? 1 : 0;
        summary.fieldsUpdated += fieldResult.updated ? 1 : 0;

        const unitResult = await this.upsertUnit(row, fieldResult.entity, manager);
        summary.unitsCreated += unitResult.created ? 1 : 0;
        summary.unitsUpdated += unitResult.updated ? 1 : 0;

        const stepResult = await this.upsertStep(row, unitResult.entity, manager);
        summary.stepsCreated += stepResult.created ? 1 : 0;
        summary.stepsUpdated += stepResult.updated ? 1 : 0;

        const quizResult = await this.upsertQuiz(row, stepResult.entity, manager, lineNumber);
        summary.quizzesCreated += quizResult.created ? 1 : 0;
        summary.quizzesUpdated += quizResult.updated ? 1 : 0;
      }
    });

    return summary;
  }

  /**
   * JSONL 파일로 유닛 개요를 업로드한다.
   * @param fileBuffer 업로드된 JSONL 파일 버퍼
   * @returns 유닛 개요 업로드 요약
   */
  async uploadUnitOverviewsFromJsonl(fileBuffer: Buffer): Promise<UnitOverviewUploadSummary> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('파일을 업로드해주세요.');
    }

    const rows = this.parseUnitOverviewJsonl(fileBuffer.toString('utf8'));
    if (rows.length === 0) {
      throw new BadRequestException('유효한 JSONL 데이터가 없습니다.');
    }

    const summary: UnitOverviewUploadSummary = {
      processed: rows.length,
      unitsUpdated: 0,
      unitsNotFound: 0,
    };

    await this.dataSource.transaction(async manager => {
      const repository = manager.getRepository(Unit);

      for (const [index, row] of rows.entries()) {
        const lineNumber = index + 1;
        this.validateUnitOverviewRow(row, lineNumber);

        const title = row.unit_title.trim();
        const overview = row.overview.trim();
        const units = await repository.find({ where: { title } });

        if (units.length === 0) {
          summary.unitsNotFound += 1;
          continue;
        }

        for (const unit of units) {
          if (unit.overview === overview) {
            continue;
          }

          unit.overview = overview;
          await repository.save(unit);
          summary.unitsUpdated += 1;
        }
      }
    });

    return summary;
  }

  /**
   * 프로필 캐릭터 JSONL 파일로 캐릭터를 일괄 등록/수정한다.
   *
   * @param fileBuffer 업로드된 JSONL 파일 버퍼
   * @returns 업로드 결과 요약
   */
  async uploadProfileCharactersFromJsonl(
    fileBuffer: Buffer,
  ): Promise<ProfileCharacterUploadSummary> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('파일을 업로드해주세요.');
    }

    const rows = this.parseProfileCharacterJsonl(fileBuffer.toString('utf8'));
    if (rows.length === 0) {
      throw new BadRequestException('유효한 JSONL 데이터가 없습니다.');
    }

    const summary: ProfileCharacterUploadSummary = {
      processed: rows.length,
      charactersCreated: 0,
      charactersUpdated: 0,
    };

    await this.dataSource.transaction(async manager => {
      for (const [index, row] of rows.entries()) {
        const lineNumber = index + 1;
        this.validateProfileCharacterRow(row, lineNumber);

        const result = await this.upsertProfileCharacter(row, manager, lineNumber);
        summary.charactersCreated += result.created ? 1 : 0;
        summary.charactersUpdated += result.updated ? 1 : 0;
      }
    });

    return summary;
  }

  /**
   * 단일 프로필 캐릭터를 등록한다.
   *
   * @param payload 단일 등록 요청
   * @returns 등록 결과
   */
  async createProfileCharacter(payload: {
    imageUrl: string;
    priceDiamonds: number;
    description?: string | null;
    isActive?: boolean;
  }): Promise<{ id: number; created: boolean; updated: boolean }> {
    const normalized = this.normalizeProfileCharacterPayload(payload);

    const result = await this.dataSource.transaction(async manager => {
      const row: ProfileCharacterJsonlRow = {
        image_url: normalized.imageUrl,
        price_diamonds: normalized.priceDiamonds,
        description: normalized.description ?? undefined,
        is_active: normalized.isActive,
      };

      return this.upsertProfileCharacter(row, manager);
    });

    return {
      id: result.entity.id,
      created: result.created,
      updated: !!result.updated,
    };
  }

  /**
   * JSONL 문자열을 파싱해 각 라인을 객체로 변환한다.
   * 파싱 실패 시 라인 번호와 함께 예외를 던진다.
   */
  private parseJsonl(fileText: string): QuizJsonlRow[] {
    const lines = fileText.split(/\r?\n/);
    const rows: QuizJsonlRow[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = this.normalizeLine(line);
      if (!trimmed) {
        return;
      }

      try {
        const parsed = JSON.parse(trimmed) as QuizJsonlRow;
        rows.push(parsed);
      } catch (error) {
        errors.push(`Line ${index + 1}: ${(error as Error).message}`);
      }
    });

    if (errors.length > 0) {
      throw new BadRequestException(['JSONL 파싱 오류가 있습니다.', ...errors].join('\n'));
    }

    return rows;
  }

  /**
   * 유닛 개요 JSONL을 파싱해 각 라인을 객체로 변환한다.
   * 파싱 실패 시 라인 번호와 함께 예외를 던진다.
   */
  private parseUnitOverviewJsonl(fileText: string): UnitOverviewJsonlRow[] {
    const lines = fileText.split(/\r?\n/);
    const rows: UnitOverviewJsonlRow[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = this.normalizeLine(line);
      if (!trimmed) {
        return;
      }

      try {
        const parsed = JSON.parse(trimmed) as UnitOverviewJsonlRow;
        rows.push(parsed);
      } catch (error) {
        errors.push(`Line ${index + 1}: ${(error as Error).message}`);
      }
    });

    if (errors.length > 0) {
      throw new BadRequestException(['JSONL 파싱 오류가 있습니다.', ...errors].join('\n'));
    }

    return rows;
  }

  /**
   * 프로필 캐릭터 JSONL을 파싱해 각 라인을 객체로 변환한다.
   * 파싱 실패 시 라인 번호와 함께 예외를 던진다.
   */
  private parseProfileCharacterJsonl(fileText: string): ProfileCharacterJsonlRow[] {
    const lines = fileText.split(/\r?\n/);
    const rows: ProfileCharacterJsonlRow[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = this.normalizeLine(line);
      if (!trimmed) {
        return;
      }

      try {
        const parsed = JSON.parse(trimmed) as ProfileCharacterJsonlRow;
        rows.push(parsed);
      } catch (error) {
        errors.push(`Line ${index + 1}: ${(error as Error).message}`);
      }
    });

    if (errors.length > 0) {
      throw new BadRequestException(['JSONL 파싱 오류가 있습니다.', ...errors].join('\n'));
    }

    return rows;
  }

  /**
   * 프로필 캐릭터 JSONL 필수 필드를 검증한다.
   인정하지 않는 입력이 DB에 저장되는 것을 방지하기 위함이다.
   */
  private validateProfileCharacterRow(row: ProfileCharacterJsonlRow, lineNumber: number): void {
    const imageUrl = row.image_url?.trim();
    const priceDiamonds = Number(row.price_diamonds);

    if (!imageUrl) {
      throw new BadRequestException(`Line ${lineNumber}: image_url은 필수입니다.`);
    }

    if (!Number.isFinite(priceDiamonds) || priceDiamonds < 0) {
      throw new BadRequestException(`Line ${lineNumber}: price_diamonds는 0 이상 숫자여야 합니다.`);
    }
  }

  /**
   * 단일 등록 요청에서 사용할 값을 정규화한다.
   */
  private normalizeProfileCharacterPayload(payload: {
    imageUrl: string;
    priceDiamonds: number;
    description?: string | null;
    isActive?: boolean;
  }): { imageUrl: string; priceDiamonds: number; description: string | null; isActive: boolean } {
    const imageUrl = payload.imageUrl?.trim();
    if (!imageUrl) {
      throw new BadRequestException('imageUrl은 필수입니다.');
    }

    const priceDiamonds = Number(payload.priceDiamonds);
    if (!Number.isFinite(priceDiamonds) || priceDiamonds < 0) {
      throw new BadRequestException('priceDiamonds는 0 이상 숫자여야 합니다.');
    }

    const description = payload.description?.trim() ?? null;
    const isActive = payload.isActive ?? true;

    return { imageUrl, priceDiamonds, description, isActive };
  }

  /** BOM/스마트 따옴표 등을 정리해 JSON 파싱 안정성을 높인다. */
  private normalizeLine(line: string): string {
    return line
      .replace(/\uFEFF/g, '') // BOM 제거
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .trim();
  }

  /**
   * 필수 필드를 검증한다.
   */
  private validateRow(row: QuizJsonlRow, lineNumber: number): void {
    const required = [
      ['field_slug', row.field_slug],
      ['field_name', row.field_name],
      ['unit_title', row.unit_title],
      ['step_title', row.step_title],
      ['type', row.type],
      ['question', row.question],
      ['content', row.content],
      ['answer', row.answer],
    ] as const;

    const missing = required.filter(([, value]) => !value || `${value}`.trim().length === 0);
    const missingKeys: string[] = missing.map(([key]) => key);

    if (missingKeys.length > 0) {
      throw new BadRequestException(
        `Line ${lineNumber}: 필수 필드 누락 - ${missingKeys.join(', ')}`,
      );
    }
  }

  /**
   * 유닛 개요 업로드 필수 필드를 검증한다.
   */
  private validateUnitOverviewRow(row: UnitOverviewJsonlRow, lineNumber: number): void {
    const required = [
      ['unit_title', row.unit_title],
      ['overview', row.overview],
    ] as const;

    const missing = required.filter(([, value]) => !value || `${value}`.trim().length === 0);
    const missingKeys: string[] = missing.map(([key]) => key);

    if (missingKeys.length > 0) {
      throw new BadRequestException(
        `Line ${lineNumber}: 필수 필드 누락 - ${missingKeys.join(', ')}`,
      );
    }
  }

  /** Field를 slug 기준으로 upsert한다. */
  private async upsertField(
    row: QuizJsonlRow,
    manager: EntityManager,
  ): Promise<UpsertResult<Field>> {
    const repository = manager.getRepository(Field);
    const slug = row.field_slug.trim();
    const name = row.field_name.trim();

    let field = await repository.findOne({ where: { slug } });
    if (!field) {
      field = repository.create({
        slug,
        name,
        description: row.field_description?.trim() ?? null,
      });
      await repository.save(field);
      return { entity: field, created: true };
    }

    let updated = false;
    if (field.name !== name) {
      field.name = name;
      updated = true;
    }
    const incomingDescription = row.field_description?.trim() ?? null;
    if (incomingDescription !== null && field.description !== incomingDescription) {
      field.description = incomingDescription;
      updated = true;
    }

    if (updated) {
      await repository.save(field);
    }

    return { entity: field, created: false, updated };
  }

  /**
   * 프로필 캐릭터를 image_url 기준으로 업서트한다.
   */
  private async upsertProfileCharacter(
    row: ProfileCharacterJsonlRow,
    manager: EntityManager,
    lineNumber?: number,
  ): Promise<UpsertResult<ProfileCharacter>> {
    const repository = manager.getRepository(ProfileCharacter);
    const imageUrl = row.image_url.trim();
    const priceDiamonds = Number(row.price_diamonds);
    const description = row.description?.trim() ?? null;
    const isActive = row.is_active ?? true;

    let character = await repository.findOne({ where: { imageUrl } });
    if (!character) {
      const name = this.buildProfileCharacterName(imageUrl, lineNumber);
      character = repository.create({
        name,
        imageUrl,
        priceDiamonds,
        description,
        isActive,
      });
      await repository.save(character);
      return { entity: character, created: true };
    }

    let updated = false;
    if (character.priceDiamonds !== priceDiamonds) {
      character.priceDiamonds = priceDiamonds;
      updated = true;
    }

    if ((character.description ?? null) !== description) {
      character.description = description;
      updated = true;
    }

    if (character.isActive !== isActive) {
      character.isActive = isActive;
      updated = true;
    }

    if (updated) {
      await repository.save(character);
    }

    return { entity: character, created: false, updated };
  }

  /**
   * 이름 입력을 받지 않는 운영 흐름을 위해 서버에서 관리용 이름을 생성한다.
   */
  private buildProfileCharacterName(imageUrl: string, lineNumber?: number): string {
    const fileName = imageUrl.split('/').pop();
    const splitFileName = (fileName ?? 'character').split('?');
    const safeFileName = (splitFileName.at(0) ?? 'character').trim();
    const baseName = safeFileName || 'character';

    if (lineNumber !== undefined) {
      return `character-${lineNumber}-${baseName}`.slice(0, 100);
    }

    return `character-${Date.now()}-${baseName}`.slice(0, 100);
  }

  /** Unit을 field + title 기준으로 upsert한다. */
  private async upsertUnit(
    row: QuizJsonlRow,
    field: Field,
    manager: EntityManager,
  ): Promise<UpsertResult<Unit>> {
    const repository = manager.getRepository(Unit);
    const title = row.unit_title.trim();
    let unit = await repository.findOne({
      where: { field: { id: field.id }, title },
    });

    if (!unit) {
      // order_index가 없으면 부모 개수 + 1로 자동 추가
      const orderIndex =
        this.toNumberOrNull(row.unit_order_index) ??
        (await repository.count({ where: { field: { id: field.id } } })) + 1;

      unit = repository.create({
        field,
        title,
        description: row.unit_description?.trim() ?? null,
        orderIndex,
      });

      await repository.save(unit);
      return { entity: unit, created: true };
    }

    let updated = false;
    const incomingDescription = row.unit_description?.trim() ?? null;
    if (incomingDescription !== null && unit.description !== incomingDescription) {
      unit.description = incomingDescription;
      updated = true;
    }

    const incomingOrderIndex = this.toNumberOrNull(row.unit_order_index);
    if (incomingOrderIndex !== null && incomingOrderIndex !== unit.orderIndex) {
      unit.orderIndex = incomingOrderIndex;
      updated = true;
    }

    if (updated) {
      await repository.save(unit);
    }

    return { entity: unit, created: false, updated };
  }

  /** Step을 unit + title 기준으로 upsert한다. */
  private async upsertStep(
    row: QuizJsonlRow,
    unit: Unit,
    manager: EntityManager,
  ): Promise<UpsertResult<Step>> {
    const repository = manager.getRepository(Step);
    const title = row.step_title.trim();
    let step = await repository.findOne({
      where: { unit: { id: unit.id }, title },
    });

    if (!step) {
      // order_index가 없으면 부모 개수 + 1로 자동 추가
      const orderIndex =
        this.toNumberOrNull(row.step_order_index) ??
        (await repository.count({ where: { unit: { id: unit.id } } })) + 1;

      const isCheckpoint = this.toBoolean(row.is_checkpoint ?? row.step_is_checkpoint);
      step = repository.create({
        unit,
        title,
        orderIndex,
        isCheckpoint,
      });
      await repository.save(step);
      return { entity: step, created: true };
    }

    let updated = false;
    const incomingOrderIndex = this.toNumberOrNull(row.step_order_index);
    if (incomingOrderIndex !== null && incomingOrderIndex !== step.orderIndex) {
      step.orderIndex = incomingOrderIndex;
      updated = true;
    }

    if (row.is_checkpoint !== undefined || row.step_is_checkpoint !== undefined) {
      const isCheckpoint = this.toBoolean(row.is_checkpoint ?? row.step_is_checkpoint);
      if (isCheckpoint !== step.isCheckpoint) {
        step.isCheckpoint = isCheckpoint;
        updated = true;
      }
    }

    if (updated) {
      await repository.save(step);
    }

    return { entity: step, created: false, updated };
  }

  /** Quiz를 step + question 기준으로 upsert한다. */
  private async upsertQuiz(
    row: QuizJsonlRow,
    step: Step,
    manager: EntityManager,
    lineNumber: number,
  ): Promise<UpsertResult<Quiz>> {
    const repository = manager.getRepository(Quiz);
    const normalizedContent = this.normalizeContent(row, lineNumber);
    const normalizedAnswer = this.normalizeJsonValue(row.answer, 'answer', lineNumber);
    const difficulty = this.toDifficulty(row.difficulty);

    let quiz = await repository.findOne({
      where: {
        step: { id: step.id },
        question: row.question.trim(),
      },
    });

    if (!quiz) {
      quiz = repository.create({
        step,
        type: row.type.trim(),
        question: row.question.trim(),
        content: normalizedContent,
        answer: normalizedAnswer,
        explanation: row.explanation?.trim() ?? null,
        difficulty,
      });
      await repository.save(quiz);
      return { entity: quiz, created: true };
    }

    quiz.type = row.type.trim();
    quiz.content = normalizedContent;
    quiz.answer = normalizedAnswer;
    quiz.explanation = row.explanation?.trim() ?? null;
    quiz.difficulty = difficulty;
    await repository.save(quiz);

    return { entity: quiz, created: false, updated: true };
  }

  /**
   * 문자열/객체 값을 JSON 형태로 정규화한다.
   * 문자열은 JSON.parse를 시도하고 실패 시 { value }로 감싼다.
   */
  private normalizeJsonValue(value: unknown, fieldName: string, lineNumber: number): unknown {
    if (value === undefined || value === null) {
      throw new BadRequestException(`Line ${lineNumber}: ${fieldName} 값이 비어 있습니다.`);
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (parsed !== null && typeof parsed === 'object') {
          return parsed;
        }
        return { value: parsed };
      } catch {
        return { value };
      }
    }

    if (typeof value === 'object') {
      return value;
    }

    throw new BadRequestException(
      `Line ${lineNumber}: ${fieldName} 값이 JSON으로 변환되지 않습니다.`,
    );
  }

  /** content를 JSON 형태로 정규화한다. */
  private normalizeContent(row: QuizJsonlRow, lineNumber: number): unknown {
    const rawContent = row.content;
    return this.normalizeJsonValue(rawContent, 'content', lineNumber);
  }

  /** 숫자 변환 실패 시 null을 반환한다. */
  private toNumberOrNull(value?: number | string | null): number | null {
    if (value === undefined || value === null) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  /** 문자열/숫자 형태의 boolean을 안전하게 변환한다. */
  private toBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return ['true', '1', 'yes'].includes(value.toLowerCase().trim());
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return false;
  }

  /** 난이도를 1~5 범위로 정규화한다. */
  private toDifficulty(rawDifficulty?: number): number {
    const parsed = this.toNumberOrNull(rawDifficulty) ?? 1;
    if (!Number.isFinite(parsed)) {
      return 1;
    }
    const clamped = Math.max(1, Math.min(5, parsed));
    return Math.trunc(clamped);
  }
}
