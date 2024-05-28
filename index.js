require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser');
const saltRounds = 12;

const port = 3000;

const app = express();

const Joi = require("joi");
const { name } = require('ejs');
const { url } = require('inspector');
const { send } = require("process");

const expireTime = 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
const jwt_secret = process.env.JWT_SECRET;
const api_key = process.env.API_KEY;
/* END secret section */

// to use mongoDB -> access db
const mongoClient = require("mongodb").MongoClient;

var database = new mongoClient(
  `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/`
);

//create 3 collections to store 3 collection infor

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret,
  },
});
const db = database.db(mongodb_database)
const userCollection = db.collection('users');
const itemColletion = db.collection('items');
const itemColletion2 = db.collection('newItems');
const fridgeCollection = db.collection('fridge');
const shopping = db.collection('shopping');
const listCollection = db.collection('list');

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store
    store: mongoStore, //default is memory store
    saveUninitialized: false,
    resave: true,
  })
);

function isValidSession(req) {
  if (req.session.authenticated) {
    return true;
  }
  return false;
}

function sessionValidation(req, res, next) {
  if (isValidSession(req)) {
    next();
  } else {
    res.redirect("/login");
  }
}

function isAdmin(req) {
  if (req.session.user_type == "admin") {
    return true;
  }
  return false;
}

function adminAuthorization(req, res, next) {
  if (!isAdmin(req)) {
    res.status(403);
    res.render("error", {
      authenticated: req.session.authenticated,
      statusCode: res.statusCode,
      error: "Access Forbidden!",
    });
    return;
  } else {
    next();
  }
}

// =====landing page begins=====
app.get('/', (req, res) => {
  if (req.session.authenticated) {
    res.redirect("/home");
    return;
  }
  res.render("index", { authenticated: req.session.authenticated, name: req.session.authenticated?.name });
});

// =====sign up page begins=====
app.get('/signup', (req, res) => {
  if (req.session.authenticated) {
    res.redirect("/home");
    return;
  }
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

  res.redirect("/connection");
});

app.get('/login', (req, res) => {
  if (req.session.authenticated) {
    res.redirect("/home");
    return;
  }
  res.render("login", { css: "/css/login.css" });
});

app.post("/loggingin", async (req, res) => {
  const { email, password } = req.body;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().max(20).required(),
  });


  const validationResult = schema.validate({ email, password });
  if (validationResult.error != null) {
    res.render("loggingin", {
      error: validationResult.error.details[0].message,
    });
    return;
  }

  const result = await userCollection
    .find({ email })
    .project({ name: 1, email: 1, password: 1, _id: 1, user_type: 1 })
    .toArray();
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
    res.redirect("/home");
    return;
  } else {
    res.render("loggingin", { error: "Incorrect password" });
    return;
  }

});

// =====connection page begins=====
app.get('/connection', (req, res) => {
  res.render('connection', { css: "/css/connection.css" });
})

// =====instruction page begins=====
app.get('/instruction', (req, res) => {
  res.render('instruction', { css: "/css/instruction.css" });
})


// =====waiting page begins=====
app.get("/waiting", (req, res) => {
  res.render("waiting", { css: "/css/login.css" });
});


// =====connectSuccess page begins=====
app.get("/connectSuccess", (req, res) => {
  res.render("connectSuccess", { css: "/css/connection.css" });
});


// =====forgetPassword page begins=====
app.get('/forgetPassword', (req, res) => {
  if (req.session.authenticated) {
    res.redirect("/home");
    return;
  }
  res.render("forgetPassword", { css: "/css/login.css" });
});

// =====resetPassword page begins=====
app.post("/resetPassword", async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await userCollection.findOne({ email });
    if (!existingUser) {
      res.send("User not found");
      return;
    }
    const secret = jwt_secret + existingUser.password;
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      secret,
      { expiresIn: "100m" }
    );
    const link = `http://localhost:${port}/resetPassword/${existingUser._id}/${token}`;

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "freshstockbby20@gmail.com",
        pass: "wqkk gdnc gycz qzre",
      },
    });

    var mailOptions = {
      from: "freshstockbby20@gmail.com",
      to: email,
      subject: "Link to reset password",
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
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).send("Error finding user");
    return;
  }
});

app.get("/resetPassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  try {
    const existingUser = await userCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingUser) {
      res.render("resetPassword", {
        css: "/css/login.css",
        error: "User not found",
      });
      return;
    }
    const secret = jwt_secret + existingUser.password;
    try {
      const verify = jwt.verify(token, secret);
      res.render("resetPassword", {
        css: "/css/login.css",
        email: verify.email,
      });
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
});

// when the user type in the new password
app.post("/resetPassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  try {
    const existingUser = await userCollection.findOne({
      _id: new ObjectId(id),
    });
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
      await userCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { password: hashedPassword } }
      );
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
});

app.post("/refresh", sessionValidation, async (req, res) => {
  const result = await userCollection
    .find({ email: req.session.authenticated.email })
    .project({ user_type: 1 })
    .toArray();
  req.session.user_type = result[0].user_type;
  res.redirect("/");
  return;
});

// =====logout page begins=====
app.get("/logout", sessionValidation, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/login");
  });
})

// =====Home page begins=====
app.get('/home', async (req, res) => {
  if (!isValidSession(req)) {
    res.redirect("/");
    return;
  }

  const fridgeArray = await fridgeCollection.find({ owner: req.session.authenticated.email }).toArray();
  if (fridgeArray.length === 0) {
    res.redirect("/connection");
  } else {
    const name = req.query.name || fridgeArray[0].name;
    const fridge = fridgeArray.find(f => f.name === name);
    res.render("home", { fridge: fridge });
  }
});

// =====List page begins=====
app.get('/list', sessionValidation, async (req, res) => {
  const fridgeArray = await fridgeCollection.find({ owner: req.session.authenticated.email }).toArray();
  const name = req.query.name || fridgeArray[0].name;
  const fridge = fridgeArray.find(f => f.name === name);

  const ingredientArray = await itemColletion.find().toArray();
  let fridgeItems = [];
  const numItems = Math.floor(Math.random() * 10 + 5);
  while (fridgeItems.length < numItems) {
    let item = ingredientArray[Math.floor(Math.random() * ingredientArray.length)];
    if (!fridgeItems.includes(item)) {
      fridgeItems.push(item);
    }
  }

  // const ingredientArray2 = await itemColletion2.find().toArray();
  // let fridgeItems2 = [];
  // const numItems2 = Math.floor(Math.random() * 20 + 10);
  
  // while (fridgeItems2.length < numItems2) {
  //   let item2 = ingredientArray2[Math.floor(Math.random() * ingredientArray2.length)];
  //   let amount = Math.floor(Math.random() * 100 + 1);
    
  //   if (!fridgeItems2.includes(item2)) {
  //     try {
  //       const response = await fetch(`https://api.spoonacular.com/food/ingredients/${item2._id}/information?apiKey=${api_key}&amount=${amount}`);
  //       const data = await response.json();
  //       fridgeItems2.push(data);
  //     } catch (error) {
  //       console.error('Error fetching item information:', error);
  //     }
  //   }
  // }  

  res.render("list", { fridge, ingredients: fridgeItems });
});

// =====Recipe page begins=====
app.get('/recipe', async (req, res) => {
  res.render('recipe', { css: "/css/recipe.css" });
});

app.get(`/eachRecipe`, async (req, res) => {

  res.render("eachRecipe");

});

// =====Setting page begins=====
app.get('/setting', async (req, res) => {
  if (!isValidSession(req)) {
    res.redirect("/");
    return;
  }

  const fridgeArray = await fridgeCollection.find({ owner: req.session.authenticated.email }).toArray();
  const userArray = await userCollection.find().toArray();
  const user = userArray.find(u => u.email === req.session.authenticated.email);
  res.render("setting", { fridgeList: fridgeArray, user: user });
});

// =====Method to save new fridge into MongoDB=====
app.post('/saveFridge', async (req, res) => {
  const fridgeName = req.body.fridgeName;
  const ranFridge = Math.floor(Math.random() * 18 + 1);
  const fridgeUrl = `${ranFridge}.png`
  const owner = req.session.authenticated.email;

  const newFridge = { name: fridgeName, url: fridgeUrl, owner: owner };
  await fridgeCollection.insertOne(newFridge);
  res.redirect("/home");
});

// =====Method to update phone number into MongoDB=====
app.post('/savePhone', async (req, res) => {
  const phone = req.body.phone;
  const email = req.query.email;

  const userArray = await userCollection.find().toArray();
  const user = userArray.find(u => u.email === req.session.authenticated.email);

  user.phone = phone;
  await userCollection.updateOne({ email: user.email }, { $set: { phone: user.phone } });
  res.redirect("/setting");
});

// =====Method to delete fridge in MongoDB=====
app.post('/deleteFridge/:name', async (req, res) => {
  const name = req.params.name;

  const fridgeArray = await fridgeCollection.find({ owner: req.session.authenticated.email }).toArray();
  const fridge = fridgeArray.find(f => f.name === name);

  await fridgeCollection.deleteOne(fridge);
  res.redirect("/setting");
});

// =====Shopping list page begins=====
app.get('/shopping', async (req, res) => {
    if (!isValidSession(req)) {
      res.redirect("/");
      return;
    }

    const fridgeArray = await fridgeCollection.find({owner: req.session.authenticated.email}).toArray();
    const shoppingArray = await shopping.find().toArray();
    let shoppingItems = [];
    while (shoppingItems.length < 3) {
        let item = shoppingArray[Math.floor(Math.random() * shoppingArray.length)];
        if (!shoppingItems.includes(item)) {
          shoppingItems.push(item);
        }
    }
    res.render('shopping', {shopping: shoppingItems, fridge: fridgeArray[0], css: "/css/style.css"});
});

// =====Method to save new fridge into MongoDB=====
app.post('/addList', async (req, res) => {
    const listArray = await listCollection.find({owner: req.session.authenticated.email}).toArray();
    const listID = listArray.length + 1;
    const date = new Date().toLocaleDateString();
    const owner = req.session.authenticated.email;

    const newList = {key: listID, date: date, owner: owner};
    await listCollection.insertOne(newList);
    res.redirect("/shoppingListPreview");
});

// =====shoppingListPreview begins=====
app.get('/shoppingListPreview', async(req,res) => {
    if (!isValidSession(req)) {
      res.redirect("/");
      return;
    }

    const listArray = await listCollection.find({owner: req.session.authenticated.email}).toArray();
    res.render("shoppingListPreview", {lists: listArray, css: "/css/shoppingListPreview.css"});
})

// =====404 page begins=====
app.get("*", (req, res) => {
  res.status(404);
  res.render("404", {
    authenticated: req.session.authenticated,
    statusCode: res.statusCode,
    error: "Page not found!",
  });
});

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});