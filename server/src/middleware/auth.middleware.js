// protects routes that require login
// check if the request has a valid JWT token

import {verifyToken} from '../utils/jwt.utils.js' // to verify JWT token
import User from '../models/User.model.js'  

const authenticate = async (req, res, next)=>{
    try{
        //Get the authorization header
        const authHeader = req.headers.authorization 

        //check if token exists
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json(
                {
                    success: false,
                    message: 'Please log in to access this route.'
                }
            )
        }

        //Extract token
        const token = authHeader.split(' ')[1]

        //verify token using jwt utility
        const payload = verifyToken(token) // payload will be received on successful verification 

        //Find the user in the database using payload
        const user = await User.findById(payload.id).select('-password') //exclude password details

        //Handling the user account deletion case
        if(!user){
            return res.status(401).json({
                success: false,
                message: 'User not found. Please log in again.'
            })
        }

        //Attach the user to request - now all handlers can access the user
        req.user = user 

        next() // calling the next handler



    }
    catch(error){
        //handling known error
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        })
    }
}

export default authenticate