import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { audioManager } from '@/utils/audioManager';

interface AudioControlsProps {
  isPlaying: boolean;
}

const AudioControls: React.FC<AudioControlsProps> = ({ isPlaying }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sfxVolume, setSfxVolume] = useState(audioManager.sfxVolume * 100);
  const [musicVolume, setMusicVolume] = useState(audioManager.musicVolume * 100);
  const [isMuted, setIsMuted] = useState(audioManager.isMuted);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initAudio = async () => {
      await audioManager.init();
      await audioManager.resume();
    };
    initAudio();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioManager.startBackgroundMusic();
    } else {
      audioManager.stopBackgroundMusic();
    }
  }, [isPlaying]);

  // Close panel when clicking outside
  useEffect(() => {
    if (!isExpanded) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick as any);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick as any);
    };
  }, [isExpanded]);

  const handleSfxChange = (value: number[]) => {
    const vol = value[0];
    setSfxVolume(vol);
    audioManager.sfxVolume = vol / 100;
  };

  const handleMusicChange = (value: number[]) => {
    const vol = value[0];
    setMusicVolume(vol);
    audioManager.musicVolume = vol / 100;
  };

  const toggleMute = () => {
    audioManager.toggleMute();
    setIsMuted(audioManager.isMuted);
  };

  return (
    <div className="fixed top-4 right-4 z-50" ref={panelRef}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border hover:bg-background transition-colors"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        ) : (
          <Volume2 className="w-5 h-5 text-neon-cyan" />
        )}
      </button>

      {isExpanded && (
        <div className="absolute top-12 right-0 w-48 p-4 rounded-lg bg-background/95 backdrop-blur border border-border shadow-lg space-y-4">
          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <span className="font-game text-sm text-foreground">
              {isMuted ? 'Unmute' : 'Mute All'}
            </span>
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Volume2 className="w-4 h-4 text-neon-cyan" />
            )}
          </button>

          {/* SFX Volume */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-yellow" />
              <span className="font-game text-xs text-foreground">SFX</span>
              <span className="ml-auto font-display text-xs text-muted-foreground">
                {Math.round(sfxVolume)}%
              </span>
            </div>
            <Slider
              value={[sfxVolume]}
              onValueChange={handleSfxChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-neon-magenta" />
              <span className="font-game text-xs text-foreground">Music</span>
              <span className="ml-auto font-display text-xs text-muted-foreground">
                {Math.round(musicVolume)}%
              </span>
            </div>
            <Slider
              value={[musicVolume]}
              onValueChange={handleMusicChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioControls;
