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
    }
})
module.exports = mongoose.model("user",userSchema);