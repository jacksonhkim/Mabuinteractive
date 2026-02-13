class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isEnabled = false;
        this.reverbNode = null;
        this.bgmLoop = null;
        this.currentBgmType = null;
        this.beatCount = 0;
    }

    async init() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("AudioContext not supported", e);
                return;
            }
        }
        if (this.ctx.state === 'suspended') await this.ctx.resume();

        // Unlock
        const b = this.ctx.createBuffer(1, 1, 22050);
        const s = this.ctx.createBufferSource();
        s.buffer = b; s.connect(this.ctx.destination); s.start(0);

        this.isEnabled = true;
        this.reverbNode = await this.createReverb();
        console.log("🔊 Mabu Sound Engine R&D Initialized");
    }

    async createReverb() {
        const duration = 2, decay = 2, rate = this.ctx.sampleRate, length = rate * duration;
        const impulse = this.ctx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0), right = impulse.getChannelData(1);
        for (let i = 0; i < length; i++) {
            const n = i / length;
            left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
            right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
        }
        const convolver = this.ctx.createConvolver();
        convolver.buffer = impulse;
        return convolver;
    }

    // --- SFX Section ---
    playShot() {
        if (!this.isEnabled) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(t + 0.15);
    }

    playExplosion() {
        if (!this.isEnabled) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);
        gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(t + 0.4);
    }

    playItemGet() {
        if (!this.isEnabled) return;
        const t = this.ctx.currentTime;
        [523, 1046].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(f, t + i * 0.05);
            gain.gain.setValueAtTime(0.1, t + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.05 + 0.1);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(t + i * 0.05); osc.stop(t + i * 0.05 + 0.1);
        });
    }

    playSelect() {
        if (!this.isEnabled) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.05);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.05);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(t + 0.05);
    }

    playConfirm() {
        if (!this.isEnabled) return;
        const t = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, t + i * 0.06);
            gain.gain.setValueAtTime(0.1, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.3);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(t + i * 0.06); osc.stop(t + i * 0.06 + 0.3);
        });
    }

    playGameStart() {
        if (!this.isEnabled) return;
        const t = this.ctx.currentTime;

        // 즉각적인 확정음 (Arpeggio) - "딩-링-딩-링~"
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, t + i * 0.06);
            gain.gain.setValueAtTime(0.15, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.4);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(t + i * 0.06); osc.stop(t + i * 0.06 + 0.4);
        });
    }

    // --- BGM R&D Section ---

    /**
     * 상황에 맞는 배경음악 전환
     * @param {string} type - 'START', 'SELECT', 'STAGE_1', 'STAGE_BOSS', 'ENDING' 등
     */
    startBGM(type = 'START') {
        if (!this.isEnabled) return;
        if (this.currentBgmType === type && this.bgmLoop) return;

        this.stopBGM();
        this.currentBgmType = type;
        this.beatCount = 0;

        const config = this.getBgmConfig(type);
        const beatTime = 60 / config.tempo;

        const masterGain = this.ctx.createGain();
        masterGain.gain.value = config.volume;
        if (this.reverbNode) {
            masterGain.connect(this.reverbNode);
            this.reverbNode.connect(this.ctx.destination);
        }
        masterGain.connect(this.ctx.destination);

        this.bgmLoop = setInterval(() => {
            if (this.ctx.state === 'suspended') this.ctx.resume();

            const measure = Math.floor(this.beatCount / 4) % config.melody.length;
            const beat = this.beatCount % 4;

            // Bass
            if (beat === 0) {
                this.genNote(config.bass[measure % config.bass.length], beatTime * 1.5, 'sine', 0.2, masterGain);
            }

            // Melody
            const note = config.melody[measure][beat];
            if (note > 0) {
                this.genNote(note, 0.2, config.osc, 0.1, masterGain);
            }

            this.beatCount++;
        }, beatTime * 1000);

        console.log(`🎶 Playing BGM: ${type}`);
    }

    getBgmConfig(type) {
        // [R&D] 상황별 음악 데이터베이스
        const themes = {
            'START': {
                tempo: 100, volume: 0.35, osc: 'triangle',
                bass: [130.81, 164.81, 196.00, 174.61], // C, E, G, F
                melody: [
                    [392, 523, 659, 784], // G, C, E, G
                    [329, 392, 523, 659], // E, G, C, E
                    [392, 523, 659, 784],
                    [440, 523, 659, 698]  // A, C, E, F
                ]
            },
            'SELECT': {
                tempo: 140, volume: 0.2, osc: 'square',
                bass: [196.00, 220.00], // G, A
                melody: [[392, 0, 440, 0], [493, 0, 523, 0]] // Staccato
            },
            'STAGE_LOW': { // Stages 1-3 (Peaceful)
                tempo: 120, volume: 0.25, osc: 'triangle',
                bass: [130.81, 196.00, 220.00, 174.61],
                melody: [[261, 0, 329, 392], [196, 0, 220, 246]]
            },
            'STAGE_MID': { // Stages 4-7 (Tense)
                tempo: 140, volume: 0.25, osc: 'sawtooth',
                bass: [110.00, 130.81, 146.83, 123.47], // Am, C, D, B
                melody: [[220, 220, 329, 329], [293, 293, 246, 246]]
            },
            'STAGE_HIGH': { // Stages 8-10 (Epic)
                tempo: 160, volume: 0.3, osc: 'square',
                bass: [87.31, 110.00, 116.54, 130.81], // F, A, Bb, C
                melody: [[349, 440, 466, 523], [698, 880, 932, 1046]]
            },
            'ENDING': {
                tempo: 80, volume: 0.4, osc: 'sine',
                bass: [130.81, 174.61, 196.00, 130.81],
                melody: [[523, 0, 0, 0], [698, 0, 0, 0], [784, 0, 0, 0], [1046, 0, 0, 0]]
            }
        };

        if (type.startsWith('STAGE_')) {
            const stage = parseInt(type.split('_')[1]);
            if (stage <= 3) return themes['STAGE_LOW'];
            if (stage <= 7) return themes['STAGE_MID'];
            return themes['STAGE_HIGH'];
        }
        return themes[type] || themes['STAGE_LOW'];
    }

    genNote(freq, dur, type, vol, dest) {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + dur);
        osc.connect(gain); gain.connect(dest);
        osc.start(); osc.stop(t + dur);
    }

    stopBGM() {
        if (this.bgmLoop) {
            clearInterval(this.bgmLoop);
            this.bgmLoop = null;
        }
    }
}

export const sound = new SoundEngine();
