// Web Audio API Soothing Cyber Lofi Ambient Track Synthesizer
class CyberLofiSynth {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nodes: AudioNode[] = [];
  private intervals: any[] = [];

  constructor() {}

  public start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Initialize AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Auto-resume helper for autoplay blocking policies
    if (this.ctx.state === 'suspended') {
      const resume = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        document.removeEventListener('click', resume);
        document.removeEventListener('keydown', resume);
        document.removeEventListener('touchstart', resume);
      };
      document.addEventListener('click', resume);
      document.addEventListener('keydown', resume);
      document.addEventListener('touchstart', resume);
    }

    // 1. Warm ambient master gain and compressor for a cozy, warm lofi texture
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-15, this.ctx.currentTime);
    compressor.knee.setValueAtTime(12, this.ctx.currentTime);
    compressor.ratio.setValueAtTime(3, this.ctx.currentTime);
    compressor.attack.setValueAtTime(0.03, this.ctx.currentTime);
    compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    masterGain.connect(compressor);
    compressor.connect(this.ctx.destination);
    this.nodes.push(masterGain, compressor);

    // 2. Continuous Deep Binaural/Sub Bass Drone (A1: 55Hz & E2: 82.4Hz)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    const lpFilter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 sub-bass

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(82.4, this.ctx.currentTime); // E2 warmth

    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(150, this.ctx.currentTime); // Filter high frequencies

    droneGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    osc1.connect(lpFilter);
    osc2.connect(lpFilter);
    lpFilter.connect(droneGain);
    droneGain.connect(masterGain);

    osc1.start();
    osc2.start();
    this.nodes.push(osc1, osc2, droneGain, lpFilter);

    // 3. Ambient Rain & Vinyl Crackle Generator (Pink/Brown noise filter)
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise formula for a warm rumbling rain background
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(400, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noiseSource.start();
    this.nodes.push(noiseSource, noiseFilter, noiseGain);

    // 4. Soft Electric Piano/Chime Chord Progression (Amaj7 -> F#m7 -> Dmaj7 -> E6)
    // Plays a soft chords progression every 8 seconds
    const chords = [
      [220.00, 277.18, 329.63, 415.30], // Amaj7 (A3, C#4, E4, G#4)
      [185.00, 220.00, 277.18, 329.63], // F#m7 (F#3, A3, C#4, E4)
      [146.83, 185.00, 220.00, 293.66], // Dmaj7 (D3, F#3, A3, D4)
      [164.81, 196.00, 246.94, 329.63]  // E6 (E3, G4, B4, E4)
    ];

    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.ctx || !this.isPlaying) return;
      
      const chord = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      // Instantiate key-tone oscillators
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const chordFilter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        // Add a slight micro-detuning for retro lofi character
        osc.detune.setValueAtTime(Math.random() * 8 - 4, this.ctx.currentTime);

        chordFilter.type = 'lowpass';
        chordFilter.frequency.setValueAtTime(600, this.ctx.currentTime);

        // Slow soft volume attack and decay
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        // Staggered note onset for lush electric piano texture
        const delay = idx * 0.15;
        gainNode.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 1.5 + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 6.0 + delay);

        osc.connect(chordFilter);
        chordFilter.connect(gainNode);
        gainNode.connect(masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 7.5);
      });
    };

    // Play immediately
    playNextChord();

    // Loop interval
    const intervalId = setInterval(playNextChord, 8000);
    this.intervals.push(intervalId);
  }

  public stop() {
    this.isPlaying = false;
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];

    this.nodes.forEach(node => {
      try {
        (node as any).stop?.();
        (node as any).disconnect?.();
      } catch (e) {}
    });
    this.nodes = [];

    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const lofiSynth = new CyberLofiSynth();
