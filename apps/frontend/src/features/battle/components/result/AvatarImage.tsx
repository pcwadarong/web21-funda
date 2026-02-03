import { css } from '@emotion/react';

interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
}

export const AvatarImage = ({ src, alt, size = 'medium' }: AvatarImageProps) => {
  const sizeMap = {
    small: '44px',
    medium: '150px',
    large: '200px',
  };

  return (
    <div css={avatarWrapperStyle(sizeMap[size])}>
      {src ? (
        <img src={src} alt={alt} css={imageStyle} />
      ) : (
        <div css={fallbackStyle(sizeMap[size])}>👤</div>
      )}
    </div>
  );
};

const avatarWrapperStyle = (size: string) => css`
  width: ${size};
  height: ${size};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const imageStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const fallbackStyle = (size: string) => css`
  font-size: ${size === '44px' ? '24px' : size === '150px' ? '80px' : '100px'};
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
