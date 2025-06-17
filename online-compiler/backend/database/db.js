const mongoose = require ('mongoose');
const dotenv = require ('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DBConnection = async ()=>{
    const MONGO_URI= process.env.MONGODB_URL;
    try{
        await mongoose.connect(MONGO_URI);
        console.log(" DB connection established");
    }
    catch(error){
        console.log("Error while connecting to MongoDB", error);
    }
}

module.exports = {DBConnection};