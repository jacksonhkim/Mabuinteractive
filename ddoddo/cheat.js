
// Development Cheats
window.gameCheat = function (type) {
    const state = window.state;
    if (!state || (!state.gameActive && type !== 'nextStage')) {
        alert("게임 시작 후 사용 가능합니다.");
        return;
    }
    const sound = window.sound;
    const updateBombUI = window.updateBombUI;
    const startDialogue = window.startDialogue;
    const startEndingSequence = window.startEndingSequence;

    switch (type) {
        case 'killBoss':
            if (state.boss) {
                state.boss.hp = 0;
                console.log("Boss Killed by Cheat");
            } else {
                console.log("No Boss to Kill");
                state.score += 5000;
                const scoreEl = document.getElementById('score');
                if (scoreEl) scoreEl.innerText = state.score.toString().padStart(6, '0');
            }
            break;
        case 'maxPower':
            state.player.powerLevel = 5;
            if (sound) sound.playPowerUp();
            console.log("Max Power Activated");
            break;
        case 'fullBomb':
            state.player.bombCount = 99;
            if (updateBombUI) updateBombUI();
            if (sound) sound.playItemGet();
            console.log("Full Bomb Activated");
            break;
        case 'invincible':
            state.player.invincible = !state.player.invincible;
            state.player.invincibleTime = state.player.invincible ? 999999 : 0;
            console.log("God Mode: " + state.player.invincible);
            break;
        case 'qaSpeedUp':
            if (window.CONFIG) {
                window.CONFIG.GAME_SPEED = 5.0;
                state.player.speed = 15.0;
                console.log("Cheat: Speed x5 for QA!");
            }
            break;
        case 'spawnBoss':
            if (!state.boss) {
                state.score = state.stageStartScore + 3000;
                console.log("Cheat: Boss condition met. Boss will spawn soon.");
            }
            break;
        case 'nextStage':
            state.currentStage++;
            state.stageCleared = false;
            state.boss = null;
            state.bossSpawnedInStage = false;
            state.score += 10000;
            state.stageStartScore = state.score;
            const scoreEl2 = document.getElementById('score');
            if (scoreEl2) scoreEl2.innerText = state.score.toString().padStart(6, '0');
            if (startDialogue) startDialogue(state.currentStage);
            console.log("Warped to Stage " + state.currentStage);
            break;
        case 'ending':
            state.gameActive = false;
            if (startEndingSequence) startEndingSequence();
            console.log("Forced Ending Sequence");
            break;
    }
};
