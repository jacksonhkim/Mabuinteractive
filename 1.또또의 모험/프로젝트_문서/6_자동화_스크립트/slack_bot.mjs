import { App } from '@slack/bolt';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { askGemini } from './gemini_helper.mjs';

const execAsync = promisify(exec);
import { SLACK_TOKEN, SLACK_APP_TOKEN } from './API_KEY/config.mjs';

// 토큰 체크
if (!SLACK_TOKEN || !SLACK_APP_TOKEN ||
    SLACK_TOKEN.startsWith('xoxb-your') || SLACK_APP_TOKEN.startsWith('xapp-your')) {
    console.error("❌ Error: SLACK_TOKEN (xoxb-...)과 SLACK_APP_TOKEN (xapp-...)을 모두 설정해야 합니다.");
    console.error("👉 API_KEY/config.mjs 파일을 열어 토큰을 입력해주세요.");
    process.exit(1);
}


// 봇 초기화 (Socket Mode)
const app = new App({
    token: SLACK_TOKEN,
    appToken: SLACK_APP_TOKEN,
    socketMode: true,
    logLevel: 'debug', // Enable debug logging
});

// 모든 이벤트 로깅 (디버깅용)
app.use(async ({ logger, payload, next }) => {
    // console.log("🔍 Received payload:", JSON.stringify(payload, null, 2));
    await next();
});


// 1. "안녕"에 응답
app.message(/안녕|하이|가보자/i, async ({ message, say }) => {
    await say(`안녕하세요! 👋 마부 인터랙티브의 AI 어시스턴트입니다.\n무엇을 도와드릴까요?`);
});

// 2. 회사 소개
app.message(/회사|마부|제작자/i, async ({ message, say }) => {
    await say(`🏢 **마부 인터랙티브 (Mabu Interactive)**\n"Driving Interactive Experiences"\n우리는 유저의 경험을 주도하는 차세대 게임 스튜디오입니다.`);
});

// 3. 게임 소개
app.message(/게임|또또/i, async ({ message, say }) => {
    await say(`🐝 **또또의 모험 (The Adventure of Toto)**\n마부 인터랙티브의 첫 번째 타이틀! 횡스크롤 액션 슈팅 게임입니다.\n지금 바로 플레이해보세요!`);
});


// 4. 업무 자동화 명령어 (ChatOps)
// PPT 생성
app.message(/PPT|피피티/i, async ({ message, say }) => {
    await say(`📄 **PPT 문서 생성을 시작합니다...**\n잠시만 기다려주세요.`);
    try {
        const { stdout, stderr } = await execAsync('node generate_all_ppt_v2.mjs');
        await say(`✅ **PPT 생성 완료!**\n\`\`\`\n${stdout}\n\`\`\``);
    } catch (error) {
        await say(`❌ **오류 발생**\n\`\`\`\n${error.message}\n\`\`\``);
    }
});

// QA 엑셀 생성
app.message(/QA|큐에이/i, async ({ message, say }) => {
    await say(`📊 **QA 엑셀 리포트 생성을 시작합니다...**\n잠시만 기다려주세요.`);
    try {
        const { stdout, stderr } = await execAsync('node generate_qa_excel.mjs');
        await say(`✅ **QA 리포트 생성 완료!**\n\`\`\`\n${stdout}\n\`\`\``);
    } catch (error) {
        await say(`❌ **오류 발생**\n\`\`\`\n${error.message}\n\`\`\``);
    }
});

// 5. 앱 멘션 처리 (@봇이름 안녕)
app.event('app_mention', async ({ event, say }) => {
    await say(`부르셨나요? <@${event.user}>님! 🐎\n저는 **PPT 생성**, **QA 문서** 작업을 도와드릴 수 있습니다.`);
});


// ======================================
// 6. 자연어 대화 (Gemini AI 연동)
// ======================================
// 위에서 처리되지 않은 모든 메시지는 Gemini에게 물어봄
app.message(async ({ message, say }) => {
    // 봇 자신이 보낸 메시지는 무시
    if (message.bot_id) return;

    // 사용자 입력
    const userText = message.text;
    console.log(`🗣️ User: ${userText}`);

    // 시스템 프롬프트 (페르소나 설정)
    const systemPrompt = `
    너는 '마부 인터랙티브(Mabu Interactive)'의 유능하고 친절한 AI 어시스턴트야.
    우리 회사는 'The Adventure of Toto(또또의 모험)'이라는 횡스크롤 슈팅 게임을 개발하고 있어.
    
    [너의 역할]
    1. 사용자의 질문에 친절하고 전문적으로 답변한다.
    2. 게임 개발, 코딩, 기획 관련 질문에 강하다.
    3. 모르는 내용은 솔직하게 모른다고 하고, 사용자가 더 구체적으로 질문하도록 유도한다.
    4. 대화 끝에는 항상 격려의 말이나 이모지(😊, 🚀 등)를 붙여 분위기를 띄운다.
    
    [사용자 질문]: ${userText}
    `;

    // 생각 중 표시 (이모지 반응)
    // (Slack API 한계로 반응을 남기기 어렵다면 "잠시만요..." 메시지 전송 고려)

    try {
        const reply = await askGemini(systemPrompt);
        await say(reply);
    } catch (error) {
        console.error(error);
        await say("죄송해요, AI 서버 상태가 좋지 않아 답변을 드릴 수 없어요. 😢");
    }
});

// 봇 시작
(async () => {
    await app.start();
    console.log('⚡️ Mabu Assistant (powered by Gemini) is running!');
    console.log('💬 이제 슬랙 채널에서 자유롭게 대화해보세요!');
})();
