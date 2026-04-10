//axios is a third party js package for making HTTP requests.
/*
 advantages compared to inbuilt fetch():-
1. Automatic JSON parsing while sending & receiving data 
2. Handling errors:Axios rejects the promise automatically if the server returns an error (like 404 or 500). fetch only rejects on network failure and for other errors need to check manually.
3. Interceptors: You can "intercept" every request to automatically add things like Auth Tokens
4. Timeouts: You can easily set a timer so the request cancels if the server takes too long.
 */

import axios from 'axios'

const API = axios.create(
 {
    baseURL : import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
 }
)

//attach JWT to every request using interceptor
// config is an object contains all the information related to our request - URL, method, Headers, body, etc..
API.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config 
}) 

export default API