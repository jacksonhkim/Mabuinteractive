
// Hansooni's High-Fidelity Asset Library (Vector/SVG Edition)
// Bypassing server lag to deliver project assets immediately.

export const ASSETS = {
    toto: `data:image/svg+xml;base64,${btoa(`
        <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- Wings (Animated Shimmer) -->
            <ellipse cx="20" cy="25" rx="15" ry="8" fill="rgba(200, 240, 255, 0.7)" transform="rotate(-30 20 25)" />
            <ellipse cx="20" cy="35" rx="15" ry="8" fill="rgba(200, 240, 255, 0.5)" transform="rotate(30 20 35)" />
            <!-- Bee Body -->
            <ellipse cx="35" cy="32" rx="22" ry="16" fill="#FFEB3B" stroke="#000" stroke-width="2" />
            <!-- Stripes -->
            <path d="M28 18 Q30 32 28 46" fill="transparent" stroke="#212121" stroke-width="6" />
            <path d="M38 18 Q40 32 38 46" fill="transparent" stroke="#212121" stroke-width="6" />
            <!-- Head & Glasses -->
            <circle cx="50" cy="32" r="12" fill="#FFEB3B" stroke="#000" stroke-width="1.5" />
            <circle cx="54" cy="28" r="5" fill="none" stroke="#212121" stroke-width="2" />
            <circle cx="54" cy="28" r="4" fill="#00E5FF" opacity="0.6" />
            <rect x="58" y="27" width="4" height="2" fill="#212121" />
            <!-- Eye -->
            <circle cx="48" cy="28" r="2" fill="#000" />
        </svg>
    `)}`,

    boss_buzz: `data:image/svg+xml;base64,${btoa(`
        <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#FFD700" />
                    <stop offset="50%" style="stop-color:#FF8C00" />
                    <stop offset="100%" style="stop-color:#B8860B" />
                </linearGradient>
            </defs>
            <!-- Heavy Wings -->
            <path d="M40 40 L10 10 L40 30 Z" fill="rgba(255,100,100,0.4)" />
            <path d="M40 88 L10 118 L40 98 Z" fill="rgba(255,100,100,0.4)" />
            <!-- Heavy Armor Body -->
            <rect x="30" y="30" width="80" height="68" rx="8" fill="url(#gold)" stroke="#3e2723" stroke-width="4" />
            <!-- Gatling Gun -->
            <rect x="0" y="55" width="45" height="18" fill="#455a64" stroke="#263238" stroke-width="2" />
            <rect x="0" y="58" width="45" height="4" fill="#607d8b" />
            <!-- Glowing Eye -->
            <circle cx="100" cy="50" r="14" fill="#000" />
            <circle cx="105" cy="48" r="6" fill="#FF1744">
                <animate attributeName="opacity" values="1;0.4;1" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <!-- Vent Pipes -->
            <rect x="110" y="40" width="10" height="4" fill="#212121" />
            <rect x="110" y="84" width="10" height="4" fill="#212121" />
        </svg>
    `)}`,

    scout_wasp: `data:image/svg+xml;base64,${btoa(`
        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="24" cy="24" rx="18" ry="12" fill="#FFA726" stroke="#000" stroke-width="2" />
            <rect x="18" y="14" width="4" height="20" fill="#212121" />
            <!-- Scouter Eye -->
            <rect x="34" y="16" width="10" height="10" fill="#263238" />
            <rect x="36" y="18" width="6" height="6" fill="#F44336">
                <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
            </rect>
            <!-- Wings -->
            <path d="M20 15 L5 0 L15 10 Z" fill="rgba(200,200,255,0.5)" />
        </svg>
    `)}`
};

// Background Image Assets
export const BACKGROUND_IMAGES = {
    layer01: new Image(),
    layer02: new Image(),
    layer03: new Image()
};

BACKGROUND_IMAGES.layer01.src = 'assets/background/bg_PixelSky_layer01.png';
BACKGROUND_IMAGES.layer02.src = 'assets/background/bg_PixelSky_layer02.png';
BACKGROUND_IMAGES.layer03.src = 'assets/background/bg_PixelSky_layer03.png';
BACKGROUND_IMAGES.bgStart = new Image();
BACKGROUND_IMAGES.bgStart.src = 'assets/background/bg_start.png';
BACKGROUND_IMAGES.bgCharSelect = new Image();
BACKGROUND_IMAGES.bgCharSelect.src = 'assets/background/bg_character_select.png';

// Player Character Image Assets
export const PLAYER_IMAGES = {
    ch_player1: new Image(),
    ch_player2: new Image(),
    ch_player3: new Image(),
    ch_player4: new Image(),
    ch_player5: new Image()
};

PLAYER_IMAGES.ch_player1.src = 'assets/ch_player1.png';
PLAYER_IMAGES.ch_player2.src = 'assets/ch_player2.png';
PLAYER_IMAGES.ch_player3.src = 'assets/ch_player3.png';
PLAYER_IMAGES.ch_player4.src = 'assets/ch_player4.png';
PLAYER_IMAGES.ch_player5.src = 'assets/ch_player5.png';

// Global Asset Loader
export async function loadAllAssets() {
    const images = [
        ...Object.values(BACKGROUND_IMAGES),
        ...Object.values(PLAYER_IMAGES)
    ];

    const loadPromises = images.map(img => {
        return new Promise((resolve) => {
            if (img.complete) resolve();
            img.onload = resolve;
            img.onerror = resolve; // Continue even if some fail
        });
    });

    await Promise.all(loadPromises);
    console.log("✅ All assets processed (some may have failed but loop continues)");
}
