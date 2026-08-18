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
  private lastBrickHitTime = 0;
  private lastWallBounceTime = 0;
  private lastBrickDestroyTime = 0;
  private readonly SOUND_THROTTLE = 50;

    private _sfxVolume = 0.65;
  private _musicVolume = 0.35;
  private _masterVolume = 0.7;
  private _savedVolume: number = 1;

  private bossMode = false;
  private bossPulse: number | null = null;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.masterGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      this.masterGain.gain.value = this._masterVolume;
      this.sfxGain.gain.value = this._sfxVolume;
      this.musicGain.gain.value = this._musicVolume;

      try {
        if (localStorage.getItem('neon_breaker_muted') === 'true') {
          this._masterVolume = 0;
          if (this.masterGain) this.masterGain.gain.value = 0;
        }
      } catch (e) {}

      this.isInitialized = true;
      
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }
  
  private handleVisibilityChange(): void {
    if (document.hidden) {
      if (this.backgroundMusic && this.isMusicPlaying) {
        try { this.backgroundMusic.stop(); } catch {}
        this.backgroundMusic = null;
      }
      if (this.bossPulse !== null) {
        clearInterval(this.bossPulse);
        this.bossPulse = null;
      }
      if (this.audioContext && this.audioContext.state === 'running') {
        this.audioContext.suspend().catch(() => {});
      }
    } else {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      if (this.bossMode) {
        this.setBossMode(true);
      } else if (this.isMusicPlaying && this._musicVolume > 0 && this._masterVolume > 0) {
        this.playMusicFromBuffer();
      }
    }
  }

  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private playSynth(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    fadeOut: boolean = true,
    detune: number = 0
  ): void {
        if (!this.audioContext || !this.sfxGain) return;
    if (this._masterVolume === 0) return;

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

  playPaddleHit(): void {
    if (!this.audioContext) return;
    this.playSynth(400, 0.08, 'square', true);
    this.playSynth(600, 0.06, 'sine', true, 10);
  }

  playBrickHit(): void {
    if (!this.audioContext) return;
    const now = performance.now();
    if (now - this.lastBrickHitTime < this.SOUND_THROTTLE) return;
    this.lastBrickHitTime = now;
    const pitch = 300 + Math.random() * 200;
    this.playSynth(pitch, 0.1, 'square', true);
  }

  playBrickDestroy(): void {
    if (!this.audioContext) return;
    const now = performance.now();
    if (now - this.lastBrickDestroyTime < this.SOUND_THROTTLE) return;
    this.lastBrickDestroyTime = now;
    this.playSynth(500, 0.15, 'sawtooth', true);
  }

  playPowerUp(): void {
    if (!this.audioContext) return;
    this.playSynth(500, 0.1, 'sine', true);
    setTimeout(() => this.playSynth(700, 0.1, 'sine', true), 50);
    setTimeout(() => this.playSynth(900, 0.15, 'sine', true), 100);
  }

  playPowerDown(): void {
    if (!this.audioContext) return;
    this.playSynth(400, 0.1, 'square', true);
    setTimeout(() => this.playSynth(300, 0.1, 'square', true), 50);
    setTimeout(() => this.playSynth(200, 0.15, 'square', true), 100);
  }

  playExtraLife(): void {
    if (!this.audioContext) return;
    const melody = [523, 659, 784, 1047];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playSynth(freq, 0.15, 'sine', true), i * 80);
    });
  }

  playBallLost(): void {
    if (!this.audioContext) return;
    this.playSynth(300, 0.2, 'sawtooth', true);
    setTimeout(() => this.playSynth(200, 0.3, 'sawtooth', true), 100);
    setTimeout(() => this.playSynth(100, 0.4, 'sawtooth', true), 200);
  }

  playWallBounce(): void {
    if (!this.audioContext) return;
    const now = performance.now();
    if (now - this.lastWallBounceTime < this.SOUND_THROTTLE) return;
    this.lastWallBounceTime = now;
    this.playSynth(250, 0.05, 'triangle', true);
  }

  playExplosion(): void {
    if (!this.audioContext || !this.sfxGain) return;
    
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
    
    this.playSynth(60, 0.3, 'sine', true);
    this.playSynth(100, 0.2, 'triangle', true);
  }

  playLaser(): void {
    if (!this.audioContext) return;
    this.playSynth(1000, 0.08, 'sawtooth', true);
    this.playSynth(800, 0.06, 'square', true, 50);
  }

  playLevelComplete(): void {
    if (!this.audioContext) return;
    const melody = [523, 659, 784, 880, 1047, 1319];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playSynth(freq, 0.2, 'sine', true), i * 100);
    });
  }

  playGameOver(): void {
    if (!this.audioContext) return;
    const melody = [440, 392, 349, 330, 294, 262];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playSynth(freq, 0.3, 'sawtooth', true), i * 150);
    });
  }

  playCombo(comboLevel: number): void {
    if (!this.audioContext) return;
    const baseFreq = 400 + comboLevel * 50;
    this.playSynth(baseFreq, 0.1, 'sine', true);
    this.playSynth(baseFreq * 1.5, 0.08, 'triangle', true);
  }

  playCoinCollect(): void {
    if (!this.audioContext) return;
    this.playSynth(1200, 0.05, 'sine', true);
    setTimeout(() => this.playSynth(1500, 0.08, 'sine', true), 30);
  }

  playMagnetCatch(): void {
    if (!this.audioContext) return;
    this.playSynth(600, 0.1, 'sine', true);
    this.playSynth(500, 0.15, 'sine', true);
  }

  playMagnetRelease(): void {
    if (!this.audioContext) return;
    this.playSynth(400, 0.08, 'triangle', true);
    this.playSynth(600, 0.1, 'sine', true);
  }

  playMonsterRoar(): void {
    if (!this.audioContext) return;
    this.playSynth(90, 0.28, 'sawtooth', true);
    setTimeout(() => this.playSynth(62, 0.34, 'square', true), 70);
    setTimeout(() => this.playSynth(140, 0.18, 'sawtooth', true), 150);
  }

  async startBackgroundMusic(): Promise<void> {
    if (!this.audioContext || !this.musicGain) return;
    if (this.bossMode) return;
    if (this.isMusicPlaying && this.backgroundMusic) return;

    this.isMusicPlaying = true;

    if (this._masterVolume === 0) return;

    try {
      if (!this.musicBuffer) {
        const response = await fetch('/audio/background-music.mp3');
        const arrayBuffer = await response.arrayBuffer();
        this.musicBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      }

      this.playMusicFromBuffer();
    } catch (e) {
      console.warn('Failed to load background music:', e);
    }
  }

  private playMusicFromBuffer(): void {
    if (!this.audioContext || !this.musicGain || !this.musicBuffer || !this.isMusicPlaying) return;
    if (this._masterVolume === 0) return;
    if (this.bossMode) return;

    if (this.backgroundMusic) {
      try { this.backgroundMusic.stop(); } catch {}
      this.backgroundMusic = null;
    }

    this.backgroundMusic = this.audioContext.createBufferSource();
    this.backgroundMusic.buffer = this.musicBuffer;
    this.backgroundMusic.loop = true;
    this.backgroundMusic.connect(this.musicGain);
    this.backgroundMusic.start();
  }

  private applyMusicGain(): void {
    if (!this.musicGain) return;
    this.musicGain.gain.value = this.bossMode ? 0 : this._musicVolume;
  }

  setBossMode(on: boolean): void {
    if (this.bossMode === on) return;
    this.bossMode = on;

    if (this.bossPulse !== null) {
      clearInterval(this.bossPulse);
      this.bossPulse = null;
    }

    if (on) {
      this.applyMusicGain();
      if (this.backgroundMusic) {
        try { this.backgroundMusic.stop(); } catch {}
        this.backgroundMusic = null;
      }

      const motif = [73.4, 87.3, 98.0, 110.0, 130.8, 110.0, 98.0, 87.3];
      let step = 0;
      this.bossPulse = window.setInterval(() => {
        if (!this.audioContext || this._masterVolume === 0 || document.hidden) return;
        if (!this.bossMode) return;

        this.playSynth(45, 0.28, 'sine', true);
        setTimeout(() => this.playSynth(38, 0.32, 'sine', true), 120);

        const n = motif[step % motif.length];
        this.playSynth(n, 0.35, 'sawtooth', true);
        setTimeout(() => this.playSynth(n * 1.5, 0.2, 'triangle', true), 180);

        if (step % 4 === 0) {
          setTimeout(() => this.playSynth(n * 2, 0.25, 'square', true), 240);
        }
        step++;
      }, 520);
    } else {
      this.applyMusicGain();
      if (this.isMusicPlaying && this._masterVolume > 0 && !document.hidden) {
        this.playMusicFromBuffer();
      }
    }
  }
  stopBackgroundMusic(): void {
    this.isMusicPlaying = false;
    if (this.backgroundMusic) {
      try { this.backgroundMusic.stop(); } catch {}
      this.backgroundMusic = null;
    }
    if (this.bossPulse !== null) {
      clearInterval(this.bossPulse);
      this.bossPulse = null;
    }
    this.bossMode = false;
  }

  muteForAd(): void {
    if (this._masterVolume > 0) {
      this._savedVolume = this._masterVolume;
    }
    this._masterVolume = 0;
    if (this.masterGain) this.masterGain.gain.value = 0;
    if (this.backgroundMusic) {
      try { this.backgroundMusic.stop(); } catch {}
      this.backgroundMusic = null;
    }
    if (this.bossPulse !== null) {
      clearInterval(this.bossPulse);
      this.bossPulse = null;
    }
  }

  unmuteAfterAd(): void {
    try {
      if (localStorage.getItem('neon_breaker_muted') === 'true') return;
    } catch {}
    this._masterVolume = this._savedVolume > 0 ? this._savedVolume : 0.7;
    if (this.masterGain) this.masterGain.gain.value = this._masterVolume;
  }

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
    this.applyMusicGain();
    if (this._musicVolume <= 0.01) {
      if (this.backgroundMusic) {
        try { this.backgroundMusic.stop(); } catch (e) {}
        this.backgroundMusic = null;
      }
    } else if (this._musicVolume > 0.01 && this.isMusicPlaying && !this.backgroundMusic && !document.hidden && !this.bossMode) {
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
      this.mute();
    } else {
      this.unmute();
    }
  }

  mute(): void {
    if (this._masterVolume > 0) {
      this._savedVolume = this._masterVolume;
    }
    this._masterVolume = 0;
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
    localStorage.setItem('neon_breaker_muted', 'true');
    if (this.backgroundMusic) {
      try { this.backgroundMusic.stop(); } catch {}
      this.backgroundMusic = null;
    }
  }

  unmute(): void {
    this._masterVolume = this._savedVolume || 1;
    if (this.masterGain) {
      this.masterGain.gain.value = this._masterVolume;
    }
    localStorage.setItem('neon_breaker_muted', 'false');
    if (this.bossMode) {
      this.setBossMode(true);
    } else if (this.isMusicPlaying && !document.hidden) {
      this.startBackgroundMusic();
    }
  }
}

export const audioManager = new AudioManager();
