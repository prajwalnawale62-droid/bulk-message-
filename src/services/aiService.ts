import { GoogleGenAI, Type } from "@google/genai";

export const enhanceMessage = async (
  message: string,
  tone: string,
  type: string
) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("AI Enhance: GEMINI_API_KEY is not defined in environment variables.");
    return message;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Enhance this WA message: ${message}\nTone: ${tone}. Type: ${type}.\nReturn ONLY enhanced message.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    const enhanced = response.text?.trim() || message;
    console.log("AI Enhanced Message:", enhanced);
    return enhanced;
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    return message;
  }
};

export const generateTemplate = async (
  promptText: string,
  tone: string,
  length: string,
  language: string
) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("AI Generate: GEMINI_API_KEY is not defined in environment variables.");
    return "Failed to generate. Please try again.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `You are expert WA copywriter for Indian businesses.\nWrite: ${promptText}. Tone: ${tone}. Length: ${length}.\nLanguage: ${language}. WhatsApp format with emojis.\nReturn ONLY the message.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text?.trim() || "Failed to generate. Please try again.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Failed to generate. Please try again.";
  }
};
