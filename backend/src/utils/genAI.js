import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"
});

export async function triageWithGemini(rawText) {
  const result = await model.generateContent(buildPrompt(rawText));
  const text = result.response.text();

  return JSON.parse(text);
}
