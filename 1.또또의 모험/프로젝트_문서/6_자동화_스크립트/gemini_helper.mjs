
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_API_KEY } from "./API_KEY/config.mjs";

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

/**
 * Gemini 모델을 사용하여 텍스트 프롬프트에 대한 응답을 생성합니다.
 * @param {string} prompt - 질문이나 요청 내용
 * @returns {Promise<string>} - 모델의 응답 텍스트
 */
export async function askGemini(prompt) {
    try {
        // 최신 Gemini 2.0 Flash 사용 (목록에서 확인됨)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("❌ Gemini API Error:", error.message);
        if (error.message.includes("403")) {
            return "죄송합니다, API 키 오류입니다. (권한 없음 403)";
        }
        if (error.message.includes("429")) {
            return "너무 많은 요청이 들어와서 잠시 쉬고 있습니다. (Quota Exceeded 429)";
        }
        return `죄송합니다, 생각할 시간이 필요해요. (오류: ${error.message})`;
    }
}

// 테스트 실행 (직접 실행 시에만 작동)
if (process.argv[1] === import.meta.url) {
    (async () => {
        console.log("🤖 Gemini에게 인사하는 중...");
        const reply = await askGemini("안녕! 너는 누구니?");
        console.log("답변:", reply);
    })();
}
