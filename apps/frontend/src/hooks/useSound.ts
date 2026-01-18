import { useStorage } from '@/hooks/useStorage';

/**
 * 사운드 재생에 필요한 파라미터들입니다.
 */
interface PlaySoundParams {
  src: string;
  volume?: number; // 0.0~1.0
  currentTime?: number;
  playbackRate?: number; // 0.5~4.0
}

const audioBufferCache = new Map<string, AudioBuffer>();
let sharedAudioContext: AudioContext | null = null;

/**
 * 브라우저가 지원하면 공유 AudioContext 인스턴스를 반환합니다.
 */
const getAudioContext = () => {
  if (sharedAudioContext) return sharedAudioContext;
  const AudioContextCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  sharedAudioContext = new AudioContextCtor();
  return sharedAudioContext;
};

/**
 * 오디오 버퍼를 로딩하고 캐시에 저장한다.
 *
 * @param {string} src 오디오 리소스 경로
 * @returns {Promise<AudioBuffer | null>} 로딩 성공 시 AudioBuffer, 실패 시 null
 */
const loadAudioBuffer = async (src: string): Promise<AudioBuffer | null> => {
  const audioContext = getAudioContext();
  if (!audioContext) {
    return null;
  }

  const cachedBuffer = audioBufferCache.get(src);
  if (cachedBuffer) {
    return cachedBuffer;
  }

  try {
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferCache.set(src, buffer);
    return buffer;
  } catch (error) {
    console.error('Failed to load sound:', error);
    return null;
  }
};

/**
 * Web Audio를 우선 사용하고, 지원하지 않으면 HTMLAudio로 재생합니다.
 */
export const useSound = () => {
  const { soundVolume } = useStorage();

  /**
   * 사운드 리소스를 미리 로딩한다.
   *
   * @param {string} src 오디오 리소스 경로
   * @returns {Promise<boolean>} 로딩 성공 여부
   */
  const preloadSound = async (src: string): Promise<boolean> => {
    const audioContext = getAudioContext();
    if (!audioContext) {
      return true;
    }

    const buffer = await loadAudioBuffer(src);
    return buffer !== null;
  };

  /**
   * AudioContext가 즉시 재생 가능한 상태인지 확인한다.
   *
   * @returns {boolean} 재생 가능 상태라면 true
   */
  const isAudioContextReady = (): boolean => {
    const audioContext = getAudioContext();
    if (!audioContext) {
      return true;
    }

    return audioContext.state === 'running';
  };

  /**
   * AudioContext를 사용자 제스처 이후 사용 가능 상태로 만든다.
   *
   * @returns {Promise<boolean>} 준비 완료 여부
   */
  const resumeAudioContext = async (): Promise<boolean> => {
    const audioContext = getAudioContext();
    if (!audioContext) {
      return true;
    }

    if (audioContext.state !== 'suspended') {
      return true;
    }

    try {
      await audioContext.resume();
      return true;
    } catch (error) {
      console.error('Failed to resume audio context:', error);
      return false;
    }
  };

  /**
   * 사운드를 재생합니다.
   * @param src 재생할 오디오 리소스 경로
   * @param volume 재생 볼륨 (0.0~1.0) -> 기본값 0.7
   * @param currentTime 재생 시작 위치(초)
   * @param playbackRate 재생 속도/피치 (1.0이 기본)
   */
  const playSound = async ({
    src,
    volume = 0.7,
    currentTime = 0,
    playbackRate = 1,
  }: PlaySoundParams) => {
    const baseVolume = Math.min(Math.max(volume, 0), 1);
    const finalVolume = Math.min(Math.max(baseVolume * soundVolume, 0), 1);
    const audioContext = getAudioContext();
    if (!audioContext) {
      const audio = new Audio(src);
      audio.volume = finalVolume;
      audio.currentTime = currentTime;
      audio.playbackRate = playbackRate;
      audio.play().catch(error => {
        console.error('Failed to play sound:', error);
      });
      return;
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const buffer = await loadAudioBuffer(src);
    if (!buffer) {
      return;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = finalVolume;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const safeTime = Math.min(Math.max(currentTime, 0), buffer.duration);
    source.start(0, safeTime);
  };

  return { playSound, preloadSound, resumeAudioContext, isAudioContextReady };
};
