
import * as pdfJsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import Resume from '../models/Resume.model.js'

export const parseResume = async (pdfBuffer)=>
{

try
{    const uint8Array = new Uint8Array(
        pdfBuffer.buffer, // main buffer
        pdfBuffer.byteOffset, // startpoint
        pdfBuffer.byteLength // for endpoint 
    )
    const loadingTask = pdfJsLib.getDocument(uint8Array); // converting uint8Array into actual pdf content which contains pages. each page contains list of fragments along with coordinate positions. 
    const pdf = await loadingTask.promise // getting on resolving that asyncronous task

    let extractedText = ''

    for(let pageNum = 1; pageNum <=pdf.numPages; pageNum++){
        const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      extractedText += strings.join(' ');
    }

    if(!extractedText || extractedText.trim().length === 0){
        throw new Error("No text could be extracted from the pdf")
    }
   
   
    return extractedText;
}

catch(error)
{
    console.log(`PDF Parse Error: ${error.message}`)
    throw new Error('Failed to parse PDF. Please upload a valid PDF file.')
}

}

export const saveResume = async(userId, fileName, extractedText)=>{
    const resume = await Resume.findOneAndUpdate(
        {userId},
        {userId, fileName, extractedText},
        { returnDocument: "after", upsert: true}
    )

    return resume
}

export const getUserResume =async(userId)=>{
    const resume = await Resume.findOne({userId}).select('-__v') // excluding version field in the document
    return resume
}

