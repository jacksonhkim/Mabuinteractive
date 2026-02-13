import { WebClient } from '@slack/web-api';
import { SLACK_TOKEN, CHANNEL_ID } from './API_KEY/config.mjs';

// 토큰 확인
if (!SLACK_TOKEN || SLACK_TOKEN === "xoxb-your-slack-bot-token-here") {
    console.error("❌ Error: SLACK_TOKEN이 설정되지 않았습니다. API_KEY/config.mjs 파일을 확인해주세요.");
    process.exit(1);
}

const client = new WebClient(SLACK_TOKEN);

async function sendSlackMessage(channel, text) {
    try {
        const result = await client.chat.postMessage({
            channel: channel,
            text: text,
        });
        console.log(`✅ Message sent successfully: ${result.ts}`);
    } catch (error) {
        console.error(`❌ Error sending message: ${error.message}`);
    }
}

// 실행
(async () => {
    const message = "헬로 월드! 안티그래비티에서 보냄";
    console.log(`Sending message to ${CHANNEL_ID}...`);
    await sendSlackMessage(CHANNEL_ID, message);
})();
