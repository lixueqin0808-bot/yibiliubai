import bladeHitUrl from "../assets/audio/blade-hit.wav";
import cutPaperUrl from "../assets/audio/cut-paper.wav";
import cutStartUrl from "../assets/audio/cut-start.mp3";
import cutSuccessUrl from "../assets/audio/cut-success.wav";
import inkDispersalUrl from "../assets/audio/ink-dispersal.wav";
import levelCompleteUrl from "../assets/audio/level-complete.wav";
import lifeLostUrl from "../assets/audio/life-lost.wav";
import metalBlockUrl from "../assets/audio/metal-block.wav";
import uiTapUrl from "../assets/audio/ui-tap.wav";

type SampleName = "start" | "success" | "paper" | "dispersal" | "metal" | "blade" | "life" | "complete" | "tap";

interface SampleOptions {
  volume: number;
  duration: number;
  delay?: number;
  rate?: number;
}

const SAMPLE_URLS: Record<SampleName, string> = {
  start: cutStartUrl,
  success: cutSuccessUrl,
  paper: cutPaperUrl,
  dispersal: inkDispersalUrl,
  metal: metalBlockUrl,
  blade: bladeHitUrl,
  life: lifeLostUrl,
  complete: levelCompleteUrl,
  tap: uiTapUrl,
};

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
    this.sample("start", { volume: 0.2, duration: 0.24, rate: 1.08 });
  }

  playSuccess(): void {
    this.sample("success", { volume: 0.38, duration: 0.44, rate: 1.08 });
    this.sample("paper", { volume: 0.13, duration: 0.28, delay: 0.025, rate: 1.06 });
    this.sample("dispersal", { volume: 0.09, duration: 0.5, delay: 0.09, rate: 1.16 });
  }

  playBladeHit(): void {
    this.sample("blade", { volume: 0.28, duration: 0.24, rate: 1.08 });
  }

  playLifeLost(isGameOver: boolean): void {
    this.sample("life", {
      volume: isGameOver ? 0.4 : 0.32,
      duration: isGameOver ? 0.78 : 0.36,
      delay: 0.13,
      rate: isGameOver ? 0.72 : 1.14,
    });
    this.tone(150, 76, isGameOver ? 0.28 : 0.17, isGameOver ? 0.08 : 0.06, "sine", 0.13);
  }

  playMetalBlock(): void {
    this.sample("metal", { volume: 0.22, duration: 0.5, rate: 1.02 });
  }

  playInvalid(): void {
    this.tone(270, 230, 0.06, 0.018, "triangle");
  }

  playComplete(): void {
    this.sample("complete", { volume: 0.4, duration: 1.2, rate: 1 });
  }

  playTap(): void {
    this.sample("tap", { volume: 0.08, duration: 0.16, rate: 1.2 });
  }

  private sample(name: SampleName, options: SampleOptions): void {
    if (!this.enabled) return;
    this.unlock();
    const audio = new Audio(SAMPLE_URLS[name]);
    audio.preload = "auto";
    audio.volume = options.volume;
    audio.playbackRate = options.rate ?? 1;
    const start = () => {
      void audio.play().catch(() => {
        // Browser autoplay policies can still reject a sound triggered after a delayed result.
      });
      window.setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, options.duration * 1000 / audio.playbackRate);
    };
    if (options.delay) window.setTimeout(start, options.delay * 1000);
    else start();
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

}
