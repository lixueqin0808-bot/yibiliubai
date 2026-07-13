export class AudioManager {
  private context: AudioContext | null = null;
  private enabled = localStorage.getItem("yibiliubai-v2-sound") !== "off";

  get isEnabled(): boolean {
    return this.enabled;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem("yibiliubai-v2-sound", this.enabled ? "on" : "off");
    if (this.enabled) this.unlock();
    return this.enabled;
  }

  unlock(): void {
    if (!this.enabled) return;
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") void this.context.resume();
  }

  playStart(): void {
    this.tone(360, 520, 0.055, 0.025, "triangle");
  }

  playSuccess(): void {
    this.noise(0.075, 0.035, 3200);
    this.tone(1250, 360, 0.07, 0.032, "triangle");
    this.tone(155, 92, 0.1, 0.026, "sine", 0.018);
  }

  playFail(): void {
    this.tone(190, 72, 0.16, 0.065, "sawtooth");
    this.noise(0.07, 0.045, 480);
  }

  playComplete(): void {
    this.tone(180, 120, 0.22, 0.07, "sine");
    this.tone(520, 650, 0.18, 0.035, "triangle", 0.12);
  }

  private tone(
    from: number,
    to: number,
    duration: number,
    volume: number,
    type: OscillatorType,
    delay = 0,
  ): void {
    if (!this.enabled) return;
    this.unlock();
    if (!this.context) return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  private noise(duration: number, volume: number, cutoff: number): void {
    if (!this.enabled) return;
    this.unlock();
    if (!this.context) return;
    const frameCount = Math.ceil(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, frameCount, this.context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) channel[index] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(this.context.destination);
    source.start();
  }
}
