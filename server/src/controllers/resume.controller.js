import * as resumeService from '../services/resume.service.js' 

export const uploadResume = async (req, res, next)=>{

try{    
    if(!req.file){
        return res.status(400).json({success:false, message:"No file uploaded. Please upload a resume PDF"})
    }

    const extractedText =await resumeService.parseResume(req.file.buffer)

    const resume = await resumeService.saveResume(req.user._id, req.file.originalname, extractedText)

    return res.json({success: true, data:{
        resumeId: resume._id,
        fileName: resume.fileName,
        text: resume.extractedText,
        preview: resume.extractedText.substring(0,500)
    }})
}
catch(error){
    next(error)
}

}

export const getResume = async(req, res, next)=>{
    try{
        const resume = await resumeService.getUserResume(req.user._id)
        if(!resume){
            return res.json({
                success:true,
                data: null,
                message: "No resume found. Please upload a resume."
            })
        }
        return res.json({
            success:true,
            data:{
                resumeId: resume._id,
                fileName: resume.fileName,
                text: resume.extractedText,
                preview: resume.extractedText.substring(0,500)
            }
        })
    }
    catch(error){
        next(error)
    }
}

