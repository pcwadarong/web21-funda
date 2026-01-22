import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useSound Hook', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('Web Audio 지원 환경에서 지정한 시점부터 재생한다', async () => {
    // Web Audio 환경과 fetch 응답이 준비됨
    const startMock = vi.fn();
    const sourceMock = {
      buffer: null as AudioBuffer | null,
      connect: vi.fn(),
      start: startMock,
    };
    const gainMock = {
      gain: { value: 1 },
      connect: vi.fn(),
    };
    class FakeAudioContext {
      static lastInstance: FakeAudioContext | null = null;
      constructor() {
        FakeAudioContext.lastInstance = this;
      }
      state = 'running';
      resume = vi.fn().mockResolvedValue(undefined);
      decodeAudioData = vi.fn().mockResolvedValue({ duration: 3 } as AudioBuffer);
      createBufferSource = vi.fn(() => sourceMock);
      createGain = vi.fn(() => gainMock);
      destination = {};
    }

    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      }),
    );

    const { useSound } = await import('./useSound');
    const { result } = renderHook(() => useSound());

    // 재생 요청
    await act(async () => {
      await result.current.playSound({ src: '/test.mp3', volume: 0.3, currentTime: 0.5 });
    });

    // 오프셋 0.5초로 재생한다
    expect(FakeAudioContext.lastInstance?.decodeAudioData).toHaveBeenCalled();
    expect(sourceMock.start).toHaveBeenCalledWith(0, 0.5);
    expect(gainMock.gain.value).toBe(0.3);
  });

  it('Web Audio 미지원 환경에서는 HTMLAudio로 재생한다', async () => {
    // AudioContext가 없는 환경
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', undefined);

    const playMock = vi.fn().mockResolvedValue(undefined);
    const audioInstance = {
      volume: 0,
      currentTime: 0,
      play: playMock,
    };
    class FakeAudio {
      static lastInstance: FakeAudio | null = null;
      volume = audioInstance.volume;
      currentTime = audioInstance.currentTime;
      play = playMock;
      constructor(_src: string) {
        FakeAudio.lastInstance = this;
      }
    }
    const AudioMock = vi.fn(FakeAudio as unknown as () => FakeAudio);
    vi.stubGlobal('Audio', AudioMock);

    const { useSound } = await import('./useSound');
    const { result } = renderHook(() => useSound());

    // 재생 요청
    await act(async () => {
      await result.current.playSound({ src: '/test.mp3', volume: 0.8, currentTime: 0.5 });
    });

    // HTMLAudio로 설정 후 재생한다
    expect(AudioMock).toHaveBeenCalledWith('/test.mp3');
    expect(FakeAudio.lastInstance?.volume).toBe(0.8);
    expect(FakeAudio.lastInstance?.currentTime).toBe(0.5);
    expect(playMock).toHaveBeenCalled();
  });
});
