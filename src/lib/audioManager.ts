'use client'

class AudioManager {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  private isAmbientPlaying: boolean = false
  private ambientOscillators: { osc: OscillatorNode; gain: GainNode }[] = []
  private listeners: Set<() => void> = new Set()

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('portfolio_muted')
      this.isMuted = savedMute ? JSON.parse(savedMute) : false
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  public getAmbientPlaying(): boolean {
    return this.isAmbientPlaying
  }

  public toggleMute() {
    this.isMuted = !this.isMuted
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_muted', JSON.stringify(this.isMuted))
    }
    if (this.isMuted && this.isAmbientPlaying) {
      this.stopAmbient()
    }
    this.notify()
  }

  // Crisp micro click sound
  public playClick() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.04)
    } catch {
      // Ignore audio context errors
    }
  }

  // Subtle hover tick sound
  public playHover() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(320, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.03)

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.03)
    } catch {
      // Ignore audio errors
    }
  }

  // Multi-tone chord for actions like run code, copy, submit
  public playSuccess() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05)

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.2)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(this.ctx.currentTime + idx * 0.05)
        osc.stop(this.ctx.currentTime + idx * 0.05 + 0.2)
      })
    } catch {
      // Ignore audio errors
    }
  }

  // Soft ambient synth pad loop
  public toggleAmbient() {
    if (this.isAmbientPlaying) {
      this.stopAmbient()
    } else {
      this.startAmbient()
    }
  }

  public startAmbient() {
    if (this.isMuted) this.toggleMute()
    this.initCtx()
    if (!this.ctx) return

    this.stopAmbient()

    try {
      const freqs = [110, 164.81, 220, 293.66] // Low A chord drone (A2, E3, A3, D4)
      this.ambientOscillators = freqs.map((freq) => {
        const osc = this.ctx!.createOscillator()
        const gain = this.ctx!.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime)

        // Soft swell
        gain.gain.setValueAtTime(0.001, this.ctx!.currentTime)
        gain.gain.linearRampToValueAtTime(0.015, this.ctx!.currentTime + 2)

        osc.connect(gain)
        gain.connect(this.ctx!.destination)

        osc.start()
        return { osc, gain }
      })

      this.isAmbientPlaying = true
      this.notify()
    } catch {
      this.isAmbientPlaying = false
    }
  }

  public stopAmbient() {
    if (this.ambientOscillators.length > 0 && this.ctx) {
      this.ambientOscillators.forEach(({ osc, gain }) => {
        try {
          gain.gain.linearRampToValueAtTime(0.0001, this.ctx!.currentTime + 0.5)
          setTimeout(() => {
            try {
              osc.stop()
              osc.disconnect()
            } catch {
              // Ignore disconnect error
            }
          }, 500)
        } catch {
          // Ignore error
        }
      })
      this.ambientOscillators = []
    }
    this.isAmbientPlaying = false
    this.notify()
  }
}

export const audioManager = typeof window !== 'undefined' ? new AudioManager() : null
