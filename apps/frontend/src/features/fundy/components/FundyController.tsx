import styled from '@emotion/styled';

import { type AnimKey, CONTROL_CATEGORIES, MOUTH_OPTIONS } from '@/feat/fundy/constants';
import type { FundyAnimationConfig } from '@/feat/fundy/types';

type FundyControllerProps = {
  animation: FundyAnimationConfig;
  onToggle: (key: AnimKey, value: boolean) => void;
  onSetMouth: (value: FundyAnimationConfig['openMouth']) => void;
  onSpeedChange: (value: number) => void;
  onPlayHello: () => void;
};

export function FundyController({
  animation,
  onToggle,
  onSetMouth,
  onSpeedChange,
  onPlayHello,
}: FundyControllerProps) {
  return (
    <ControlPanel>
      <Title>Fundy Controller</Title>

      {CONTROL_CATEGORIES.map(cat => (
        <Section key={cat.title}>
          <SectionTitle>{cat.title}</SectionTitle>
          {cat.items.map(item => (
            <ControlLabel key={item.key}>
              <input
                type="checkbox"
                checked={!!animation[item.key]}
                onChange={e => onToggle(item.key, e.target.checked)}
              />
              {item.icon} {item.label}
            </ControlLabel>
          ))}
        </Section>
      ))}

      <Section>
        <SectionTitle>입 모양</SectionTitle>
        {MOUTH_OPTIONS.map(opt => (
          <ControlLabel key={String(opt.value)}>
            <input
              type="radio"
              name="mouth"
              checked={animation.openMouth === opt.value}
              onChange={() => onSetMouth(opt.value)}
            />
            {opt.icon} {opt.label}
          </ControlLabel>
        ))}
      </Section>

      <Section>
        <SectionTitle>속도 조절 ({(animation.speedMultiplier ?? 1).toFixed(1)}x)</SectionTitle>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={animation.speedMultiplier ?? 1}
          onChange={e => onSpeedChange(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </Section>

      <Section>
        <SectionTitle>액션</SectionTitle>
        <PlayButton type="button" onClick={onPlayHello}>
          ▶ Hello 액션 재생
        </PlayButton>
      </Section>
    </ControlPanel>
  );
}

const ControlPanel = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  width: 260px;
  max-height: 90vh;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  font-family: 'system-ui', sans-serif;
  font-size: 13px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Section = styled.div`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  font-size: 11px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid #333;
`;

const ControlLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    opacity: 0.7;
  }
  input {
    cursor: pointer;
    margin: 0;
  }
`;

const PlayButton = styled.button`
  width: 100%;
  border: 1px solid #444;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.2));
  color: #fff;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  &:hover {
    border-color: #666;
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
    opacity: 0.9;
  }
`;
