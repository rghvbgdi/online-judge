const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema({
    firstname : {
        type : String,
required : true,
    },
   lastname : {
        type : String,
required : true,
    },
    email : {
        type : String,
        default : null,
required : true,
unique : true,
    },
    password : {
        type : String,
required : true,
    },
    role : {
        type : String ,
        enum : ["user", "admin"],
        default : "user"
    },
    solvedProblems: [{ // Array to store problem numbers of solved problems
        type: Number,
        ref: 'Problem' // This creates a reference to the Problem model
    }]
})
module.exports = mongoose.model("user",userSchema);