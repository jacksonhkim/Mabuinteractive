
import { WebClient } from '@slack/web-api';
import fs from 'fs';
import path from 'path';

const SLACK_TOKEN = process.env.SLACK_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID || "#mabu-home";

const client = new WebClient(SLACK_TOKEN);

(async () => {
    try {
        const reportPath = path.resolve('프로젝트_문서/5_개발_및_QA/QA_REPORT_v3.md');

        if (!fs.existsSync(reportPath)) {
            console.error("❌ Report file not found:", reportPath);
            process.exit(1);
        }

        const rawContent = fs.readFileSync(reportPath, 'utf8');
        // Slack message formatting optimization
        const content = rawContent.substring(0, 3500); // Limit length

        console.log(`📡 Sending report to ${CHANNEL_ID}...`);

        await client.chat.postMessage({
            channel: CHANNEL_ID,
            text: "📢 **[피터 PM] 긴급 리포트 전송**",
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "📢 **[피터 PM] 긴급 리포트 전송**\nQA 검수 및 핫픽스 결과를 보고드립니다."
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "```" + content + "```"
                    }
                }
            ]
        });

        console.log("✅ Report sent successfully!");
    } catch (error) {
        console.error("❌ Error sending report:", error);
        console.error("Details:", JSON.stringify(error, null, 2));
    }
})();
