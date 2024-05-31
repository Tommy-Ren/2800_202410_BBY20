# Project Title
FreshStock


## 1. Project Description
1.What is Fresh Stock?

FreshStock is a web app that encourages users to adopt a food-waste-free lifestyle, contributes to personal savings and environmental conservation efforts.

2.Why we came up with this idea?

Food waste is a good topic related to sustainability. We want to apply future technologies to reduce food waste and provide people with a balanced lifestyle.

3.How does our web app work?

First, you need to connect your app with your smart scanner in your fridge. The scanner will generate all information you need about items like expiry date, fresh index, quality, and even provide some receipt recommendations


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
├── .gitignore               # Git ignore file
├── 404.html                 # 404 Error page 
├── favourite.html           # This is the page where users save their favourite posts and can be accessed by nav bar
├── home_page.html           # Splash page after logging in. A newsfeed of all the popular deals and all posts
├── index.html               # First page with our logo and the Start button
├── login.html               # Used for login and registering new accounts. Accessible by clicking the Start button on our index page.
├── map.html                 # Loads the Google Map API, this is where users can find grocery stores without switching out of the app. Accessible by clicking the Map button on posts.
├── my_posts.html            # This is where users can check their own posts. Can be found via navbar -> my profile
├── setting_page.html        # This is where users can update their profile, check their own posts, and log out to switch account. Can be accessed by clicking profile icon on the nav bar
├── upload.html              # This is where users can create and upload their own posts. It can be accessed via navbar
└── README.md

It has the following subfolders and files:
├── .git                     # Folder for git repo
├── old                      # archive for unused and experimental code
├── images                   # Folder for images
    /favicon.ico             # Taken from: https://icons8.com/icon/38824/meat
    /IMG_4514.jpg            # Took picture myself at Safeway (Dominic)
    /IMG_4515.jpg            # Took picture myself at Safeway (Dominic)
    /IMG_4516.jpg            # Took picture myself at Safeway (Dominic)
    /IMG_4517.jpg            # Took picture myself at Safeway (Dominic)
    /IMG_4518.jpg            # Took picture myself at Safeway (Dominic)
    /LOGO.svg                # SVG file provided by Tommy
    /Savebites.jpg           # logo provided by Tommy
├── scripts                  # Folder for scripts
    /authentication.js       # script for firebase login
    /createPosts.js          # script for creating post cards
    /favourite.js            # script for the favourites page
    /firebaseAPI_BBY12.js    # script for firebase credentials
    /home_page_posts.js      # script for generating cards on home page
    /map.js                  # script for loading google maps
    /my_posts.js             # script for loading cards for posts uploaded by users themselves
    /setting_page.js         # script for the profile page
    /upload.js               # script for uploading new posts
    /username_home.js        # script for customized home screen to show user name and address
├── styles                   # Folder for styles
    /style.css               # Font and Icon imports, media query size to iPhone 15 Pro Max, vanilla CSS adjustments 


```