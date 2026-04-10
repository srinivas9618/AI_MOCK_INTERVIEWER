// configuring gemini api client and defining a functionality to generate content.


import { GoogleGenAI } from "@google/genai";
//GoogleGenAI is a class
//Initialize our client with the gemini api key.(it's a client to the gemini api)

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-3.1-flash-lite-preview";

const generateContent = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
};

export { generateContent };