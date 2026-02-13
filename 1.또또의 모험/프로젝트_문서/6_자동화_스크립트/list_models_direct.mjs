
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_API_KEY } from "./API_KEY/config.mjs";

console.log("🔍 API Key Check (First 5 chars):", GOOGLE_API_KEY.substring(0, 5));

// SDK가 아닌 직접 Fetch로 모델 리스트 확인
async function fetchModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\n✅ Available Models:");
            data.models.forEach(model => {
                if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${model.name} (${model.displayName})`);
                }
            });
        } else {
            console.error("❌ No models found or API Error:", data);
        }
    } catch (error) {
        console.error("❌ Fetch Error:", error);
    }
}

fetchModels();
