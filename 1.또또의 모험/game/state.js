export const state = {
    score: 0,
    lives: 3,
    keys: {},
    player: {
        x: 100,
        y: 300,
        vx: 0,
        vy: 0,
        width: 192,
        height: 192,
        color: '#ffcc00',
        strokeColor: '#ffffff',
        lastShotTime: 0,
        shotDelay: 200,
        invincibleTime: 0,
        powerLevel: 1,
        maxPowerLevel: 5,
        bombCount: 3,
        chargeValue: 0,
        maxChargeValue: 60,
        id: 'toto'
    },
    enemies: [],
    bullets: [],
    items: [],
    bombs: [],
    particles: [],
    enemyBullets: [],
    boss: null,
    bgOffset: 0,
    gameActive: false,
    gameOver: false,
    isSelectingCharacter: false,
    selectedCharIndex: 0,
    lastSpawnTime: 0,
    spawnInterval: 1500,
    currentStage: 1,
    stageCleared: false,
    bossSpawnedInStage: false,
    stageTransitionTimer: 0,
    stageStartScore: 0,
    isDialogueActive: false,
    dialogueIndex: 0,
    isBranching: false,
    selectedBranch: 'day',
    isWorldMapActive: false,
    isWorldMapReady: false,
    worldMapTimer: 0,
    mapProgress: 0,
    isContinuing: false
};

export function resetState() {
    state.score = 0;
    state.lives = 3;
    state.keys = {};

    // Reset Player
    state.player.x = 100;
    state.player.y = 300;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.lastShotTime = 0;
    state.player.invincible = false;
    state.player.invincibleTime = 0;
    state.player.powerLevel = 1;
    state.player.bombCount = 3;
    state.player.chargeValue = 0;

    // Reset Game Entities
    state.enemies = [];
    state.bullets = [];
    state.items = [];
    state.bombs = [];
    state.particles = [];
    state.enemyBullets = [];
    state.boss = null;

    // Reset Progress Flags
    state.bgOffset = 0;
    state.gameActive = false;
    state.gameOver = false;
    state.isTitleScreen = true;
    state.isSelectingCharacter = false;
    state.currentStage = 1;
    state.stageCleared = false;
    state.bossSpawnedInStage = false;
    state.stageTransitionTimer = 0;
    state.stageStartScore = 0;
    state.isDialogueActive = false;
    state.isWorldMapActive = false;
    state.isWorldMapReady = false;
    state.isContinuing = false;
}

// Expose state for cheats/debugging
window.state = state;
