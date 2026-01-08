import type React from 'react';

import { IconMap, type IconMapTypes, IconSizes, type IconSizeTypes } from '@/constants/icons';

interface SVGIconProps {
  icon: IconMapTypes;
  size?: IconSizeTypes;
  color?: string;
  variant?: 'solid' | 'outline';
  className?: string;
  style?: React.CSSProperties;
}

const SVGIcon: React.FC<SVGIconProps> = ({
  icon,
  size = 'md',
  variant = 'outline',
  style,
  className,
}) => {
  const iconName = `${icon}${variant === 'solid' ? 'Solid' : ''}`;
  const Icon = IconMap[iconName as IconMapTypes];

  const iconSize = size ? IconSizes[size] : undefined;

  if (!Icon) return null;

  return (
    <Icon
      className={className}
      style={{
        width: iconSize,
        height: iconSize,
        ...style,
      }}
    />
  );
};

export default SVGIcon;
