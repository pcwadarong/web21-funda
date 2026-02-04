import type { SerializedStyles } from '@emotion/react';
import { css, useTheme } from '@emotion/react';

import type { Theme } from '@/styles/theme';

export type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  /** 프로필 이미지 URL */
  src?: string | null;
  /** 사용자 이름 (아바타 텍스트 생성용) */
  name: string;
  /** 아바타 크기 */
  size?: AvatarSize;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 추가 스타일 (css prop) */
  css?: SerializedStyles;
  /** alt 텍스트 */
  alt?: string;
}

const getAvatarLabel = (displayName: string): string => {
  const trimmedName = displayName.trim();
  return trimmedName ? trimmedName.charAt(0).toUpperCase() : '?';
};

const sizeMap: Record<AvatarSize, { size: string; fontSize: string }> = {
  sm: { size: '40px', fontSize: '12px' },
  md: { size: '88px', fontSize: '24px' },
  lg: { size: '150px', fontSize: '80px' },
};

export const Avatar = ({ src, name, size = 'md', className, css: customCss, alt }: AvatarProps) => {
  const theme = useTheme();
  const { size: avatarSize, fontSize } = sizeMap[size];
  const avatarLabel = getAvatarLabel(name);

  return (
    <div css={[avatarStyle(theme, avatarSize), customCss]} className={className}>
      {src ? (
        <img src={src} alt={alt || `${name} 프로필`} css={avatarImageStyle} />
      ) : (
        <span css={avatarTextStyle(theme, fontSize)}>{avatarLabel}</span>
      )}
    </div>
  );
};

const avatarStyle = (theme: Theme, size: string) => css`
  width: ${size};
  height: ${size};
  border-radius: 50%;
  background: ${theme.colors.surface.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid ${theme.colors.border.default};
`;

const avatarImageStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const avatarTextStyle = (theme: Theme, fontSize: string) => css`
  font-size: ${fontSize};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.primary.dark};
  line-height: 1;
`;
