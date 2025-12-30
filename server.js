//1. Importing packages
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from './middleware/auth.js';

// 2. Creating the Express app
const app = express();

// 3. MiddleWare- reading from data
app.use(express.urlencoded({extended:true}));

// 4. Add the JSON
app.use(express.json())

//5. connect to mongodb
const url = "mongodb://localhost:27017";
mongoose.connect(url,{dbName:"Authentication",})
.then(()=>console.log("MongoDB is connected ..."))
.catch((err)=>console.log('Error :',err));

//6. JWT Secret
// const JWT_SECRET = 'mySuperSecretKey'
const JWT_SECRET = process.env.JWT_SECRET  || 'mySuperSecretKey';

// 7.Creating User Schema
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

// 8.Creating User Model
const User = mongoose.model('user',userSchema);

// Login Page Route
app.get('/',async(req,res)=>{
    res.render("login.ejs");
});

// 9.Register page route
app.get('/register',(req,res)=>{
    res.render('register.ejs');
})

// Profile page route     Protected Profile Route (IMPORTANT)
app.get('/profile',authenticate, async (req,res)=>{
    const user = await User.findById(req.userId)
    res.render('profile.ejs', { user });
});

///// Logout
app.get('/logout' , (req,res)=>{
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
    });
    res.redirect('/');
})

//// 10. Login form submit logic
app.post('/login',async(req,res)=>{
    console.log('Req body = ',req.body)

    //10.1: Read login (JWT Creation)
    const {email, password} = req.body;

    //10.2: Find user by email
    let user = await User.findOne({email})
    console.log('User = ',user)

    // 10.3 :Check if user exists
    if(!user ){
        return res.render('login.ejs')
    }

    //10.4: Compare passwords securely
    const isValid = await bcrypt.compare(password,user.password)

    //10.5: If password is wrong
    if(!isValid){
        return res.render('login.ejs');
    }

    //Generate JWT token
    const token = jwt.sign(
        {id: user._id},
        JWT_SECRET, 
        {expiresIn : '1h'}
    );
    
    //Store token in cookie
    res.cookie('token', token, {
        httpOnly : true,
        secure: false,
        maxAge : 3600000, //1hr
    });
    // 10.6 :Successful login
    return res.render('profile.ejs',{ user });
});

// 11.Register form submit logic
app.post('/register' , async(req,res)=>{

    //11.1: Get form data
    const {name,email,password} = req.body;

    // 11.2: Check existing user
    const exists = await User.findOne({email})

    //11.3: Prevent duplicate registration
    if(exists){
        return res.render('register')
    }

    //11.4: Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    //11.5: Save user to DB
    const db = await User.create({
        name,
        email,
        password: hashedPassword,
    })

    //11.6: Redirect to login page
    res.redirect('/');
})

//12. Starting the server
const port = 8000;

app.listen(port,()=> console.log(`Server is running at the port ${port}`));