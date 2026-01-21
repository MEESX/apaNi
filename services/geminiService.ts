
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyContent = async (date: Date) => {
  const dateStr = date.toDateString();
  const prompt = `Provide detailed traditional Chinese calendar (Lunar Calendar) information for ${dateStr}. 
  Include:
  1. Lunar Year with Heavenly Stems and Earthly Branches (e.g., 'Jia Chen').
  2. The Chinese Zodiac animal for the year.
  3. The Lunar Month and Lunar Day in traditional format.
  4. Any current Solar Term (e.g., 'Li Chun') if applicable.
  5. Any major traditional Chinese festival occurring on this day.
  
  Also provide a random English idiom that is motivational, positive, or witty/cynical.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lunarInfo: {
            type: Type.OBJECT,
            properties: {
              stemsBranches: { type: Type.STRING, description: "Heavenly Stems and Earthly Branches, e.g., 'Jia Chen'" },
              zodiac: { type: Type.STRING, description: "Chinese Zodiac animal emoji and name" },
              lunarDateStr: { type: Type.STRING, description: "e.g., Month 1, Day 15" },
              solarTerm: { type: Type.STRING, description: "Solar term if any, else empty string" },
              festival: { type: Type.STRING, description: "Festival name if any, else empty string" }
            },
            required: ["stemsBranches", "zodiac", "lunarDateStr"]
          },
          idiom: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              meaning: { type: Type.STRING },
              tone: { type: Type.STRING, enum: ["positive", "cynical", "motivational"] }
            },
            required: ["text", "meaning", "tone"]
          }
        },
        required: ["lunarInfo", "idiom"]
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return {
      lunarInfo: { stemsBranches: "...", zodiac: "...", lunarDateStr: "Loading..." },
      idiom: { text: "Better late than never.", meaning: "It is better to do something late than not at all.", tone: "positive" }
    };
  }
};
