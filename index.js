require("./utils.js");

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const fs = require('fs');
const saltRounds = 12;

const port = process.env.PORT || 3000;

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
        res.render("error", { authenticated: req.session.authenticated, statusCode: res.statusCode, error: "Access Forbidden!" });
        return;
    }
    else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render("index", { authenticated: req.session.authenticated, name: req.session.authenticated?.name });
});


app.get('/waiting', (req,res) => {
    res.render("waiting", {css: "/css/login.css"});
});

app.get('/signup', (req, res) => {
    res.render("signup", {css: "/css/login.css"});
})

app.get('/connectSuccess',(req,res) =>{
    res.render("connectSuccess", {css: "/css/connectSuccess.css"});
});

app.get('/passwordReset', (req,res) => {
    res.render("passwordReset", {css: "/css/passwordReset.css"});
});

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

app.get("/members", sessionValidation, (req, res) => {
    fs.readdir(__dirname + "/public", (err, files) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        // Filter out non-gif files
        const gifs = files.filter(file => file.endsWith('.gif'));
        res.render("members", { authenticated: req.session.authenticated, gifs });
    })
})

app.get("/admin", sessionValidation, adminAuthorization, async (req, res) => {
    const users = await userCollection.find().toArray();
    res.render("admin", { authenticated: req.session.authenticated, users });
})

app.post("/refresh", sessionValidation, async (req, res) => {
    const result = await userCollection.find({ email: req.session.authenticated.email }).project({ user_type: 1 }).toArray();
    req.session.user_type = result[0].user_type;
    res.redirect("/");
    return;
});

app.post("/promote", async (req, res) => {
    const { email } = req.body;
    try {
        await userCollection.updateOne({ email: email }, { $set: { user_type: "admin" } });
        console.log(`User promoted: ${email}`);
        res.redirect("/admin");
    } catch (error) {
        console.error("Error promoting user:", error);
        res.status(500).send("Error promoting user");
    }
});

app.post("/demote", async (req, res) => {
    const { email } = req.body;
    try {
        await userCollection.updateOne({ email: email }, { $set: { user_type: "user" } });
        console.log(`User demoted: ${email}`);
        res.redirect("/admin");
    } catch (error) {
        console.error("Error demoting user:", error);
        res.status(500).send("Error demoting user");
    }
});

app.get("/logout", sessionValidation, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        res.redirect("/");
    });
})

app.use(express.static(__dirname + "/public"));

app.get("*", (req, res) => {
    res.status(404);
    res.render("error", { authenticated: req.session.authenticated, statusCode: res.statusCode, error: "Page not found!" });
})

app.listen(port, () => {
    console.log("Node application listening on port " + port);
}); 