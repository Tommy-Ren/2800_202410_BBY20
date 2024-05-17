require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const nodemailer = require('nodemailer');
const saltRounds = 12;

const port =  3000;

const app = express();

const Joi = require("joi");

const expireTime = 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
const jwt_secret = process.env.JWT_SECRET;
/* END secret section */

// to use mongoDB -> access db
const mongoClient = require("mongodb").MongoClient;

var database = new mongoClient(`mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/`);

const userCollection = database.db(mongodb_database).collection('users');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: {
        secret: mongodb_session_secret
    }
})

app.use(session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store 
    store: mongoStore, //default is memory store 
    saveUninitialized: false,
    resave: true
}
));

function isValidSession(req) {
    if (req.session.authenticated) {
        return true;
    }
    return false;
}

function sessionValidation(req, res, next) {
    if (isValidSession(req)) {
        next();
    }
    else {
        res.redirect('/login');
    }
}

function isAdmin(req) {
    if (req.session.user_type == 'admin') {
        return true;
    }
    return false;
}

function adminAuthorization(req, res, next) {
    if (!isAdmin(req)) {
        res.status(403);
        res.render("error", { authenticated: req.session.authenticated, statusCode: res.statusCode, error: "Access Forbidden!" });
        return;
    }
    else {
        next();
    }
}

// =====landing page begins=====
app.get('/', (req, res) => {
    res.render("index", { authenticated: req.session.authenticated, name: req.session.authenticated?.name });


// =====sign up page begins=====
});

app.get('/homePage/:id', (req, res) => {
    const ID = req.params.id;
    var authorized = isValidSession(req);
    res.render("homePage", {fridgeName: ID, css: "/css/homePage.css"});
});

app.get('/listPage/:id', (req, res) => {
    const ID = req.params.id;
    const ingredientArray = ['budweiser-6can.jpg', 'cadbury-chocolate-mini-egg.png', 'heinz-sauce-ketchup-500ml.png', 'nutella-1kg.png'];
    res.render("listPage", {fridgeName: ID, css: "/css/listPage.css", ingredients: ingredientArray});
});

app.get('/setting', (req, res) => {
    const fridges = ['1', '2', '3'];
    const user = {name: "Kiet", email: "kietkiet1109@yahoo.com", password: "123", user_type: "user", phone: "778-809-9869"};
    res.render("setting", {css: "/css/setting.css", fridgeList: fridges, user: user});
});

app.get('/signup', (req, res) => {
    res.render("signup", { css: "/css/login.css" });
})

app.post('/signupSubmit', async (req, res) => {
    const { name, email, password } = req.body;

    const schema = Joi.object(
        {
            name: Joi.string().regex(/^[a-zA-Z\s]*$/).max(20).required(),
            email: Joi.string().email().required(),
            password: Joi.string().max(20).required()
        });

    const validationResult = schema.validate({ name, email, password });
    if (validationResult.error != null) {
        res.render("signupSubmit", { error: validationResult.error.details[0].message });
        return;
    }

    var hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.insertOne({ name, email, password: hashedPassword, user_type: 'user' });

    // Create session
    req.session.authenticated = {
        name: name,
        email: email,
    };
    req.session.user_type = 'user';
    req.session.cookie.maxAge = expireTime;

    res.redirect("/members");
});

app.get('/nosql-injection', async (req, res) => {
    var username = req.query.user;

    if (!username) {
        res.send(`<h3>no user provided - try /nosql-injection?user=name</h3> <h3>or /nosql-injection?user[$ne]=name</h3>`);
        return;
    }
    console.log("user: " + username);

    const schema = Joi.string().max(20).required();
    const validationResult = schema.validate(username);

    //If we didn't use Joi to validate and check for a valid URL parameter below
    // we could run our userCollection.find and it would be possible to attack.
    // A URL parameter of user[$ne]=name would get executed as a MongoDB command
    // and may result in revealing information about all users or a successful
    // login without knowing the correct password.
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.send("<h1 style='color:darkred;'>A NoSQL injection attack was detected!!</h1>");
        return;
    }

    const result = await userCollection.find({ username: username }).project({ username: 1, email: 1, password: 1, _id: 1, user_type: 1 }).toArray();

    console.log(result);

    res.send(`<h1>Hello, ${username}</h1>`);

});
  
// =====login page begins=====
app.get('/login', (req, res) => {
    res.render("login", { css: "/css/login.css" });
});

app.post('/loggingin', async (req, res) => {
    const { email, password } = req.body;

    const schema = Joi.object(
        {
            email: Joi.string().email().required(),
            password: Joi.string().max(20).required()
        });

    const validationResult = schema.validate({ email, password });
    if (validationResult.error != null) {
        res.render("loggingin", { error: validationResult.error.details[0].message });
        return;
    }

    const result = await userCollection.find({ email }).project({ name: 1, email: 1, password: 1, _id: 1, user_type: 1 }).toArray();
    if (result.length != 1) {
        res.render("loggingin", { error: "User not found" });
        return;
    }
    if (await bcrypt.compare(password, result[0].password)) {
        req.session.authenticated = {
            name: result[0].name,
            email,
        };
        req.session.user_type = result[0].user_type;
        req.session.cookie.maxAge = expireTime;
        res.redirect("/members");
        return;
    } else {
        res.render("loggingin", { error: "Incorrect password" });
        return;
    }
});

// =====waiting page begins=====
app.get('/waiting', (req,res) => {
    res.render("waiting", {css: "/css/login.css"});
});

// =====connectSuccess page begins=====
app.get('/connectSuccess',(req,res) =>{
    res.render("connectSuccess", {css: "/css/connectSuccess.css"});
});


// =====forgetPassword page begins=====
app.get('/forgetPassword', (req,res) => {
    res.render("forgetPassword", {css: "/css/login.css"});
});

app.post("/resetPassword", async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await userCollection.findOne({ email });
        if (!existingUser) {
            res.send("User not found");
            return;
        }
        const secret = jwt_secret + existingUser.password;
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, secret, { expiresIn: '100m' });
        const link = `http://localhost:${port}/resetPassword/${existingUser._id}/${token}`;
        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'freshstockbby20@gmail.com',
                pass: 'wqkk gdnc gycz qzre'
            }
        });

        var mailOptions = {
            from: 'freshstockbby20@gmail.com',
            to: email,
            subject: 'Link to reset password',
            text: `Hi ${existingUser.name},
            We received a request to reset your password.
            Click this link to be redirected to the reset password page:
            ${link}
            This link will expire in 5 minutes.`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.error("Error finding user:", error);
        res.status(500).send("Error finding user");
        return;
    }
})

app.get("/resetPassword/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    try {
        const existingUser = await userCollection.findOne({ _id: new ObjectId(id) });

        if (!existingUser) {
            res.render("resetPassword", {css: "/css/login.css", error: "User not found" });
            return;
        }
        const secret = jwt_secret + existingUser.password;
        try {
            const verify = jwt.verify(token, secret);
            res.render("resetPassword", {css: "/css/login.css", email: verify.email });
        } catch (error) {
            console.error("Error verifying token:", error);
            res.status(500).send("Error verifying token");
            return;
        }
    } catch (error) {
        console.error("Error finding user:", error);
        res.status(500).send("Error finding user");
        return;
    }
})

//when the user type in the new password
app.post("/resetPassword/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
    try {
        const existingUser = await userCollection.findOne({ _id: new ObjectId(id) });
        console.log(existingUser);

        if (!existingUser) {
            res.render("resetPassword", { error: "User not found" });
            // res.render("resetPassword", { error: "User not found" }, { css: "/css/resetPassword.css" } );
            return;
        }
        const secret = jwt_secret + existingUser.password;
        try {
            const verify = jwt.verify(token, secret);
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await userCollection.updateOne({ _id: new ObjectId(id) }, { $set: { password: hashedPassword } });
            res.redirect("/login");
        } catch (error) {
            console.error("Error verifying token:", error);
            res.status(500).send("Error verifying token");
            return;
        }
    } catch (error) {
        console.error("Error finding user:", error);
        res.status(500).send("Error finding user");
        return;
    }
})

app.post("/refresh", sessionValidation, async (req, res) => {
    const result = await userCollection.find({ email: req.session.authenticated.email }).project({ user_type: 1 }).toArray();
    req.session.user_type = result[0].user_type;
    res.redirect("/");
    return;
});

// =====logout page begins=====
app.get("/logout", sessionValidation, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        res.redirect("/");
    });
})

// =====Home page begins=====
app.get('/homePage/:id', (req, res) => {
    const ID = req.params.id;
    var authorized = isValidSession(req);
    res.render("homePage", {fridgeName: ID, css: "/css/homePage.css"});
});

// =====List page begins=====
app.get('/listPage/:id', (req, res) => {
    const ID = req.params.id;
    const ingredientArray = ['budweiser-6can.jpg', 'cadbury-chocolate-mini-egg.png', 'heinz-sauce-ketchup-500ml.png', 'nutella-1kg.png'];
    res.render("listPage", {fridgeName: ID, css: "/css/listPage.css", ingredients: ingredientArray});
});

// =====Setting page begins=====
app.get('/setting', (req, res) => {
    const fridges = ['1', '2', '3'];
    const user = {name: "Kiet", email: "kietkiet1109@yahoo.com", password: "123", user_type: "user", phone: "778-809-9869"};
    res.render("setting", {css: "/css/setting.css", fridgeList: fridges, user: user});
});


// =====404 page begins=====
app.get("*", (req, res) => {
    res.status(404);
    res.render("404", { authenticated: req.session.authenticated, statusCode: res.statusCode, error: "Page not found!" });
})

app.listen(port, () => {
    console.log("Node application listening on port " + port);
}); 