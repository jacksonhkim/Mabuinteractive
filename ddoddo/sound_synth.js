
// [한순이의 8-bit 레트로 사운드 엔진]
// Web Audio API를 사용하여 외부 파일 없이 효과음과 BGM을 생성합니다.

const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

const oscillatorTypes = {
    sine: 'sine',
    square: 'square',
    sawtooth: 'sawtooth',
    triangle: 'triangle'
};

// Helper: 소리 재생
function playTone(freq, type, duration, vol = 0.1) {
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
}

// BGM 플레이어 (간단한 루프)
let bgmInterval = null;
const melody = [
    330, 330, 330, 262, 330, 392, 196, // Super Mario style intro parts
    262, 196, 164, 220, 246, 233, 220
];
let noteIdx = 0;

export const sound = {
    init: () => {
        if (ctx.state === 'suspended') ctx.resume();
    },

    // 1. 발사 소리 (Pew Pew)
    playShot: () => {
        // 주파수가 빠르게 떨어지는 짹! 소리
        playTone(600, 'square', 0.1, 0.05);
        setTimeout(() => playTone(300, 'square', 0.1, 0.05), 50);
    },

    // 2. 폭발 소리 (Noise simulation using low Sawtooth)
    playExplosion: () => {
        playTone(100, 'sawtooth', 0.2, 0.1);
        playTone(80, 'square', 0.3, 0.1);
        playTone(50, 'sawtooth', 0.4, 0.1);
    },

    // 3. 점프/날개짓
    playJump: () => {
        playTone(300, 'sine', 0.15, 0.05);
    },

    // 4. 게임 오버
    playGameOver: () => {
        playTone(400, 'triangle', 0.3, 0.1);
        setTimeout(() => playTone(300, 'triangle', 0.3, 0.1), 300);
        setTimeout(() => playTone(200, 'triangle', 0.6, 0.1), 600);
    },

    // 5. BGM 시작
    startBGM: () => {
        if (bgmInterval) return;
        noteIdx = 0;
        bgmInterval = setInterval(() => {
            if (ctx.state === 'suspended') return;
            const note = melody[noteIdx % melody.length];
            playTone(note, 'square', 0.15, 0.02); // 아주 작게
            noteIdx++;
        }, 200);
    },

    stopBGM: () => {
        if (bgmInterval) clearInterval(bgmInterval);
        bgmInterval = null;
    }
};
