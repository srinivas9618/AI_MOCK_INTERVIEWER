// this file is Auth controller 
// It handles HTTP requests for authentication
// Route -> Controller -> Service -> Database

import * as authService from '../services/auth.service.js'

/* 
handling route: /api/auth/register
registering with email, password
*/

export const registerUser = async(req, res, next)=>{
    try{
        const {name, email, password} = req.body

        //if name or email or password is absent then it is bad request so return res with 400 status code and message
        if(!name || !email || !password){
            return res.status(400).json({success: false, message:"Name, Email and Password are required."})
        }

        //if password is innvalid then it is bad request so return res with 400 status code and message
        if(password.length < 6){
            return res.status(400).json({success: false, message:"Password must be atleast 6 characters."})
        }

        // use register service to register the user and store the response from register service
        const result = await authService.register(name, email, password)
       
        // if execution came upto here then it means no error happenend and our request is fulfilled

        // return the response with success status code and send data received from service also
        return res.status(201).json({success:true, data: result})
        // 201 is for successful post or put requests
    }
    catch(error){
        //if error is known then send res with status code and error msg
        if(error.statusCode){
            return res.status(error.statusCode).json({success: false, message: error.message})
        }

        //handling unknown error through middleware 
        next(error)

        
    }
}

/**
 * POST /api/auth/login
 * Login with email and password.
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const result = await authService.emailLogin(email, password);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get the current logged-in user's profile.
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Logout user (frontend deletes the token).
 */
export const logout = (req, res) => {
  return res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
};