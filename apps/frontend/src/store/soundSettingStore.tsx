import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

interface SoundSettingContextType {
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
}

const STORAGE_KEY = 'sound-volume';
const DEFAULT_VOLUME = 1;

const SoundSettingContext = createContext<SoundSettingContextType | undefined>(undefined);

const clampVolume = (volume: number): number => {
  if (Number.isNaN(volume)) {
    return DEFAULT_VOLUME;
  }

  if (volume < 0) {
    return 0;
  }

  if (volume > 1) {
    return 1;
  }

  return volume;
};

const getInitialVolume = (): number => {
  if (typeof window === 'undefined') {
    return DEFAULT_VOLUME;
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return DEFAULT_VOLUME;
  }

  return clampVolume(Number(saved));
};

export const SoundSettingStoreProvider = ({ children }: { children: ReactNode }) => {
  const [soundVolume, setSoundVolumeState] = useState(getInitialVolume);

  const setSoundVolume = useCallback((volume: number) => {
    const normalizedVolume = clampVolume(volume);
    setSoundVolumeState(normalizedVolume);
    localStorage.setItem(STORAGE_KEY, String(normalizedVolume));
  }, []);

  return (
    <SoundSettingContext.Provider value={{ soundVolume, setSoundVolume }}>
      {children}
    </SoundSettingContext.Provider>
  );
};

export const useSoundSettingStore = () => {
  const context = useContext(SoundSettingContext);
  if (!context) {
    throw new Error('useSoundSettingStore must be used within SoundSettingStoreProvider');
  }
  return context;
};
