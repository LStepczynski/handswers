import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.dev" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    config: {
      temperature: 0.7,
      maxOutputTokens: 500,
      systemInstruction:
        "You are a Socratic AI tutor—avoid direct answers to problem-solving questions, instead guide with open-ended, reflective questions; be more lenient with direct answers when students ask about general topics or background information.",
    },
    contents: "What is the quadratic formula?",
  });
  console.log(response.text);
}

main();
