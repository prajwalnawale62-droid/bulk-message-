import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const enhanceMessage = async (
  message: string,
  tone: 'professional' | 'friendly' | 'marketing' | 'motivational',
  options: { emoji?: boolean; grammar?: boolean; language?: string }
) => {
  if (!apiKey) return message;

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Enhance the following WhatsApp message:
    Message: "${message}"
    Tone: ${tone}
    Include Emojis: ${options.emoji ? 'Yes' : 'No'}
    Correct Grammar: ${options.grammar ? 'Yes' : 'No'}
    Target Language: ${options.language || 'English'}
    
    Rules:
    1. Keep it concise for WhatsApp.
    2. Maintain the core meaning.
    3. Use placeholders like {name}, {batch}, {course} if they exist in the original.
    4. Return ONLY the enhanced message text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || message;
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    return message;
  }
};
