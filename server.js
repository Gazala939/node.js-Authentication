import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.urlencoded({extend:true}));

const url = "mongodb://localhost:27017";
mongoose.connect(url,{dbName:"Authentication",})
.then(()=>console.log("MongoDB is connected ..."))
.catch((err)=>console.log('Error :',err));

app.get('/',(req,res)=>{
    res.render("login.ejs");
});

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

const User = mongoose.model('user',userSchema);

app.get('/',async(req,res)=>{
    res.render("login.ejs");
});

app.get('/register',async(req,res)=>{
    res.render('register.ejs');
})
////  For login after click
app.post('/login',async(req,res)=>{
    console.log('Req body = ',req.body)
    const {email, password} = req.body;

    let user = await User.findOne({email})
    console.log('User = ',user)
    if(!user || user.password !== password){
        res.render('login.ejs')
   
    }
    return res.render('profile.ejs',{ user });
});
/////// For Register after click
app.post('/register' , async(req,res)=>{
    const {name,email,password} = req.body;

    const db = await User.create({
        name,email,password
    })
    res.redirect('/');
})


const port = 8000;

app.listen(port,()=> console.log(`Server is running at the port ${port}`));