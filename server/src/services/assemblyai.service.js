//provides speech to text service
// AssemblyAI's SDK expects a file path, so we save the buffer to a temporary file using os.tmpdir(). The finally block guarantees cleanup even on error, preventing temp file accumulation.

import { AssemblyAI } from 'assemblyai'; 
import fs from 'fs'; // 'file-system' package handles file operation - CRUD
import path from 'path'; //handles path operations of files and directories
import os from 'os'; // to get OS information

//transcribe -> convert audio into written words
//transcript -> the document of those written words 

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
}); // creating/configuring a client using AssemblyAI class by giving api key.

export const transcribeAudio = async (audioBuffer, originalName) => {
  const extension = path.extname(originalName) || '.webm';
  const tempPath = path.join(os.tmpdir(), `interview-audio-${Date.now()}${extension}`);
//os.tmpdir() gives the path of TEMP directory present in our OS
//we are creating temp path for our audio file
  try {
    fs.writeFileSync(tempPath, audioBuffer);
    // it goes to the mentioned path. If file exists then it overwrites the existing data. If file doesn't exist then it create a new one & writes the data.
    // it is a syncronous operation -> The execution will go the next step only after completing the current operation operation.
    const transcript = await client.transcripts.transcribe({
      audio: tempPath,
      speech_models: ['universal-2'],
    }); //creating transcript for the audio by providing audio buffer file path to the assemblyAi client

    if (transcript.status === 'error') {
      throw new Error(`Transcription failed: ${transcript.error}`);
    }

    return transcript.text || '[No speech detected in the recording]';
  } catch (error) {
    console.error('AssemblyAI Transcription Error:', error.message);
    throw new Error('Speech-to-text service is currently unavailable.');
  } finally {
    try {
      // check the existance of file syncronously in the temp path. If it exists then delete it synchronously.
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (cleanupError) {
        // handling the temp file cleanup errors
      console.error('Temp file cleanup error:', cleanupError.message);
    }
  }
};