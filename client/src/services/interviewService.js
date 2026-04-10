import API from './api.js'

/*
FormData:
1. It is a builtin JS object that holds key-value pairs.
2. Useful for sending files like images, audio, etc.. And It properly handles the encoding of those files data .
3. append() to add data into FromData object.
*/

export const uploadResume =async (file)=>{
    const formData = new FormData()
    formData.append('resume', file) 
    const response = await API.post('/resume/upload', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
        //we are multiple parts of data like text, images(binary format), etc.. in the form of form-data. So we are mentioning content type like that
        // when we send data in json format. Simply we will use application/json
 } )
    return response.data.data 
    //axios => response.data gives data sent by the api (json object (axios automatically cnverts it)) 
    // fetch -> response.text() gives data sent by api (json string)
    // fetch -> response.json() gives the data sent by api by converting it into json object.

}

export const getResume = async ()=>{
    const response = await API.get('/resume')
    return response.data.data
}

export const startInterview = async (role, resumeText, totalQuestions)=>{
        const response = await API.post('/interview/start', {role, resumeText, totalQuestions})
        //axios converts the sending data into JSON string automatically (except for special data like form-data)
        //and axios automatically set Content-Type header for json data
        return response.data.data
}

export const submitTextAnswer = async (interviewId, answer) => {
  const response = await API.post(`/interview/${interviewId}/answer`, { answer });
  return response.data.data;
};

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'answer.webm');

  const response = await API.post('/interview/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const endInterview = async (interviewId) => {
  const response = await API.post(`/interview/${interviewId}/end`);
  return response.data.data;
};

export const getInterview = async (interviewId) => {
  const response = await API.get(`/interview/${interviewId}`);
  return response.data.data;
};

