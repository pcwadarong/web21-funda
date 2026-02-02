import { ApiProperty } from '@nestjs/swagger';

export interface UploadedProfileCharacterFile {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
  size?: number;
}

export interface ProfileCharacterJsonlRow {
  image_url: string;
  price_diamonds: number;
  description?: string;
  is_active?: boolean;
  name?: string;
}

export interface ProfileCharacterUploadSummary {
  processed: number;
  charactersCreated: number;
  charactersUpdated: number;
}

export class ProfileCharactersUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: '업로드할 프로필 캐릭터 JSONL 파일',
  })
  file!: UploadedProfileCharacterFile[];
}
