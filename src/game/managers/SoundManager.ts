import * as Phaser from "phaser";

export class SoundManager {
    private scene: Phaser.Scene;
    private audioContext?: AudioContext;
    private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Generate all game sounds
     */
    generateSounds(): void {
        this.generateShootSound();
        this.generateHitSound();
        this.generateZombieDeathSound();
        this.generatePowerUpSound();
        this.generatePlayerHurtSound();
        this.generateWaveSound();
    }

    private generateShootSound(): void {
        const sampleRate = 44100;
        const duration = 0.1;
        const samples = sampleRate * duration;
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            // Noise burst with envelope
            const envelope = Math.exp(-t * 40);
            buffer[i] = (Math.random() * 2 - 1) * envelope * 0.5;
        }

        this.createSoundFromBuffer("shoot", buffer, sampleRate);
    }

    private generateHitSound(): void {
        const sampleRate = 44100;
        const duration = 0.15;
        const samples = sampleRate * duration;
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 20);
            // Low thud
            buffer[i] = Math.sin(2 * Math.PI * 100 * t) * envelope * 0.4;
        }

        this.createSoundFromBuffer("hit", buffer, sampleRate);
    }

    private generateZombieDeathSound(): void {
        const sampleRate = 44100;
        const duration = 0.3;
        const samples = sampleRate * duration;
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 8);
            // Descending growl
            const freq = 150 - t * 300;
            buffer[i] = (Math.sin(2 * Math.PI * freq * t) + Math.random() * 0.3) * envelope * 0.3;
        }

        this.createSoundFromBuffer("zombieDeath", buffer, sampleRate);
    }

    private generatePowerUpSound(): void {
        const sampleRate = 44100;
        const duration = 0.3;
        const samples = sampleRate * duration;
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 5);
            // Rising chime
            const freq = 400 + t * 800;
            buffer[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }

        this.createSoundFromBuffer("powerUp", buffer, sampleRate);
    }

    private generatePlayerHurtSound(): void {
        const sampleRate = 44100;
        const duration = 0.2;
        const samples = sampleRate * duration;
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 15);
            buffer[i] = (Math.random() * 2 - 1) * envelope * 0.4;
        }

        this.createSoundFromBuffer("playerHurt", buffer, sampleRate);
    }

    private generateWaveSound(): void {
        const sampleRate = 44100;
        const duration = 0.5;
        const samples = sampleRate * duration;
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const envelope = Math.sin(Math.PI * t / duration);
            // Ominous low horn
            buffer[i] = (
                Math.sin(2 * Math.PI * 80 * t) +
                Math.sin(2 * Math.PI * 120 * t) * 0.5
            ) * envelope * 0.3;
        }

        this.createSoundFromBuffer("wave", buffer, sampleRate);
    }

    private createSoundFromBuffer(key: string, buffer: Float32Array, sampleRate: number): void {
        try {
            // Create audio context if needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            }

            const audioBuffer = this.audioContext.createBuffer(1, buffer.length, sampleRate);
            audioBuffer.getChannelData(0).set(buffer);

            // Convert to base64 WAV
            const wav = this.bufferToWav(audioBuffer);
            const blob = new Blob([wav], { type: "audio/wav" });
            const url = URL.createObjectURL(blob);

            // Add to Phaser's sound system
            this.scene.load.audio(key, url);
            this.scene.load.once("complete", () => {
                if (!this.sounds.has(key)) {
                    const sound = this.scene.sound.add(key, { volume: 0.5 });
                    this.sounds.set(key, sound);
                }
            });
            this.scene.load.start();
        } catch {
            console.warn(`Could not create sound: ${key}`);
        }
    }

    private bufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        const byteRate = sampleRate * blockAlign;
        const dataSize = audioBuffer.length * blockAlign;
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);

        // WAV header
        this.writeString(view, 0, "RIFF");
        view.setUint32(4, 36 + dataSize, true);
        this.writeString(view, 8, "WAVE");
        this.writeString(view, 12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        this.writeString(view, 36, "data");
        view.setUint32(40, dataSize, true);

        // Audio data
        const channelData = audioBuffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < audioBuffer.length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }

        return buffer;
    }

    private writeString(view: DataView, offset: number, str: string): void {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    play(key: string): void {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.play();
        }
    }

    setVolume(volume: number): void {
        this.sounds.forEach(sound => {
            if ('setVolume' in sound) {
                (sound as Phaser.Sound.WebAudioSound).setVolume(volume);
            }
        });
    }
}

export default SoundManager;
