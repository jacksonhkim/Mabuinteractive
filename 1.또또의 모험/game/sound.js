class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isEnabled = false;
        this.reverbNode = null;
        this.bgmLoop = null;
        this.currentBgmType = null;
        this.beatCount = 0;
        this.masterGain = null;
        this.assets = {};
        this.bgmSource = null;
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

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

        // Unlock
        const b = this.ctx.createBuffer(1, 1, 22050);
        const s = this.ctx.createBufferSource();
        s.buffer = b; s.connect(this.masterGain); s.start(0);

        this.isEnabled = true;
        this.reverbNode = await this.createReverb();

        await this.loadAssets();
        console.log("🔊 Mabu Sound Engine R&D Initialized");
    }

    async loadAssets() {
        const fileMap = {
            'shot_toto': 'sfx_shot_toto.mp3',
            'shot_lulu': 'sfx_shot_lulu.mp3',
            'shot_kaka': 'sfx_shot_kaka.mp3',
            'shot_pipi': 'sfx_shot_pipi.mp3',
            'shot_momo': 'sfx_shot_momo.mp3',
            'charge_toto': 'sfx_charge_toto.mp3',
            'charge_lulu': 'sfx_charge_lulu.mp3',
            'charge_kaka': 'sfx_charge_kaka.mp3',
            'charge_pipi': 'sfx_charge_pipi.mp3',
            'charge_momo': 'sfx_charge_momo.mp3',
            'explosion': 'sfx_explosion.mp3',
            'item_get': 'sfx_item_get.mp3',
            'select': 'sfx_select.mp3',
            'confirm': 'sfx_confirm.mp3',
            'game_start': 'sfx_game_start.mp3',
            'bgm_start': 'bgm_start.mp3',
            'bgm_stage_low': 'bgm_stage_low.mp3',
            'bgm_stage_mid': 'bgm_stage_mid.mp3',
            'bgm_stage_high': 'bgm_stage_high.mp3',
            'bgm_ending': 'bgm_ending.mp3'
        };

        const promises = Object.entries(fileMap).map(async ([key, filename]) => {
            try {
                const res = await fetch(`game/assets/sound/${filename}`);
                if (!res.ok) return; // Silent fail for missing files
                const arrayBuffer = await res.arrayBuffer();
                const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
                this.assets[key] = audioBuffer;
            } catch (e) {
                // console.warn(`Sound file not found: ${filename}`);
            }
        });
        await Promise.all(promises);
    }

    playBuffer(buffer, volume = 0.5, loop = false) {
        if (!buffer) return null;
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        const gain = this.ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(this.masterGain);
        source.start();
        return source;
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
    playShot(charId = 'toto') {
        if (!this.isEnabled) return;
        if (this.assets[`shot_${charId}`]) return this.playBuffer(this.assets[`shot_${charId}`]);

        const t = this.ctx.currentTime;

        switch (charId) {
            case 'lulu': // Laser - High pitch rapid sweep
                {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(1200, t);
                    osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
                    gain.gain.setValueAtTime(0.1, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                    osc.connect(gain); gain.connect(this.masterGain);
                    osc.start(); osc.stop(t + 0.1);
                }
                break;
            case 'kaka': // Heavy - Low pitch square
                {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(300, t);
                    osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
                    gain.gain.setValueAtTime(0.15, t); // Slightly louder
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                    osc.connect(gain); gain.connect(this.masterGain);
                    osc.start(); osc.stop(t + 0.15);
                }
                break;
            case 'pipi': // Sonic/Wave - Modulated
                {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, t);
                    osc.frequency.linearRampToValueAtTime(800, t + 0.05);
                    osc.frequency.linearRampToValueAtTime(400, t + 0.15);
                    gain.gain.setValueAtTime(0.1, t);
                    gain.gain.linearRampToValueAtTime(0, t + 0.15);
                    osc.connect(gain); gain.connect(this.masterGain);
                    osc.start(); osc.stop(t + 0.15);
                }
                break;
            case 'momo': // Heart/Magic - Bell-like upward chirp
                {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(900, t);
                    osc.frequency.exponentialRampToValueAtTime(1500, t + 0.05);
                    gain.gain.setValueAtTime(0.1, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                    osc.connect(gain); gain.connect(this.masterGain);
                    osc.start(); osc.stop(t + 0.15);
                }
                break;
            case 'toto':
            default: // Classic pew
                {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(880, t);
                    osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);
                    gain.gain.setValueAtTime(0.1, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                    osc.connect(gain); gain.connect(this.masterGain);
                    osc.start(); osc.stop(t + 0.15);
                }
                break;
        }
    }

    playChargeShot(charId) {
        if (!this.isEnabled) return;
        if (this.assets[`charge_${charId}`]) return this.playBuffer(this.assets[`charge_${charId}`]);

        const t = this.ctx.currentTime;

        switch (charId) {
            case 'toto': // Bit Bee Swarm (High-tech chirps)
                [880, 1100, 1320].forEach((f, i) => {
                    this.genNote(f, 0.1, 'square', 0.1, this.masterGain);
                    setTimeout(() => this.genNote(f * 1.5, 0.1, 'square', 0.1, this.masterGain), 50 + i * 30);
                });
                break;
            case 'lulu': // Prism Laser (Long energy sweep)
                {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(400, t);
                    osc.frequency.linearRampToValueAtTime(100, t + 1.0); // Power down
                    gain.gain.setValueAtTime(0.2, t);
                    gain.gain.linearRampToValueAtTime(0, t + 1.0);

                    // Add modulation
                    const lfo = this.ctx.createOscillator();
                    lfo.frequency.value = 50;
                    const lfoGain = this.ctx.createGain();
                    lfoGain.gain.value = 200;
                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    lfo.start(); lfo.stop(t + 1.0);

                    osc.connect(gain); gain.connect(this.masterGain);
                    osc.start(); osc.stop(t + 1.0);
                }
                break;
            case 'kaka': // Meteor (Giant explosion/rumble)
                {
                    // Noise buffer
                    const bufferSize = this.ctx.sampleRate * 1.5; // 1.5 sec
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

                    const noise = this.ctx.createBufferSource();
                    noise.buffer = buffer;
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(500, t);
                    filter.frequency.exponentialRampToValueAtTime(10, t + 1.5);
                    const gain = this.ctx.createGain();
                    gain.gain.setValueAtTime(0.5, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);

                    noise.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
                    noise.start();
                }
                break;
            case 'momo': // Love Bomb (Magical Twinkle)
                [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = f;
                    gain.gain.setValueAtTime(0, t + i * 0.05);
                    gain.gain.linearRampToValueAtTime(0.1, t + i * 0.05 + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.3);
                    osc.connect(gain); gain.connect(this.masterGain);
                    osc.start(t + i * 0.05); osc.stop(t + i * 0.05 + 0.3);
                });
                break;
            case 'pipi': // Sonic Boom (Whoosh)
                {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine'; // or triangle
                    osc.frequency.setValueAtTime(200, t);
                    osc.frequency.exponentialRampToValueAtTime(800, t + 0.2); // Up
                    osc.frequency.exponentialRampToValueAtTime(100, t + 0.8); // Down
                    gain.gain.setValueAtTime(0.3, t);
                    gain.gain.linearRampToValueAtTime(0, t + 0.8);
                    osc.connect(gain); gain.connect(this.masterGain);
                    osc.start(); osc.stop(t + 0.8);
                }
                break;
            default:
                this.playExplosion();
        }
    }

    playExplosion() {
        if (!this.isEnabled) return;
        if (this.assets.explosion) return this.playBuffer(this.assets.explosion);

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);
        gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.connect(gain); gain.connect(this.masterGain);
        osc.start(); osc.stop(t + 0.4);
    }

    playItemGet() {
        if (!this.isEnabled) return;
        if (this.assets.item_get) return this.playBuffer(this.assets.item_get);

        const t = this.ctx.currentTime;
        [523, 1046].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(f, t + i * 0.05);
            gain.gain.setValueAtTime(0.1, t + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.05 + 0.1);
            osc.connect(gain); gain.connect(this.masterGain);
            osc.start(t + i * 0.05); osc.stop(t + i * 0.05 + 0.1);
        });
    }

    playSelect() {
        if (!this.isEnabled) return;
        if (this.assets.select) return this.playBuffer(this.assets.select);

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.05);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.05);
        osc.connect(gain); gain.connect(this.masterGain);
        osc.start(); osc.stop(t + 0.05);
    }

    playConfirm() {
        if (!this.isEnabled) return;
        if (this.assets.confirm) return this.playBuffer(this.assets.confirm);

        const t = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, t + i * 0.06);
            gain.gain.setValueAtTime(0.1, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.3);
            osc.connect(gain); gain.connect(this.masterGain);
            osc.start(t + i * 0.06); osc.stop(t + i * 0.06 + 0.3);
        });
    }

    playGameStart() {
        if (!this.isEnabled) return;
        if (this.assets.game_start) return this.playBuffer(this.assets.game_start);

        const t = this.ctx.currentTime;

        // 즉각적인 확정음 (Arpeggio) - "딩-링-딩-링~"
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, t + i * 0.06);
            gain.gain.setValueAtTime(0.15, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.4);
            osc.connect(gain); gain.connect(this.masterGain);
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
        if (this.currentBgmType === type && (this.bgmLoop || this.bgmSource)) return;

        this.stopBGM();
        this.currentBgmType = type;
        this.beatCount = 0;

        // Asset BGM Check
        let assetKey = `bgm_${type.toLowerCase()}`;
        if (type.startsWith('STAGE_')) assetKey = null; // Map complex stage logic
        if (type === 'START') assetKey = 'bgm_start';
        else if (type === 'ENDING') assetKey = 'bgm_ending';

        // Complex mapping fallback
        if (!this.assets[assetKey] && type.startsWith('STAGE_')) {
            const stage = parseInt(type.split('_')[1]);
            if (stage <= 3) assetKey = 'bgm_stage_low';
            else if (stage <= 7) assetKey = 'bgm_stage_mid';
            else assetKey = 'bgm_stage_high';
        }

        if (this.assets[assetKey]) {
            this.bgmSource = this.playBuffer(this.assets[assetKey], 0.4, true);
            console.log(`🎶 Playing BGM (File): ${assetKey}`);
            return;
        }

        // Procedural Fallback
        const config = this.getBgmConfig(type);
        const beatTime = 60 / config.tempo;

        const masterGain = this.ctx.createGain();
        masterGain.gain.value = config.volume;
        if (this.reverbNode) {
            masterGain.connect(this.reverbNode);
            this.reverbNode.connect(this.masterGain); // Route reverb to master
        }
        masterGain.connect(this.masterGain); // Route dry to master

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

        console.log(`🎶 Playing BGM (Synth): ${type}`);
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
        if (this.bgmSource) {
            this.bgmSource.stop();
            this.bgmSource = null;
        }
    }
}

export const sound = new SoundEngine();
