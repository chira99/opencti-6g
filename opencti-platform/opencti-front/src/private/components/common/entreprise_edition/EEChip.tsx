import React, { CSSProperties } from 'react';

interface EEChipProps {
  feature?: string;
  size?: 'md' | 'sm';
  clickable?: boolean;
  style?: CSSProperties;
}

// Retain the shared call-site/ref contract without exposing an Enterprise promotion.
const EEChip = React.forwardRef<HTMLElement, EEChipProps>((_props, _ref) => null);

EEChip.displayName = 'EEChip';

export default EEChip;
