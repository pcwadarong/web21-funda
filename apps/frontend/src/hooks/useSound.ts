/**
 * 사운드 재생에 필요한 파라미터들입니다.
 */
interface PlaySoundParams {
  src: string;
  volume?: number; // 0.0~1.0
  currentTime?: number;
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
 * Web Audio를 우선 사용하고, 지원하지 않으면 HTMLAudio로 재생합니다.
 */
export const useSound = () => {
  /**
   * 사운드를 재생합니다.
   * @param src 재생할 오디오 리소스 경로
   * @param volume 재생 볼륨 (0.0~1.0) -> 기본값 0.7
   * @param currentTime 재생 시작 위치(초)
   */
  const playSound = async ({ src, volume = 0.7, currentTime = 0 }: PlaySoundParams) => {
    const audioContext = getAudioContext();
    if (!audioContext) {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.currentTime = currentTime;
      audio.play().catch(error => {
        console.error('Failed to play sound:', error);
      });
      return;
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    let buffer = audioBufferCache.get(src);
    if (!buffer) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      buffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBufferCache.set(src, buffer);
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const safeTime = Math.min(Math.max(currentTime, 0), buffer.duration);
    source.start(0, safeTime);
  };

  return { playSound };
};
