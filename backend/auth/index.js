const express = require('express');
const app = express();
const {DBConnection}= require("../database/db");
const user = require('../model/user');//importing user model from mongodb
const Problem = require('../model/problem');//importing problem model from mongodb
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const cors = require('cors');
app.use(cors());


DBConnection();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/",(req,res)=> {
    res.send("hello world is coming from backend");
});

function isStrongPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(password);
  }


app.post("/register",async (req,res)=> {
   try{ //get all the data
    const {firstname , lastname ,email , password} =req.body;
    //check that all the data should exist
    if(!(firstname && lastname && email && password)){
        return res.status(400).send("please enter all the information");
    }
    //check if user already exist
const existingUser= await user.findOne({email});
if(existingUser){
return res.status(400).send("user already exist");
}


if (!isStrongPassword(password))   {
  return res.status(400).send("Password must be at least 6 characters long and include at least one uppercase letter and one number.");
}// checking if the password is strong or not
//hashing/encrpyt the password
const hashedPassword= await bcrypt.hash(password,10);


//save the user in the db
const newuser = await user.create({
    firstname,
    lastname,
    email,
    password: hashedPassword,
});
// generate a token for user and send it
const token = jwt.sign({ id: newuser._id , email }, process.env.SECRET_KEY,
{expiresIn : '1h'}
);
newuser.token=token;
newuser.password = undefined;
res.status(200).json({message : 'You have succesfully registered!',user : newuser})

}
//catch any error that might be there in the above try code
catch(error){
    console.error("Register route error:", error);
    //tell that there is something wrong i.e we catched a error
    res.status(500).json({ message: "something went wrong", error: error.message });
}
});

app.post("/login", async (req,res)=> {
try{
    const {email , password }=req.body;
    if(!(email && password)){
        return res.status(400).send("please enter all the information");
    }
    const existingUser= await user.findOne({email});
    if(!existingUser){
        return res.status(404).send("user not found");
    }

    const isPasswordCorrect= await bcrypt.compare(password,existingUser.password);
    if(!isPasswordCorrect){
        return res.status(401).send("invalid credentials");
    }
    const token = jwt.sign(
        { id: existingUser._id, email },
        process.env.SECRET_KEY,
        { expiresIn: '1h' }
      );
      existingUser.token = token;
      existingUser.password =  undefined;

      res.status(200).json({ message: 'You have successfully logged in!', user: existingUser });

}

catch(error){
    console.error("Login route error:", error);
    res.status(500).json({ message: "something went wrong", error: error.message });
}
});


app.post("/problems", async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;

    if (!(title && description && difficulty)) {
      return res.status(400).json({ message: "Please provide title, description, and difficulty" });
    }

    const lastProblem = await Problem.findOne().sort({ problemNumber: -1 }).exec();
    const newProblemNumber = lastProblem ? lastProblem.problemNumber + 1 : 1;

    const newProblem = new Problem({
      problemNumber: newProblemNumber,
      title,
      description,
      difficulty,
    });

    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (error) {
    console.error("Error creating problem:", error);
    res.status(500).json({ message: "Failed to create problem", error: error.message });
  }
});

app.delete('/problems/:problemNumber', async (req, res) => {
    try {
      const problemNumber = parseInt(req.params.problemNumber, 10);
      if (isNaN(problemNumber)) {
        return res.status(400).json({ message: 'Invalid problem number' });
      }
  
      const deleted = await Problem.findOneAndDelete({ problemNumber });
  
      if (!deleted) {
        return res.status(404).json({ message: 'Problem not found' });
      }
  
      res.status(200).json({ message: `Problem ${problemNumber} deleted successfully.` });
    } catch (error) {
      console.error('Error deleting problem:', error);
      res.status(500).json({ message: 'Failed to delete problem', error: error.message });
    }
  });


app.get('/problems/:problemNumber', async (req, res) => {
  try {
    const problemNumber = parseInt(req.params.problemNumber, 10);
    if (isNaN(problemNumber)) {
      return res.status(400).json({ message: 'Invalid problem number' });
    }

    const problem = await Problem.findOne({ problemNumber }).exec();

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ message: 'Failed to fetch problem', error: error.message });
  }
});

app.get('/problems', async (req, res) => {
    try {
      const problems = await Problem.find().sort({ problemNumber: 1 }); // Sorted ascending
      res.status(200).json(problems);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      res.status(500).json({ message: "Failed to fetch problems" });
    }
  });



//
app.listen(process.env.PORT, () => { 
    console.log(`server is listening on port ${process.env.PORT}!`);
});