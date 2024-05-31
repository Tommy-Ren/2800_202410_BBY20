# Project Title
FreshStock


## 1. Project Description
1.What is Fresh Stock?

FreshStock is a web app that encourages users to adopt a food-waste-free lifestyle, contributes to personal savings and environmental conservation efforts.

2.Why we came up with this idea?

Food waste is a good topic related to sustainability. We want to apply future technologies to reduce food waste and provide people with a balanced lifestyle.

3.How does our web app work?

FreshStock can monitor all food in fridges that have connected to it. You can use whatever items in the fridge to generate recipes and send ingredients into shopping list.


## 2. About Us
Team Name: BBY-20
Team Members: 
- Person 1 Tommy tianze823242895@gmail.com
* Hi, I am Tommy.
- Person 2 Kiet ngkiet1109@gmail.com
* I'm Kiet.
- Person 3 Phuong lttphuong7@gmail.com
* Hi, I'm Phuong.
- Person 4 Nam Anh nle48@my.bcit.ca
* Hi, I'm Nam Anh.


## 3. Basic Setup (Test Locally)
1. npm init (all defaults are fine)
2. npm install
3. npm install express
4. npm install bcrypt
5. npm install express-session
6. npm install connect-mongo
7. npm install dotenv
8. npm install ejs
9. npm install joi
10. npm install mongodb
	

## 4. Technologies and Resources Used
List technologies (with version numbers), API's, icons, fonts, images, media or data sources, and other resources that were used.
* HTML, CSS, JavaScript
* Bootstrap 5.0 (Frontend library)
* Firebase 8.0 (BAAS - Backend as a Service)
* Google maps API
* Google Fonts
* Material Icons
* ChatGPT (Nam Anh: I used ChatGPT to fix some bugs and to help me with Google Maps API) 
* W3Schools (Tommy: https://www.w3schools.com/html/tryit.asp?filename=tryhtml_input_date, https://www.w3schools.com/bootstrap5/index.php/index.php)
* MDN (Tommy: https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* Bootanipp (Tommy: https://bootsnipp.com/tags/profile/4)


## 5. Complete setup/installion/usage
State what a user needs to do when they come to your project.  How do others start using your code or application?
Here are the steps ...
* 1 - If user is using FreshStock for the first time, they will need to click "Sign up" register for a new acocunt or "Log in" if you already have an account following the standard Google sign-in interface
* 2 - If user used our app for the first time, FreshStock will ask for connecting to a new fridge. Follow the instruction and connect a new fridge.
* 3 - Good job, now you have all necessary setups to use FreshStock. Enjoy your fresh life!


## 6. Known Bugs and Limitations
Here are some known bugs:
* Because for now we only use static data from our database to build the items in the fridge, every time user open the fridge, items are different.
* User cannot turn off notification by just clicking the switch button in the notification page due to the browser issue. User has to go to browser setting to turn off the notification permission.
* User can visit recipe page without authentification.


## 7. Features for Future
What we'd like to build in the future:
* Use real time database and ingredients to generate real time recipes by using recipes API.
* Make Map more interactive by allowing it to add a location via touch as opposed to text only.
* We are going to use more Bootstrap libraries in the future to create more animation and beautiful effect to decorate our UI and landing page.
* Send news and update notification by email.
* Track food expiry date in real time.
* Add OCR features so fields are automatically filled.
* Shopping list can directly connect other grocery stores like Walmart, Save On Food and so on.

	
## 8. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── .git                        # Folder for git repo
├── .gitignore                  # Git ignore file
├── public                      # Folder for all public static resource
├── views                       # Folder for views, including all ejs and html documents
├── databaseConnection.js       # script for connecting to MongoDB
├── index.js                    # script for all ajax and nodejs functionalities
├── package.json                # package.json that has all packages needed for running this app
└── README.md

It has the following subfolders and files:
├── public                      
    /css                        # Folder for all css
    /image                      # Folder for all images
    /js                         # Folder for all Javascrip scripts
└── views
    /templates                  # Folder for all components are reusable
    /404.ejs                    # 404 Error page
    /connection.ejs             # Front end for fridge connection
    /connectSuccess.ejs         # Front end for connection successfully
    /donation.ejs               # Front end for donation page
    /forgetPassword.ejs         # Front end and back end for forget password page
    /home.ejs                   # Front end for home page
    /index.ejs                  # Front end for landing page
    /instruction.ejs            # Front end for instruction page for connection
    /list.ejs                   # Front end for items list page
    /loggingin.ejs              # Back end for login page
    /notification.ejs           # Front end and back end for notification page
    /recipes.ejs                # Front end for recipes list page
    /resetPassword.ejs          # Front end for password reset page
    /searchPage.ejs             # Front end for shopping list's search engine page
    /setting.ejs                # Front end for setting page
    /shopping.ejs               # Front end for showing all shopping lists page
    /shoppingPreview.ejs        # Front end for detailed content in the shopping list page
    /signup.ejs                 # Front end for sign up page
    /singupSubmit.ejs           # Back end for sign up page
    /waiting.ejs                # Front end for connection waiting page


```