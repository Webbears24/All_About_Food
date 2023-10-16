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
const Token=require('./models/token')
const sendEmail=require('./middleware/verifyEmail')
const crypto=require('crypto')


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
    res.render(path.join(__dirname, "views/index.hbs"));
});

app.get("/register",(req,res)=>{
    res.sendFile(path.join(__dirname, "views/login.html"));
});
//create new user 

app.post("/register", async (req, res) => {
    try {
        // Validate user inputs
        if (!validator.isEmail(req.body.email)) {
            res.redirect("/login?RegistrationError=Invalid Email Address");
        }
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(req.body['reg-password'], 10); // 10 is the number of salt rounds
        const registerUser = new Register({
            username: req.body['reg-username'],
            email: req.body.email,
            password: hashedPassword, // Store the hashed password
        });

        // Generate an authentication token
        const token = await registerUser.generateAuthToken();

        // Create and save the verification token
        const verifyToken = new Token({
            userid: registerUser._id, // Use registerUser._id
            token: crypto.randomBytes(32).toString('hex')
        });
        await verifyToken.save();

        // Construct the verification URL
        const url = `${process.env.BASE_URL}/users/${registerUser._id}/verify/${verifyToken.token}`;

        // Send a verification email
        await sendEmail(registerUser.email, "Verify Email", url);

        // Set JWT cookie
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        res.cookie("jwt", token, {
            expires: expiryDate,
            httpOnly: true
        });

        // Save the registered user
        await registerUser.save();

        // Redirect to the login page
        res.redirect("/login?success=true");
    } catch (e) {
        res.redirect("/login?RegistrationError=Please try again later");
    }
});



app.get("/users/:id/verify/:token", async (req, res) => {
    try {
        const userId = req.params.id;
        const token = req.params.token;

        // Find the user by their ID
        const user = await Register.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Find the verification token in the database
        const verifyToken = await Token.findOne({ userid: userId, token: token });

        // Check if the token exists and is valid
        if (!verifyToken) {
            res.redirect("Invalid Or Expired Token");
        }

        // Mark the user as verified
        user.verified = true;
        await user.save();

            await verifyToken.deleteOne();
        

        // Redirect or send a success message
        res.send("Email verification successful. You can now log in.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Verification failed. Please try again later.");
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
            res.redirect("/login?LoginError=User not found Please Register First") // User not found
        }
        if(user){
        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Passwords match, so the user is authenticated

            // Check if the user is verified
            if (!user.verified) {
                // Generate a new verification token
                const newToken = new Token({
                    userid: user._id,
                    token: crypto.randomBytes(32).toString("hex"),
                });

                // Save the new token to the database
                await newToken.save();

                // Construct the verification URL with the new token
                const url = `${process.env.BASE_URL}/users/${user._id}/verify/${newToken.token}`;

                // Send a new verification email
                await sendEmail(user.email, "Resend Verification Email", url);

                res.redirect("/login?VerificationError=Email not verified. A new verification link has been sent to your email.");
            }

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
            res.redirect('/?LoginSuccess=Logged In', { user: user });
        } else {
            res.redirect("/login?LoginError=Invalid credentials")
        }
    }
    } catch (error) {
        res.redirect("/login?LoginError=Server Down Please Try again later")
    }
});


app.get('/logout', (req, res) => {
    res.clearCookie('jwt'); // Clear the JWT cookie or session
    res.redirect('/login'); // Redirect to the login page
  });


  app.get('/password-reset', (req, res) => {
    res.sendFile(path.join(__dirname, "views/forget-password.html"));
});

//  User Request for Password Reset
app.post('/forgot-password', async (req, res) => {
    const email = req.body.email;

    try {
        

        // Step 3: Store the Token and Expiry Time
        const user = await Register.findOne({ email });
        if (!user) {
            res.redirect("/login?RegistrationError=No user found Please Register first");
        }

        const resetToken = new Token({
            userid: user._id, // Reference to the user
            token: crypto.randomBytes(32).toString('hex')
        });
        await resetToken.save();


        // Step 4: Send a Password Reset Email
        const resetLink = `${process.env.BASE_URL}/reset-password/${resetToken.token}`;
        const emailText = `Click the following link to reset your password: ${resetLink}`;
        await sendEmail(email, 'Password Reset', emailText);

        res.redirect("/login?ResetEmail=Password Reset Email Sent ");
    } catch (error) {
        res.redirect("/login?ResetEmailError=Server Error");
    }
});

//  Verify Token and Expiry
app.get('/reset-password/:token', async (req, res) => {
    const token = req.params.token;

    try {
        const user = await Token.findOne({ token: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Render a page for the user to reset their password
        return res.render(path.join(__dirname,"views/reset-password.hbs"), { token });
    } catch (error) {
        res.redirect("/login?ResetEmailError=Server Error");
    }
});

// Reset Password
app.post('/reset-password/:token', async (req, res) => {
    const resetToken = req.params.token; // Use a different variable name for clarity
    const newPassword = req.body.newPassword;

    try {
        const tokenDocument = await Token.findOne({ token: resetToken });
        if (!tokenDocument) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = await Register.findOne({ _id: tokenDocument.userid });

        if (!user) {
            res.redirect("/login?RegistrationError=No user found Please Register first");
        }

        // Update the user's password with the new one
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Delete the token after successful password reset
        await Token.deleteOne({ userid: tokenDocument.userid });

        res.redirect("/login?ResetEmailSuccess=Password Changed Successfully");
    } catch (error) {
        console.error(error);
        res.redirect("/login?ResetEmailError=Server Error");
    }
});


  
app.get("/order-details",auth,(req,res)=>{
    res.render(path.join(__dirname, "views/order-details.hbs"));
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