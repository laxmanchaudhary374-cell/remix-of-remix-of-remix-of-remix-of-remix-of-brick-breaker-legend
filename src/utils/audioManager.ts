// Audio Manager for game sound effects and music
// Uses Web Audio API for crisp, low-latency game sounds

class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private backgroundMusic: AudioBufferSourceNode | null = null;
  private musicBuffer: AudioBuffer | null = null;
  private isInitialized = false;
  private isMusicPlaying = false;

  // Volume settings (0-1)
  private _sfxVolume = 0.7;
  private _musicVolume = 0.4;
  private _masterVolume = 1.0;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.masterGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();

      // Connect: sfx/music -> master -> destination
      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      // Set initial volumes
      this.masterGain.gain.value = this._masterVolume;
      this.sfxGain.gain.value = this._sfxVolume;
      this.musicGain.gain.value = this._musicVolume;

      this.isInitialized = true;
      
      // Listen for visibility changes to pause/resume music
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }
  
  // Handle app minimize/tab switch
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // App is minimized/hidden - pause music
      if (this.backgroundMusic && this.isMusicPlaying) {
        this.backgroundMusic.stop();
        this.backgroundMusic = null;
      }
    } else {
      // App is visible again - resume music if it was playing
      if (this.isMusicPlaying && this._musicVolume > 0) {
        this.playMusicFromBuffer();
      }
    }
  }

  // Resume audio context (needed after user interaction)
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Generate synthetic sound effects
  private playSynth(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    fadeOut: boolean = true,
    detune: number = 0
  ): void {
    if (!this.audioContext || !this.sfxGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);
    
    if (fadeOut) {
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    }

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Sound: Ball hits paddle
  playPaddleHit(): void {
    if (!this.audioContext) return;
    this.playSynth(400, 0.08, 'square', true);
    this.playSynth(600, 0.06, 'sine', true, 10);
  }

  // Sound: Ball hits brick
  playBrickHit(): void {
    if (!this.audioContext) return;
    const pitch = 300 + Math.random() * 200;
    this.playSynth(pitch, 0.1, 'square', true);
  }

  // Sound: Brick destroyed
  playBrickDestroy(): void {
    if (!this.audioContext) return;
    this.playSynth(500, 0.15, 'sawtooth', true);
    this.playSynth(700, 0.1, 'sine', true, 20);
    setTimeout(() => this.playSynth(350, 0.1, 'triangle', true), 30);
  }

  // Sound: Power-up collected (positive)
  playPowerUp(): void {
    if (!this.audioContext) return;
    this.playSynth(500, 0.1, 'sine', true);
    setTimeout(() => this.playSynth(700, 0.1, 'sine', true), 50);
    setTimeout(() => this.playSynth(900, 0.15, 'sine', true), 100);
  }

  // Sound: Power-up collected (negative)
  playPowerDown(): void {
    if (!this.audioContext) return;
    this.playSynth(400, 0.1, 'square', true);
    setTimeout(() => this.playSynth(300, 0.1, 'square', true), 50);
    setTimeout(() => this.playSynth(200, 0.15, 'square', true), 100);
  }

  // Sound: Extra life
  playExtraLife(): void {
    if (!this.audioContext) return;
    const melody = [523, 659, 784, 1047]; // C5, E5, G5, C6
    melody.forEach((freq, i) => {
      setTimeout(() => this.playSynth(freq, 0.15, 'sine', true), i * 80);
    });
  }

  // Sound: Ball lost
  playBallLost(): void {
    if (!this.audioContext) return;
    this.playSynth(300, 0.2, 'sawtooth', true);
    setTimeout(() => this.playSynth(200, 0.3, 'sawtooth', true), 100);
    setTimeout(() => this.playSynth(100, 0.4, 'sawtooth', true), 200);
  }

  // Sound: Wall bounce
  playWallBounce(): void {
    if (!this.audioContext) return;
    this.playSynth(250, 0.05, 'triangle', true);
  }

  // Sound: Explosion
  playExplosion(): void {
    if (!this.audioContext || !this.sfxGain) return;
    
    // White noise burst for explosion
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.4;
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);
    
    noise.start();
    
    // Add low frequency rumble
    this.playSynth(60, 0.3, 'sine', true);
    this.playSynth(100, 0.2, 'triangle', true);
  }

  // Sound: Laser shot
  playLaser(): void {
    if (!this.audioContext) return;
    this.playSynth(1000, 0.08, 'sawtooth', true);
    this.playSynth(800, 0.06, 'square', true, 50);
  }

  // Sound: Level complete
  playLevelComplete(): void {
    if (!this.audioContext) return;
    const melody = [523, 659, 784, 880, 1047, 1319]; // Victory fanfare
    melody.forEach((freq, i) => {
      setTimeout(() => this.playSynth(freq, 0.2, 'sine', true), i * 100);
    });
  }

  // Sound: Game over
  playGameOver(): void {
    if (!this.audioContext) return;
    const melody = [440, 392, 349, 330, 294, 262]; // Descending
    melody.forEach((freq, i) => {
      setTimeout(() => this.playSynth(freq, 0.3, 'sawtooth', true), i * 150);
    });
  }

  // Sound: Combo hit
  playCombo(comboLevel: number): void {
    if (!this.audioContext) return;
    const baseFreq = 400 + comboLevel * 50;
    this.playSynth(baseFreq, 0.1, 'sine', true);
    this.playSynth(baseFreq * 1.5, 0.08, 'triangle', true);
  }

  // Sound: Coin collected
  playCoinCollect(): void {
    if (!this.audioContext) return;
    this.playSynth(1200, 0.05, 'sine', true);
    setTimeout(() => this.playSynth(1500, 0.08, 'sine', true), 30);
  }

  // Sound: Magnet catch
  playMagnetCatch(): void {
    if (!this.audioContext) return;
    this.playSynth(600, 0.1, 'sine', true);
    this.playSynth(500, 0.15, 'sine', true);
  }

  // Sound: Magnet release
  playMagnetRelease(): void {
    if (!this.audioContext) return;
    this.playSynth(400, 0.08, 'triangle', true);
    this.playSynth(600, 0.1, 'sine', true);
  }

  // Start background music from MP3 file
  async startBackgroundMusic(): Promise<void> {
    if (!this.audioContext || !this.musicGain || this.isMusicPlaying) return;

    this.isMusicPlaying = true;

    try {
      // Load the MP3 file if not already loaded
      if (!this.musicBuffer) {
        const response = await fetch('/audio/background-music.mp3');
        const arrayBuffer = await response.arrayBuffer();
        this.musicBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      }

      this.playMusicFromBuffer();
    } catch (e) {
      console.warn('Failed to load background music:', e);
      // Fallback to procedural music
      this.playProceduralMusicLoop();
    }
  }

  private playMusicFromBuffer(): void {
    if (!this.audioContext || !this.musicGain || !this.musicBuffer || !this.isMusicPlaying) return;

    // Stop any existing music
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    this.backgroundMusic = this.audioContext.createBufferSource();
    this.backgroundMusic.buffer = this.musicBuffer;
    this.backgroundMusic.loop = true;
    this.backgroundMusic.connect(this.musicGain);
    this.backgroundMusic.start();
  }

  private playProceduralMusicLoop(): void {
    if (!this.audioContext || !this.musicGain || !this.isMusicPlaying) return;

    // Simple procedural bass and melody pattern (fallback)
    const bassNotes = [65, 82, 73, 87];
    const melodyNotes = [262, 330, 294, 349, 392, 330, 294, 262];

    const bpm = 120;
    const beatDuration = 60 / bpm;

    bassNotes.forEach((freq, i) => {
      setTimeout(() => {
        if (this.isMusicPlaying && this.audioContext && this.musicGain) {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(this.musicGain);
          gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + beatDuration * 0.8);
          osc.start();
          osc.stop(this.audioContext.currentTime + beatDuration);
        }
      }, i * beatDuration * 1000);
    });

    melodyNotes.forEach((freq, i) => {
      setTimeout(() => {
        if (this.isMusicPlaying && this.audioContext && this.musicGain) {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(this.musicGain);
          gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + beatDuration * 0.4);
          osc.start();
          osc.stop(this.audioContext.currentTime + beatDuration * 0.5);
        }
      }, i * beatDuration * 500);
    });

    setTimeout(() => {
      if (this.isMusicPlaying) {
        this.playProceduralMusicLoop();
      }
    }, bassNotes.length * beatDuration * 1000);
  }

  stopBackgroundMusic(): void {
    this.isMusicPlaying = false;
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
    }
  }

  // Volume controls
  get sfxVolume(): number {
    return this._sfxVolume;
  }

  set sfxVolume(value: number) {
    this._sfxVolume = Math.max(0, Math.min(1, value));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this._sfxVolume;
    }
  }

  get musicVolume(): number {
    return this._musicVolume;
  }

  set musicVolume(value: number) {
    this._musicVolume = Math.max(0, Math.min(1, value));
    if (this.musicGain) {
      this.musicGain.gain.value = this._musicVolume;
    }
    // Stop music completely when volume is 0 or very low
    if (this._musicVolume <= 0.01) {
      if (this.backgroundMusic) {
        try {
          this.backgroundMusic.stop();
        } catch (e) {
          // Ignore if already stopped
        }
        this.backgroundMusic = null;
      }
    } else if (this._musicVolume > 0.01 && this.isMusicPlaying && !this.backgroundMusic && !document.hidden) {
      // Restart music if volume goes back up and app is visible
      this.playMusicFromBuffer();
    }
  }

  get masterVolume(): number {
    return this._masterVolume;
  }

  set masterVolume(value: number) {
    this._masterVolume = Math.max(0, Math.min(1, value));
    if (this.masterGain) {
      this.masterGain.gain.value = this._masterVolume;
    }
  }

  get isMuted(): boolean {
    return this._masterVolume === 0;
  }

  toggleMute(): void {
    if (this._masterVolume > 0) {
      this._masterVolume = 0;
    } else {
      this._masterVolume = 1;
    }
    if (this.masterGain) {
      this.masterGain.gain.value = this._masterVolume;
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager();
