// this file is the entry point for server

import "dotenv/config" //load env variables before anything use them
import app from './src/app.js' //import our configured Express app
import connectDB from './src/config/db.config.js' //import the db connection fun

const PORT = process.env.PORT || 5000; // Get the port
// process object is the global instance that provides info about current Node.Js process. It is acessible in every module automatically.
// Used to access env varibales, to check the system details, and to manage the current process - start, run and exit.


//define a function to start the server
const startServer = async()=>{
    try{
        //step1 : connect to db
        await connectDB()

        //step2 : start listening on the port for HTTP requests
        app.listen(PORT, ()=>{
            console.log(`\n Server is running on port ${PORT}`)
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
            console.log(`URL: http://localhost:${PORT}\n`)
        })
    }
    catch(error){
        //if anything fails, log the error and exit the process
        console.error("Failed to start the server:", error.message)
        process.exit(1)
    }
}

startServer() //call the fun to start the server

