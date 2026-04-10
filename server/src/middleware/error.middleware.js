/* It handles two cases - 
1. not found routes
2. unknown errors
*/

export const notFoundHandler = (req, res)=>{
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    })
}


/**
 * Global Error Handler - Catches all errors.
 * Express knows this is an error handler because
 * it has 4 parameters: (err, req, res, next)
*/

export const errorHandler = (err, req, res, next)=>{
    //log the error
    console.log('Error:', err.message)

    //Below code works for both known and unknown errors
    const statusCode = err.statusCode || 500 

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Something went wrong on the server'
    })
}