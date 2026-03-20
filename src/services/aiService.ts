import { GoogleGenAI, Type } from "@google/genai";

export const enhanceMessage = async (
  message: string,
  tone: 'professional' | 'friendly' | 'marketing' | 'motivational',
  options: { emoji?: boolean; grammar?: boolean; language?: string }
) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("AI Enhance: GEMINI_API_KEY is not defined in environment variables.");
    return message;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Enhance the following WhatsApp message for a Teachtaire user:
    Message: "${message}"
    Tone: ${tone}
    Include Emojis: ${options.emoji ? 'Yes' : 'No'}
    Correct Grammar: ${options.grammar ? 'Yes' : 'No'}
    Target Language: ${options.language || 'English'}
    
    Teachtaire AI Upgrade Rules:
    1. Generate high-converting marketing copy if tone is 'marketing'.
    2. Suggest campaign improvements (e.g., better call-to-action).
    3. Detect potential errors in bulk sending (e.g., missing placeholders).
    4. Provide smart reply suggestions for common customer queries.
    5. Keep it concise for WhatsApp.
    6. Maintain the core meaning.
    7. Use placeholders like {name}, {batch}, {course} if they exist in the original.
    8. Return ONLY the enhanced message text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const enhanced = response.text?.trim() || message;
    console.log("AI Enhanced Message:", enhanced);
    return enhanced;
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    return message;
  }
};

export const generateTemplate = async (prompt: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("AI Generate: GEMINI_API_KEY is not defined in environment variables.");
    return "Failed to generate. Please try again.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a WhatsApp message template generator. 
  Generate a professional WhatsApp message template based on the user's description. 
  Return only the message text, nothing else. 
  Keep it under 300 characters. 
  Use placeholders like {name}, {batch}, {course} if appropriate.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction
      }
    });
    
    return response.text?.trim() || "Failed to generate. Please try again.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Failed to generate. Please try again.";
  }
};
