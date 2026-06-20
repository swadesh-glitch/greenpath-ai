/**
 * @file audio-utils.ts
 * @responsibility Synthesizes standard major arpeggio bell tones and whoosh sweeps
 * using the Web Audio API for high-premium sound feedback on profile generation.
 */

/**
 * Triggers a premium double-layer synthesized chime effect using Web Audio API.
 * Synthesizes a high-frequency bandpass whoosh sweep coupled with a staggered
 * C-major chord arpeggio (C5 -> E5 -> G5 -> C6) with sine and triangle harmonics.
 *
 * Runs entirely on the client, falling back silently if Web Audio is unsupported
 * or the user's browser blocks audio playback before user interaction.
 */
export const playChimeSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    if (ctx.state === "suspended") {
      ctx.resume()
    }
    
    // Whoosh (noise builder)
    const bufferSize = ctx.sampleRate * 0.4
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    
    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(120, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.3)
    filter.Q.setValueAtTime(4, ctx.currentTime)
    
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.06, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    
    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start()
    
    // Synth bell major arpeggio notes
    const playBell = (freq: number, delay: number, vol: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
      
      // Harmonics
      const modifier = ctx.createOscillator()
      modifier.type = "triangle"
      modifier.frequency.setValueAtTime(freq * 2.01, ctx.currentTime + delay)
      
      const modGain = ctx.createGain()
      modGain.gain.setValueAtTime(vol * 0.1, ctx.currentTime + delay)
      
      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay)
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.6)
      
      osc.connect(gain)
      modifier.connect(modGain)
      modGain.connect(gain)
      
      gain.connect(ctx.destination)
      
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.7)
      modifier.start(ctx.currentTime + delay)
      modifier.stop(ctx.currentTime + delay + 0.7)
    }
    
    playBell(523.25, 0.0, 0.15) // C5
    playBell(659.25, 0.08, 0.12) // E5
    playBell(783.99, 0.16, 0.12) // G5
    playBell(1046.50, 0.24, 0.2) // C6
  } catch (e) {
    console.warn("Web Audio chime failed to play:", e)
  }
}
