import mongoose from 'mongoose'
//helper library to define the schema,model and to establish the connection with our cluster.

const resumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,  //it's type is the type of unique Id ( __id) generated to each document by the mongodb. Simply, it is the type of mongodb document id.
            required: true,
            ref: 'User', // userId holds the ref to the particular User document
            index: true    // we can use userId as an index to access the document fast
        },
        fileName: {
            type: String,
            required: true

        },
        extractedText: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Resume = mongoose.model('Resume', resumeSchema) 
// model is an interface for us to perform operations on our collection. 
// mongoose creates a model and links it to the collection named 'resumes' if it did not find then it creates a new collection. And model also takes care about our schema, it ensure that every document creation or updation follows our schema.

export default Resume 