import { css } from '@emotion/react';
import type React from 'react';

import { IconMap, type IconMapTypes, IconSizes, type IconSizeTypes } from '@/constants/icons';

interface SVGIconProps {
  icon: IconMapTypes;
  size?: IconSizeTypes;
  color?: string;
  variant?: 'solid' | 'outline';
  className?: string;
}

const SVGIcon: React.FC<SVGIconProps> = ({
  icon,
  size = 'md',
  variant = 'outline',
  color,
  className,
}) => {
  const iconName = `${icon}${variant === 'solid' ? 'Solid' : ''}`;

  const Icon = IconMap[iconName as IconMapTypes];
  const iconSize = IconSizes[size];

  if (!Icon) return null;

  return (
    <Icon
      css={color ? svgColorStyle(color) : undefined}
      width={iconSize}
      height={iconSize}
      className={className}
    />
  );
};

const svgColorStyle = (color: string) => css`
  color: ${color};
  path,
  circle,
  rect,
  line,
  polygon {
    fill: currentColor;
    stroke: currentColor;
  }
`;

export default SVGIcon;
