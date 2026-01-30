import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { ProfileService } from './profile.service';

@ApiTags('Profile')
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':userId')
  @ApiOperation({
    summary: '프로필 요약 조회',
    description: '프로필 기본 정보와 통계 요약을 반환한다.',
  })
  @ApiOkResponse({ description: '프로필 요약 조회 성공' })
  async getProfileSummary(@Param('userId', ParseIntPipe) userId: number) {
    const result = await this.profileService.getProfileSummary(userId);

    return {
      result,
      message: '프로필 요약 정보를 조회했습니다.',
    };
  }

  @Get(':userId/followers')
  @ApiOperation({
    summary: '팔로워 목록 조회',
    description: '해당 사용자를 팔로우하는 사용자 목록을 반환한다.',
  })
  @ApiOkResponse({ description: '팔로워 목록 조회 성공' })
  async getFollowers(@Param('userId', ParseIntPipe) userId: number) {
    const result = await this.profileService.getFollowers(userId);

    return {
      result,
      message: '팔로워 목록을 조회했습니다.',
    };
  }

  @Get(':userId/following')
  @ApiOperation({
    summary: '팔로잉 목록 조회',
    description: '해당 사용자가 팔로우하는 사용자 목록을 반환한다.',
  })
  @ApiOkResponse({ description: '팔로잉 목록 조회 성공' })
  async getFollowing(@Param('userId', ParseIntPipe) userId: number) {
    const result = await this.profileService.getFollowing(userId);

    return {
      result,
      message: '팔로잉 목록을 조회했습니다.',
    };
  }

  @Post(':userId/follow')
  @ApiOperation({
    summary: '팔로우',
    description: '대상 사용자를 팔로우한다.',
  })
  @ApiOkResponse({ description: '팔로우 성공' })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async followUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    const followerUserId = req.user?.sub;
    if (followerUserId === undefined || followerUserId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    const result = await this.profileService.followUser(userId, followerUserId);

    return {
      result,
      message: '팔로우했습니다.',
    };
  }

  @Delete(':userId/follow')
  @ApiOperation({
    summary: '언팔로우',
    description: '대상 사용자를 언팔로우한다.',
  })
  @ApiOkResponse({ description: '언팔로우 성공' })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async unfollowUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    const followerUserId = req.user?.sub;
    if (followerUserId === undefined || followerUserId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    const result = await this.profileService.unfollowUser(userId, followerUserId);

    return {
      result,
      message: '언팔로우했습니다.',
    };
  }

  @Get('me/characters')
  @ApiOperation({
    summary: '내 프로필 캐릭터 목록 조회',
    description: '사용 가능한 캐릭터 목록과 구매/적용 정보를 반환한다.',
  })
  @ApiOkResponse({ description: '캐릭터 목록 조회 성공' })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async getMyProfileCharacters(@Req() req: Request & { user?: JwtPayload }) {
    const userId = req.user?.sub;
    if (userId === undefined || userId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    const result = await this.profileService.getProfileCharacters(userId);

    return {
      result,
      message: '프로필 캐릭터 목록을 조회했습니다.',
    };
  }

  @Post('me/characters/:characterId/purchase')
  @ApiOperation({
    summary: '프로필 캐릭터 구매',
    description: '선택한 캐릭터를 구매한다.',
  })
  @ApiOkResponse({ description: '캐릭터 구매 성공' })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async purchaseCharacter(
    @Param('characterId', ParseIntPipe) characterId: number,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    const userId = req.user?.sub;
    if (userId === undefined || userId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    const result = await this.profileService.purchaseProfileCharacter(userId, characterId);

    return {
      result,
      message: '프로필 캐릭터를 구매했습니다.',
    };
  }

  @Post('me/characters/:characterId/apply')
  @ApiOperation({
    summary: '프로필 캐릭터 적용',
    description: '구매한 캐릭터를 프로필에 적용한다.',
  })
  @ApiOkResponse({ description: '캐릭터 적용 성공' })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async applyCharacter(
    @Param('characterId', ParseIntPipe) characterId: number,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    const userId = req.user?.sub;
    if (userId === undefined || userId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    const result = await this.profileService.applyProfileCharacter(userId, characterId);

    return {
      result,
      message: '프로필 캐릭터를 적용했습니다.',
    };
  }

  @Post('me/characters/clear')
  @ApiOperation({
    summary: '프로필 캐릭터 적용 해제',
    description: '프로필 캐릭터 적용을 해제하고 기본 프로필로 되돌린다.',
  })
  @ApiOkResponse({ description: '캐릭터 적용 해제 성공' })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async clearCharacter(@Req() req: Request & { user?: JwtPayload }) {
    const userId = req.user?.sub;
    if (userId === undefined || userId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    const result = await this.profileService.clearProfileCharacter(userId);

    return {
      result,
      message: '프로필 캐릭터 적용을 해제했습니다.',
    };
  }
}
