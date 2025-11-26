export class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private timerID: number | undefined;
  private current16thNote: number = 0;
  private tempo: number = 112; // Fun, driving Electro-Funk tempo
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s

  // Frequencies (Equal Temperament)
  private notes: Record<string, number> = {
    // Bass
    C2: 65.41, "C#2": 69.30, D2: 73.42, "D#2": 77.78, E2: 82.41, F2: 87.31, "F#2": 92.50, G2: 98.00, "G#2": 103.83, A2: 110.00, "A#2": 116.54, B2: 123.47,
    
    // Mids
    C3: 130.81, "C#3": 138.59, D3: 146.83, "D#3": 155.56, E3: 164.81, F3: 174.61, "F#3": 185.00, G3: 196.00, "G#3": 207.65, A3: 220.00, "A#3": 233.08, B3: 246.94,
    
    // Treble
    C4: 261.63, "C#4": 277.18, D4: 293.66, "D#4": 311.13, E4: 329.63, F4: 349.23, "F#4": 369.99, G4: 392.00, "G#4": 415.30, A4: 440.00, "A#4": 466.16, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00
  };

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.4; // SFX Volume
        this.sfxGain.connect(this.ctx.destination);
      }
    } catch (e) {
      console.error("Web Audio API not supported");
    }
  }

  public async init() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public toggleMusic(shouldPlay: boolean) {
      if (shouldPlay) {
          this.startMusic();
      } else {
          this.stopMusic();
      }
  }

  public startMusic() {
    if (this.isMusicPlaying) return;
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(e => console.error(e));
    }

    this.isMusicPlaying = true;
    this.current16thNote = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.35; 
    
    // Master Compressor for a "Pop" sound
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = -15;
    compressor.knee.value = 30;
    compressor.ratio.value = 10;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.1;

    this.musicGain.connect(compressor);
    compressor.connect(this.ctx.destination);
    
    this.scheduler();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    window.clearTimeout(this.timerID);
    
    if (this.musicGain) {
        const fadingGain = this.musicGain;
        this.musicGain = null;

        if (this.ctx) {
            const now = this.ctx.currentTime;
            try {
                fadingGain.gain.cancelScheduledValues(now);
                fadingGain.gain.setValueAtTime(fadingGain.gain.value, now);
                fadingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            } catch(e) { /* ignore */ }

            setTimeout(() => {
                try { fadingGain.disconnect(); } catch (e) { /* ignore */ }
            }, 400);
        }
    }
  }

  private scheduler() {
      if (!this.ctx || !this.isMusicPlaying) return;

      if (this.nextNoteTime < this.ctx.currentTime - 0.2) {
          this.nextNoteTime = this.ctx.currentTime + 0.1;
      }

      while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
          this.scheduleNote(this.current16thNote, this.nextNoteTime);
          this.nextNoteTime += 0.25 * (60.0 / this.tempo);
          this.current16thNote++;
          if (this.current16thNote === 64) { // 4 Bar Loop for punchiness
              this.current16thNote = 0;
          }
      }
      this.timerID = window.setTimeout(this.scheduler.bind(this), this.lookahead);
  }

  private scheduleNote(beatIndex: number, time: number) {
      if (!this.ctx) return;

      // === DRUMS: 4-on-the-floor Disco/Funk ===
      if (beatIndex % 4 === 0) {
          this.playKick(time);
      }
      
      // Snare on 2 and 4
      if (beatIndex % 16 === 4 || beatIndex % 16 === 12) {
          this.playSnare(time, 1.0);
      }

      // Hi-Hats: 16th notes, accented on off-beats
      if (beatIndex % 2 !== 0) {
          this.playHiHat(time, true, 0.15); // Open/Loud on off-beat
      } else {
          this.playHiHat(time, false, 0.05); // Closed/Quiet on beat
      }

      // === BASS: Funky Octaves (Slap Bass style) ===
      // Progression: Cm7 | Bb | Ab | G7 (Classic catchy loop)
      let rootFreq = this.notes.C2;
      let scale = [this.notes.C2, this.notes.D2, this.notes["D#2"], this.notes.F2, this.notes.G2, this.notes["A#2"], this.notes.C3];
      
      if (beatIndex >= 16 && beatIndex < 32) {
          rootFreq = this.notes["A#1"]; // Bb (using A#1 notation if needed, but lets stick to C2 range logic)
          // Simplified: just shift logic
      } else if (beatIndex >= 32 && beatIndex < 48) {
          rootFreq = this.notes["G#1"]; // Ab
      } else if (beatIndex >= 48) {
          rootFreq = this.notes.G1; // G
      }

      // Bass Pattern: "Bootsy" style - One (hold), octave pop, rhythmic
      // 1--- 2-&- 3--- 4-&-
      const barPos = beatIndex % 16;
      if (barPos === 0) this.playBass(time, this.getFreqForBar(beatIndex, 1), 0.4); // Root
      if (barPos === 3) this.playBass(time, this.getFreqForBar(beatIndex, 2), 0.1); // Octave Pop
      if (barPos === 6) this.playBass(time, this.getFreqForBar(beatIndex, 1), 0.2); // Root
      if (barPos === 8) this.playBass(time, this.getFreqForBar(beatIndex, 1), 0.2); // Root
      if (barPos === 10) this.playBass(time, this.getFreqForBar(beatIndex, 1.5), 0.2); // 5th or 7th passing
      if (barPos === 14) this.playBass(time, this.getFreqForBar(beatIndex, 2), 0.1); // Octave Pop

      // === CHORDS: Off-beat Stabs (Ska/Funk) ===
      // & of 1, & of 2, & of 3, & of 4
      if (beatIndex % 4 === 2) {
          this.playKeys(time, this.getChordForBar(beatIndex), 0.15);
      }

      // === MELODY: Catchy Synth Lead ===
      // Simple "Call and Response" Pentatonic
      // C Minor Pentatonic: C, Eb, F, G, Bb
      const mel = [
          // Bar 1: C - Eb - G - F - Eb
          { t: 0, n: this.notes.C4 }, { t: 3, n: this.notes["D#4"] }, { t: 6, n: this.notes.G4 }, { t: 10, n: this.notes.F4 }, { t: 12, n: this.notes["D#4"] },
          // Bar 2: Bb - C - Bb - G
          { t: 16, n: this.notes["A#4"] }, { t: 18, n: this.notes.C5 }, { t: 22, n: this.notes["A#4"] }, { t: 26, n: this.notes.G4 },
          // Bar 3: F - G - F - Eb
          { t: 32, n: this.notes.F4 }, { t: 35, n: this.notes.G4 }, { t: 38, n: this.notes.F4 }, { t: 42, n: this.notes["D#4"] },
          // Bar 4: C - D - Eb (Walk up)
          { t: 48, n: this.notes.C4 }, { t: 52, n: this.notes.D4 }, { t: 56, n: this.notes["D#4"] }, { t: 60, n: this.notes.G4 }
      ];

      const note = mel.find(m => m.t === beatIndex);
      if (note) {
          this.playLead(time, note.n, 0.2);
      }
  }

  // --- HELPERS ---
  private getFreqForBar(beatIndex: number, multiplier: number): number {
      // Cm | Bb | Ab | G
      let note = this.notes.C2;
      if (beatIndex >= 16 && beatIndex < 32) note = this.notes["A#1"] || 58.27;
      if (beatIndex >= 32 && beatIndex < 48) note = this.notes["G#1"] || 51.91;
      if (beatIndex >= 48) note = this.notes.G1;
      return note * multiplier;
  }

  private getChordForBar(beatIndex: number): number[] {
      // Triads for clear sound
      if (beatIndex < 16) return [this.notes.C3, this.notes["D#3"], this.notes.G3]; // Cm
      if (beatIndex < 32) return [this.notes["A#2"], this.notes.D3, this.notes.F3]; // Bb
      if (beatIndex < 48) return [this.notes["G#2"], this.notes.C3, this.notes["D#3"]]; // Ab
      return [this.notes.G2, this.notes.B2, this.notes.D3]; // G
  }

  // --- INSTRUMENTS ---

  private playKick(time: number) {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // Punchy Kick
      osc.frequency.setValueAtTime(120, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
      
      gain.gain.setValueAtTime(1.0, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

      osc.connect(gain);
      gain.connect(this.musicGain);
      
      osc.start(time);
      osc.stop(time + 0.5);
  }

  private playSnare(time: number, vol: number) {
      if (!this.ctx || !this.musicGain) return;
      
      // Noise Burst Snare
      const bufferSize = this.ctx.sampleRate * 0.2; // 200ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 800;
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.6 * vol, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      
      noise.start(time);
  }

  private playHiHat(time: number, isOpen: boolean, vol: number) {
      if (!this.ctx || !this.musicGain) return;
      // High frequency noise
      const bufferSize = this.ctx.sampleRate * (isOpen ? 0.3 : 0.05);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 6000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + (isOpen ? 0.15 : 0.05));

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      noise.start(time);
  }

  private playBass(time: number, freq: number, duration: number) {
      if (!this.ctx || !this.musicGain || !freq) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // FM Synthesis for Slap Bass feel
      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, time);
      filter.frequency.exponentialRampToValueAtTime(2000, time + 0.05); // Attack
      filter.frequency.exponentialRampToValueAtTime(100, time + 0.3); // Decay

      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration + 0.1);
  }

  private playKeys(time: number, freqs: number[], duration: number) {
      if (!this.ctx || !this.musicGain) return;
      
      const mainGain = this.ctx.createGain();
      mainGain.gain.value = 0.15;
      mainGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      mainGain.connect(this.musicGain);

      freqs.forEach(f => {
          if (!f) return;
          const osc = this.ctx!.createOscillator();
          osc.type = 'triangle'; // Clear tone
          osc.frequency.value = f;
          osc.connect(mainGain);
          osc.start(time);
          osc.stop(time + duration);
      });
  }

  private playLead(time: number, freq: number, duration: number) {
      if (!this.ctx || !this.musicGain || !freq) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // Square wave for "Chiptune/Gamey" clear lead
      osc.type = 'square';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      // Simple vibrato
      osc.detune.setValueAtTime(0, time);
      osc.detune.linearRampToValueAtTime(10, time + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration);
  }

  // --- SFX (Unchanged logic, just simplified helper) ---
  private createSfxOscillator(type: OscillatorType, frequency: number, duration: number, volume: number = 0.1, delay: number = 0) {
    if (!this.ctx || !this.sfxGain || !frequency) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime + delay);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  public playSelect() { this.createSfxOscillator('square', 1200, 0.05, 0.05); }
  public playSwap() { this.createSfxOscillator('triangle', 400, 0.1, 0.1); }
  public playError() { this.createSfxOscillator('sawtooth', 150, 0.2, 0.1); }
  public playMatch(count: number) {
    const base = 440 + (count * 50);
    this.createSfxOscillator('sine', base, 0.2, 0.1);
    this.createSfxOscillator('square', base * 1.5, 0.1, 0.05, 0.05);
  }
}

export const audioService = new AudioService();
