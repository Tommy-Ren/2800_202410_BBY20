require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const fs = require('fs');
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
        res.render("errorMessage", { error: "Not Authorized" });
        return;
    }
    else {
        next();
    }
}

app.get('/', (req, res) => {
    var authorized = isValidSession(req);
    res.render("homePage", {fridgeName: "Fridge #1", css: "/css/homePage.css"});
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

app.get('/signup', (req, res) => {
    res.render("signup", { currentPage: "" });
});

app.post('/signupSubmit', async (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var user_type = 'admin'

    if (!name || !email || !password) {
        var missingFields = [];
        if (!name) {
            missingFields.push('Name');
        }
        if (!email) {
            missingFields.push('Email');
        }
        if (!password) {
            missingFields.push('Password');
        }
        var errorMessage = `${missingFields.join(', ')}${missingFields.length > 1 ? ' are' : ' is'} missing.`;
        res.render("signupSubmit", { errorMessage: errorMessage, currentPage: "" });
    } else {
        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });

        const validationResult = schema.validate({ name, email, password });
        if (validationResult.error != null) {
            var errorMessage = validationResult.error.details[0].message;
            res.render("signupSubmit", { errorMessage: errorMessage, currentPage: "" });
            return;
        }

        var hashedPassword = await bcrypt.hash(password, saltRounds);

        // Add the user to the database
        await userCollection.insertOne({ name: name, email: email, password: hashedPassword, user_type });
        console.log("Inserted user");

        // Create a session
        req.session.authenticated = true;
        req.session.username = name;
        req.session.user_type = user_type;
        req.session.cookie.maxAge = expireTime;

        // Redirect the user to the /members page
        res.redirect('/members');
    }
});

app.get('/login', (req, res) => {
    res.render("login", { message: req.query.message, currentPage: "" });
});

app.post('/loginSubmit', async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const validationResult = schema.validate({ email, password });
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.redirect("/login?message=Invalid email or password");
        return;
    }

    const user = await userCollection.findOne({ email: email });
    if (!user) {
        console.log("User not found");
        res.redirect("/login?message=User not found");
        return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
        console.log("Correct password");
        req.session.authenticated = true;
        req.session.username = user.name;
        req.session.user_type = user.user_type;
        req.session.cookie.maxAge = expireTime;

        res.redirect('/members');
        return;
    } else {
        console.log("Incorrect password");
        res.redirect("/login?message=Incorrect password");
        return;
    }
});

// Promote user to admin
app.post('/promote/:id', sessionValidation, adminAuthorization, async (req, res) => {
    const ID = req.params.id;

    const users = await userCollection.find().toArray();
    const user = users.find(u => u._id.equals(ID));
    if (!user) {
        return;
    }
    user.user_type = "admin";
    await userCollection.updateOne({ _id: user._id }, { $set: { user_type: user.user_type } });
    res.redirect('/admin');
});

// Demote admin to regular user
app.post('/demote/:id', sessionValidation, adminAuthorization, async (req, res) => {
    const ID = req.params.id;

    const users = await userCollection.find().toArray();
    const user = users.find(u => u._id.equals(ID));
    if (!user) {
        return;
    }

    user.user_type = "user";
    await userCollection.updateOne({ _id: user._id }, { $set: { user_type: user.user_type } });
    if (req.session.username == user.name) {
        req.session.user_type = "user";
    }
    res.redirect('/admin');
});

app.get('/admin', async (req, res) => {
    if (!isValidSession(req)) {
        res.redirect('/login?message=You need login to access admin page');
        return;
    }
    if (!isAdmin(req)) {
        res.redirect("/403");
        return;
    }
    const users = await userCollection.find().toArray();
    res.render("admin", { users: users, currentPage: "admin" });
});

app.get('/members', (req, res) => {
    
});

app.get('/about', (req, res) => {
    var color = req.query.color;
    res.render("about", { color: color, currentPage: "about" });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get("/403", (req, res) => {
    res.status(403);
    res.render("403", { currentPage: "" });
});

app.get("*", (req, res) => {
    res.status(404);
    res.render("404", { currentPage: "" });
});

app.listen(port, () => {
    console.log("Node application listening on port " + port);
}); 
