const mongoose = require ('mongoose');

const DBConnection = async ()=>{
    const MONGO_URI= process.env.MONGODB_URL;
    try{
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`✅ DB connection established successfully`);
        return conn; // Return the connection object
    }
    catch(error){
        console.error("❌ Error while connecting to MongoDB:", error.message);
        process.exit(1); // Exit the process with a failure code if the database connection fails.
    }
}

module.exports = {DBConnection};