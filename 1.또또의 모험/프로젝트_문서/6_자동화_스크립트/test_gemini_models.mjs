
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_API_KEY } from "./API_KEY/config.mjs";

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// 사용 가능한 모델 목록 조회
async function listModels() {
    try {
        // v1beta APIClient 접근
        // GoogleGenerativeAI SDK는 내부적으로 모델 리스트 메서드를 직접 노출하지 않을 수 있으나
        // getGenerativeModel()을 통해 접근 가능한 모델은 일반적으로 "gemini-pro" 또는 "gemini-1.5-flash"입니다.
        // 여기서는 가장 확실한 방법인 "curl" 등을 사용하는 대신,
        // SDK의 getGenerativeModel()을 테스트하여 어떤 모델이 반응하는지 직접 확인합니다.

        const candidates = [
            "gemini-pro",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-ultra" // 이건 유료일 수 있음
        ];

        console.log("🔍 Gemini 모델 연결 테스트 시작...");

        for (const modelName of candidates) {
            process.stdout.write(`👉 모델 테스트: ${modelName} ... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("hello");
                const response = await result.response;
                console.log(`✅ 성공! response: ${response.text().substring(0, 10)}...`);
            } catch (error) {
                console.log(`❌ 실패 (${error.message.split('\n')[0]})`);
            }
        }

    } catch (error) {
        console.error("Critical Error during model listing:", error);
    }
}

listModels();
