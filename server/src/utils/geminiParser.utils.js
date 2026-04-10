// Gemini response parser
export const parseGeminiJSON = async (text) => {
  try {
    let cleanText = (text || '').trim();

    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '');
      cleanText = cleanText.replace(/\s*```$/, '');
    }

    return JSON.parse(cleanText);
  } catch (error) {
    console.log(`Failed to parse the Gemini JSON response: ${error.message}`);
    console.log(`Raw text was: ${text}`);
    throw new Error(
      'Failed to parse the AI response. AI returned an unexpected response.'
    );
  }
};