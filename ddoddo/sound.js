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
            'bgm_ending': 'bgm_ending.mp3',
            'hit': 'Hit.wav',
            '1up': '1up.wav'
        };
        // 1~10 Stage & Boss BGM 자동 할당
        for (let i = 1; i <= 10; i++) {
            fileMap[`bgm_stage${i}`] = `stage${i}.mp3`;
            fileMap[`bgm_boss${i}`] = `BOSS.mp3`;
        }

        const promises = Object.entries(fileMap).map(async ([key, filename]) => {
            try {
                const res = await fetch(`assets/sound/${filename}`);
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

        // 1. Noise Burst (펑 터지는 화이트 노이즈)
        const bufferSize = this.ctx.sampleRate * 0.5; // 0.5초 노이즈
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1000, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.3); // 필터 닫힘 (점점 묵직해짐)

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        whiteNoise.start(t);

        // 2. Low Punch (터질 때 밑에 깔리는 묵직한 베이스 킥)
        const punchOsc = this.ctx.createOscillator();
        const punchGain = this.ctx.createGain();
        punchOsc.type = 'triangle'; // 베이스에 적합
        punchOsc.frequency.setValueAtTime(120, t);
        punchOsc.frequency.exponentialRampToValueAtTime(0.01, t + 0.3); // 피치 빠르게 다운

        punchGain.gain.setValueAtTime(0.6, t);
        punchGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        punchOsc.connect(punchGain);
        punchGain.connect(this.masterGain);
        punchOsc.start(t);
        punchOsc.stop(t + 0.3);
    }

    // --- 플레이어 피격 전용 사운드 ---
    playPlayerHit() {
        if (!this.isEnabled) return;
        const t = this.ctx.currentTime;

        // === 레이어 1: 고주파 충격 "쿵!" (1800Hz → 200Hz 급하강) ===
        const shockOsc = this.ctx.createOscillator();
        const shockGain = this.ctx.createGain();
        shockOsc.type = 'square';
        shockOsc.frequency.setValueAtTime(1800, t);
        shockOsc.frequency.exponentialRampToValueAtTime(200, t + 0.08);
        shockGain.gain.setValueAtTime(0.7, t);
        shockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        shockOsc.connect(shockGain); shockGain.connect(this.masterGain);
        shockOsc.start(t); shockOsc.stop(t + 0.1);

        // === 레이어 2: 저음 충격 묵직한 "뚝" ===
        const thudOsc = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();
        thudOsc.type = 'triangle';
        thudOsc.frequency.setValueAtTime(120, t);
        thudOsc.frequency.exponentialRampToValueAtTime(30, t + 0.15);
        thudGain.gain.setValueAtTime(0.85, t);
        thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        thudOsc.connect(thudGain); thudGain.connect(this.masterGain);
        thudOsc.start(t); thudOsc.stop(t + 0.18);

        // === 레이어 3: 짧은 화이트 노이즈 버스트 (충격 질감) ===
        const noiseSize = Math.floor(this.ctx.sampleRate * 0.07);
        const noiseBuf = this.ctx.createBuffer(1, noiseSize, this.ctx.sampleRate);
        const nd = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseSize; i++) {
            nd[i] = (Math.random() * 2 - 1) * Math.exp(-i / noiseSize * 25);
        }
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.6, t);
        noiseSrc.connect(noiseGain); noiseGain.connect(this.masterGain);
        noiseSrc.start(t);
    }

    playEnemyHit() {
        if (!this.isEnabled) return;
        // WAV 파일이 있으면 볼륨을 높게(1.0) 재생
        if (this.assets.hit) return this.playBuffer(this.assets.hit, 1.0);

        const t = this.ctx.currentTime;

        // === 레이어 1: 묵직한 베이스 펀치 (200Hz→25Hz 피치 드롭) ===
        const punchOsc = this.ctx.createOscillator();
        const punchGain = this.ctx.createGain();
        punchOsc.type = 'triangle';
        punchOsc.frequency.setValueAtTime(200, t);
        punchOsc.frequency.exponentialRampToValueAtTime(25, t + 0.12);
        punchGain.gain.setValueAtTime(0.9, t);
        punchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        punchOsc.connect(punchGain);
        punchGain.connect(this.masterGain);
        punchOsc.start(t);
        punchOsc.stop(t + 0.12);

        // === 레이어 2: 크랙 노이즈 (짧고 강렬한 어택) ===
        const crackSize = Math.floor(this.ctx.sampleRate * 0.08);
        const crackBuf = this.ctx.createBuffer(1, crackSize, this.ctx.sampleRate);
        const crackData = crackBuf.getChannelData(0);
        for (let i = 0; i < crackSize; i++) {
            const p = i / crackSize;
            crackData[i] = (Math.random() * 2 - 1) * Math.exp(-p * 30);
        }
        const crackNoise = this.ctx.createBufferSource();
        crackNoise.buffer = crackBuf;
        const crackFilter = this.ctx.createBiquadFilter();
        crackFilter.type = 'highpass';
        crackFilter.frequency.value = 800; // 고역만 통과 → 날카로운 크랙
        const crackGain = this.ctx.createGain();
        crackGain.gain.setValueAtTime(0.7, t);
        crackNoise.connect(crackFilter);
        crackFilter.connect(crackGain);
        crackGain.connect(this.masterGain);
        crackNoise.start(t);

        // === 레이어 3: 금속성 고주파 틱 (2500Hz, 순식간에 소멸) ===
        const tickOsc = this.ctx.createOscillator();
        const tickGain = this.ctx.createGain();
        tickOsc.type = 'sine';
        tickOsc.frequency.setValueAtTime(2500, t);
        tickGain.gain.setValueAtTime(0.4, t);
        tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        tickOsc.connect(tickGain);
        tickGain.connect(this.masterGain);
        tickOsc.start(t);
        tickOsc.stop(t + 0.03);

        // === 레이어 4: 피치 스윕 (1000Hz→150Hz, square wave) ===
        const sweepOsc = this.ctx.createOscillator();
        const sweepGain = this.ctx.createGain();
        sweepOsc.type = 'square';
        sweepOsc.frequency.setValueAtTime(1000, t + 0.02);
        sweepOsc.frequency.exponentialRampToValueAtTime(150, t + 0.15);
        sweepGain.gain.setValueAtTime(0.35, t + 0.02);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        sweepOsc.connect(sweepGain);
        sweepGain.connect(this.masterGain);
        sweepOsc.start(t + 0.02);
        sweepOsc.stop(t + 0.15);
    }

    // --- 캐릭터별 필살기(폭탄) 전용 사운드 ---
    playBombBlast(charId = 'toto') {
        if (!this.isEnabled) return;
        const t = this.ctx.currentTime;

        // === 공통 레이어: 초저음 베이스 폭발 (모든 캐릭터 공통) ===
        const baseOsc = this.ctx.createOscillator();
        const baseGain = this.ctx.createGain();
        baseOsc.type = 'triangle';
        baseOsc.frequency.setValueAtTime(80, t);
        baseOsc.frequency.exponentialRampToValueAtTime(15, t + 0.5);
        baseGain.gain.setValueAtTime(0.8, t);
        baseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        baseOsc.connect(baseGain); baseGain.connect(this.masterGain);
        baseOsc.start(t); baseOsc.stop(t + 0.5);

        // === 공통 레이어: 폭발 노이즈 버스트 ===
        const noiseSize = Math.floor(this.ctx.sampleRate * 0.6);
        const noiseBuf = this.ctx.createBuffer(1, noiseSize, this.ctx.sampleRate);
        const noiseData = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseSize; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / noiseSize * 8);
        }
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuf;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 600;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        noiseSource.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(this.masterGain);
        noiseSource.start(t);

        // === 캐릭터별 개성 레이어 ===
        switch (charId) {
            case 'toto': // 벌떼 윙윙 + 고주파 버스트
                [220, 330, 440, 550].forEach((f, i) => {
                    const osc = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(f, t + i * 0.04);
                    osc.frequency.linearRampToValueAtTime(f * 1.5, t + i * 0.04 + 0.25);
                    g.gain.setValueAtTime(0.15, t + i * 0.04);
                    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.3);
                    osc.connect(g); g.connect(this.masterGain);
                    osc.start(t + i * 0.04); osc.stop(t + i * 0.04 + 0.3);
                });
                break;

            case 'lulu': // 고주파 에너지 방출 → 섬광음
                {
                    const energyOsc = this.ctx.createOscillator();
                    const energyGain = this.ctx.createGain();
                    energyOsc.type = 'sine';
                    energyOsc.frequency.setValueAtTime(200, t);
                    energyOsc.frequency.exponentialRampToValueAtTime(3000, t + 0.15); // 급상승
                    energyOsc.frequency.exponentialRampToValueAtTime(500, t + 0.4);
                    energyGain.gain.setValueAtTime(0.5, t);
                    energyGain.gain.linearRampToValueAtTime(0.7, t + 0.1);
                    energyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
                    energyOsc.connect(energyGain); energyGain.connect(this.masterGain);
                    energyOsc.start(t); energyOsc.stop(t + 0.45);
                    // 섬광 크랙
                    const crackBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.05), this.ctx.sampleRate);
                    const cd = crackBuf.getChannelData(0);
                    for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * (1 - i / cd.length);
                    const crackSrc = this.ctx.createBufferSource();
                    crackSrc.buffer = crackBuf;
                    const crackG = this.ctx.createGain();
                    crackG.gain.value = 0.9;
                    crackSrc.connect(crackG); crackG.connect(this.masterGain);
                    crackSrc.start(t + 0.1);
                }
                break;

            case 'kaka': // 초저음 지진폭발 + 롤링 노이즈
                {
                    // 롤링 저음
                    [60, 45, 30].forEach((f, i) => {
                        const osc = this.ctx.createOscillator();
                        const g = this.ctx.createGain();
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(f, t + i * 0.1);
                        osc.frequency.exponentialRampToValueAtTime(f * 0.3, t + i * 0.1 + 0.4);
                        g.gain.setValueAtTime(0.6, t + i * 0.1);
                        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.5);
                        osc.connect(g); g.connect(this.masterGain);
                        osc.start(t + i * 0.1); osc.stop(t + i * 0.1 + 0.5);
                    });
                    // 롤링 노이즈 (저역 강조)
                    const rnBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.8), this.ctx.sampleRate);
                    const rnData = rnBuf.getChannelData(0);
                    for (let i = 0; i < rnData.length; i++) rnData[i] = Math.random() * 2 - 1;
                    const rnSrc = this.ctx.createBufferSource();
                    rnSrc.buffer = rnBuf;
                    const rnFilter = this.ctx.createBiquadFilter();
                    rnFilter.type = 'lowpass'; rnFilter.frequency.value = 200;
                    const rnGain = this.ctx.createGain();
                    rnGain.gain.setValueAtTime(0.5, t); rnGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
                    rnSrc.connect(rnFilter); rnFilter.connect(rnGain); rnGain.connect(this.masterGain);
                    rnSrc.start(t);
                }
                break;

            case 'momo': // 마법 아르페지오 + 반짝임 터짐
                [523, 659, 784, 1046, 1318, 1568, 2093].forEach((f, i) => {
                    const osc = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = f;
                    g.gain.setValueAtTime(0, t + i * 0.04);
                    g.gain.linearRampToValueAtTime(0.25, t + i * 0.04 + 0.02);
                    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.35);
                    osc.connect(g); g.connect(this.masterGain);
                    osc.start(t + i * 0.04); osc.stop(t + i * 0.04 + 0.35);
                });
                break;

            case 'pipi': // 음속 돌파(급상승+급하강) + 공기 폭발
                {
                    const sonicOsc = this.ctx.createOscillator();
                    const sonicGain = this.ctx.createGain();
                    sonicOsc.type = 'sine';
                    sonicOsc.frequency.setValueAtTime(150, t);
                    sonicOsc.frequency.exponentialRampToValueAtTime(2500, t + 0.12); // 음속 돌파
                    sonicOsc.frequency.exponentialRampToValueAtTime(80, t + 0.5);   // 공기 쓸려 내려옴
                    sonicGain.gain.setValueAtTime(0.6, t);
                    sonicGain.gain.linearRampToValueAtTime(0.8, t + 0.1);
                    sonicGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
                    sonicOsc.connect(sonicGain); sonicGain.connect(this.masterGain);
                    sonicOsc.start(t); sonicOsc.stop(t + 0.55);
                    // 공기 폭발 크랙
                    const abBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.08), this.ctx.sampleRate);
                    const abData = abBuf.getChannelData(0);
                    for (let i = 0; i < abData.length; i++) abData[i] = (Math.random() * 2 - 1) * Math.exp(-i / abData.length * 20);
                    const abSrc = this.ctx.createBufferSource();
                    abSrc.buffer = abBuf;
                    const abG = this.ctx.createGain();
                    abG.gain.value = 0.8;
                    abSrc.connect(abG); abG.connect(this.masterGain);
                    abSrc.start(t + 0.1);
                }
                break;
        }
    }

    play1up() {
        if (!this.isEnabled) return;
        if (this.assets['1up']) return this.playBuffer(this.assets['1up']);
        this.playItemGet();
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

    playPowerUp() {
        if (!this.isEnabled) return;
        const t = this.ctx.currentTime;
        [523, 659, 784, 1046].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t + i * 0.06);
            gain.gain.setValueAtTime(0.12, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.25);
            osc.connect(gain); gain.connect(this.masterGain);
            osc.start(t + i * 0.06); osc.stop(t + i * 0.06 + 0.25);
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
        let assetKey = null;
        if (type === 'START') assetKey = 'bgm_start';
        else if (type === 'ENDING') assetKey = 'bgm_ending';
        else if (type.startsWith('STAGE_')) {
            const stage = parseInt(type.split('_')[1]);
            assetKey = `bgm_stage${stage}`;
        }
        else if (type.startsWith('BOSS_')) {
            const bType = parseInt(type.split('_')[1]);
            assetKey = `bgm_boss${bType}`;
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
