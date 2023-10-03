require('dotenv').config();
const express=require("express")
const app=express()
const path = require("path");
const bodyParser=require("body-parser")
const bcrypt = require('bcrypt');
const validator = require('validator'); // Import a validation library
const jwt=require("jsonwebtoken")
const cookieParser=require("cookie-parser")
const auth=require('./middleware/auth')


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


const Register=require("./models/schema");
const async = require("hbs/lib/async");
const { log } = require("console");

app.use(express.json());
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}));




const port=process.env.PORT || 3000
require("./db/conn")

app.use(express.static(path.join(__dirname,'../public')));
app.use(express.static(path.join(__dirname,'../AAF-SubBrands/Lazzat E Laham')))
app.use(express.static(path.join(__dirname,'../AAF-SubBrands/Veg Mahal')))
app.use(express.static(path.join(__dirname,'../AAF-SubBrands/kuch meetha hojay')))
app.use(express.static(path.join(__dirname,'../AAF-SubBrands/Dombivali Chaat')))
app.use(express.static(path.join(__dirname,'../AAF-SubBrands/Coffee Bliss')))


app.get("/",(req,res)=>{
    res.render(path.join(__dirname, "views/index"));
});

app.get("/register",(req,res)=>{
    res.sendFile(path.join(__dirname, "views/login.html"));
});
//create new user 

app.post("/register", async (req, res) => {
    try {
        const email=req.body.email
        // Validate user inputs
        if (!validator.isEmail(req.body.email)) {
            return res.status(400).send("Invalid email address");
        }
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(req.body['reg-password'], 10); // 10 is the number of salt rounds
        const registerUser = new Register({
            username: req.body['reg-username'],
            email: req.body.email,
            password: hashedPassword, // Store the hashed password
        });

        const token=await registerUser.generateAuthToken();

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        res.cookie("jwt",token,{
            expires:expiryDate,
            httpOnly:true
        });

        const registered = await registerUser.save();
        res.redirect("/login");
    } catch (e) {
        console.error(e);
        res.status(500).send("Registration failed. Please try again later.");
    }
});




app.get("/login",(req,res)=>{
    res.sendFile(path.join(__dirname, "views/login.html"));
});



app.post("/login", async (req, res) => {
    try {
        const email = req.body.username;
        const password = req.body.password;
        
        // Find the user by email
        const user = await Register.findOne({ email: email });
    
        if (!user) {
            return res.status(400).send('Invalid credentials'); // User not found
        }
    
        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (passwordMatch) {
            // Passwords match, so the user is authenticated
            
            // Generate a JWT token
            const token = await user.generateAuthToken();
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            
            // Set the JWT token as a cookie
            res.cookie("jwt", token, {
                expires: expiryDate,
                httpOnly: true
            });
            // Pass the user information to the template
            res.render('index', { user: user });
        } else {
            // Passwords do not match
            return res.status(400).send('Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('jwt'); // Clear the JWT cookie or session
    res.redirect('/login'); // Redirect to the login page
  });


  
app.get("/order-details",auth,(req,res)=>{
    res.sendFile(path.join(__dirname, "views/order-details.html"));
    req.cookies.jwt
});

app.get("/lazzat",(req,res)=>{

    res.render(path.join(__dirname,"views/laham.hbs"))
})

app.get("/vegmahal",(req,res)=>{
    res.render(path.join(__dirname,"views/mahal.hbs"))
})

app.get("/meetha",(req,res)=>{

    res.render(path.join(__dirname,"views/meetha.hbs"))
    
})

app.get("/coffee",(req,res)=>{
    res.render(path.join(__dirname,"views/coffee.hbs"))
})

app.get("/chaat",(req,res)=>{

    res.render(path.join(__dirname,"views/chaat.hbs"))
})


app.listen(port,()=>{
    console.log(`server is running on port no ${port}`)
})