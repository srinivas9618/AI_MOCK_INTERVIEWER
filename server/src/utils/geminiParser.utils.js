//gemini response parser 

export const parseGeminiJSON = async (text)=>{
   try {const cleanText = text.trim()
    if(cleanText.startsWith('```')){
        cleanText.replace(/^'''\s*(?:json)?\s*/, '')
        // in js regex pattern is enclosed in forward slashes
        cleanText.replace(/\s*```$/, '') 
    }
    return JSON.parse(cleanText)}
    catch(error){
        console.log(`Failed to parse the Gemini JSON response:${error.message}`)
        console.log(`Raw text was: ${text}`)
        throw new Error("Failed to parse the AI response, AI returned an unexcepted response.") 
    }
}