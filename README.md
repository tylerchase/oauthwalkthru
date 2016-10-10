```bash
>mkdir oauthTutorial
>cd oauthTutorial
>express --hbs --git
>npm install
>npm install knex pg --save
>knex init

>git init
>git add .
>git commit -m "created express project with handlebars and added knex and postgres"
>git remote add origin "the link to the repo that you created on github"
>git push origin master

>createdb [name of database] // we will call it 'oauthTutorial' for this project

```
- Change client and connection in the knexfile.js
```javascript
      development: {
        client: 'postgres',
        connection: {
          database: name of database created earlier wrapped in quotes // ex = : 'oauthTutorial'
        }
      },
```
- Remove the staging object from the knexfile.js
```bash
> knex migrate:make [name of table] // we will call it 'users'
```
- Now from the migrations folder find the migration file that you just made
- Add the table info (example below)
```javascript
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table){
    table.increments()
    table.string('googleID')
    table.string('name')
    table.text('photo')
    table.string('email')
    table.string('token')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
};
```
```bash
> knex migrate:latest
```
- Check to see if the table is there
```bash
> psql oauthTutorial
 =# TABLE users;
 ```
 - Get out of psql (type : '\q' + hit enter)
```bash
> git add .
> git commit -m "added users table to local db"
```
- So now our table is just hosted locally. Before we go to far let's add our project to heroku and setup the config for that.
```bash
> heroku [name of application]  // the name here is what will appear in the URL bar ex https://www.your-app-name-here.herokuapp.com
> heroku addons:create heroku-postgresql:hobby-dev
> heroku config
```
- Copy the entire DATABASE_URL location
```bash
>touch .env
```
- Paste the DATABASE_URL into the .env file
- Change the colon after DATABASE_URL to an equal sign
- At the end of the address add "?ssl=true"
example :
```javascript
DATABASE_URL = postgres://blahblahblah:.........83-28.compute-1.amazonaws.com:5432/d8pr5444mns72?ssl=true
```
- make sure it is all on one line (sometimes it adds spaces in the address)
- Let's add ```.env``` and ```node_modules``` to our .gitignore
- now let's add that to our knexfile.js so our application knows where the production database is
- first we need to install dotenv
```bash
> npm install dotenv --save
```
- Add ```javascript "var dotenv = require('dotenv').config()" ```to the top of the knexfile.js file
- In the production object in your knexfile.js set ```connection: process.env.DATABASE_URL,```
- So now let's push our users table to our database on heroku
```bash
> knex migrate:latest --env production

```
- from the command line you can check to see if the table is added to your heroku backend
```bash
> heroku pg:psql
 => \d // tells you what tables are on the database
 => TABLE users;
```
 - So now our database is launched on heroku and our table called "users" is on there and it contains no data yet.

 - Create a new directory and add a knex config file to the directory
 ```bash
 > mkdir db
 > touch db/knex_config.js
```
- Now let's setup our knex config file that we just created. This file will tell knex which database to connect to.
```javascript
'use strict'
 const knex = require('knex')
 const config = require('../knexfile.js');
 const env = process.env.NODE_ENV || 'development'

 let pg = knex(config[env]);

 module.exports = pg

 ```
 - On the routes/index.js file let's bring in our queries ```var query = require('../db/query.js')```
 - at the top of the routes/index.js file let's add ``` 'use strict' ``` to make heroku happy

- Now let's get to the auth stuff.
- We are going to be using passport google oauth
- Let's add these packages
```bash
> npm install --save express-session passport passport-google-oauth
```
- Let's bring in passport and session to our app.js file.
On line 8 add
```javascript
var session = require('express-session')
var passport = require('passport')
```
- and after ```app.use(cookieParser())``` on line 25 add
```javascript
app.use(session({
  secret : "keyboardcat",
  saveUninitialized: true,
  resave: false
}))

app.use(passport.initialize());
app.use(passport.session());
```

- Now we have to register our application with google. Go to https://console.developers.google.com/
- sign in if you aren't signed in and you will want to create a new project - enter the name of your project
- It takes about a minute to create a new project so be patient.
- We will be working in this window a lot so get familiar with it
- Then on the left side click on credentials
- Make sure that credentials is selected and then click on the create credentials button. Select google oauth client id
- choose web application enter the name of the app. This is the name that will appear to your users.
- Under restrictions we have to enter two urls. The first one is to tell google where the request is coming from and the second one is where google will redirect us to after the authentication is approved.
- we are going to first test this locally and by default we are on port 3000.
- Under Authorized JavaScript origins enter ```http://localhost:3000```
- Under Authorized redirect URIs enter ```http://localhost:3000/auth/google/callback```
- Click submit and you will see a pop-up with our client id and client secret from google. Copy and paste both into your .env file and assign them to the following names.

```javascript
GOOGLE_CLIENT_ID = xxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = blahblahblahblahblah
```

-Let's make a query file where we can write our queries.
```bash
>touch db/query.js
```
-In the query.js file let's require in knex and write a few queries to export.
```javascript
var knex = require('./knex_config.js')

var Users = function(){
  return knex('users')
}

module.exports = {
  getAllUsers : function(){
    return Users();
  },
  getAllUsersByIdAndGoogleProfileId : function(profile){
    return Users().where('googleID', profile.id).first()
  },   
  getUserById: function(profile){
      return Users().where('id', profile.id).first()
    }
}
```

- Now let's create a file where we have our passport auth from the root directory
```bash
>touch passport.js
```
-let's add our requirements to that file (passport.js)

```javascript
var queries = require('./db/query');
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var knex = require('./db/knex_config')
var dotenv = require('dotenv').config()
```
-under the requirements let's add the data to serialize and deserialize users.
``` javascript
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});
```
now we can add the googleAuth stuff under the serialize data
```javascript
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback", // this has to match with what you entered in the google developers console. This is the url that google will redirect you to after the auth is finished.
        passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
      queries.getAllUsersByIdAndGoogleProfileId(profile)
            .then(function(user) {
                if (user) {
                    //console.log('It worked and didnt add a new user')
                    return done(null, user)
                } else {
                    //console.log("it added a new user")
                    queries.getAllUsers().insert({
                            googleID: profile.id,
                            token: accessToken,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            photo: profile.photos[0].value
                        }, "*")
                        .then((users) => {
                            return done (null, users[0])
                        })

                }
            })

    }
));

module.exports = {
  passport: passport,

  //route middleware to ensure user is authenticated
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      //console.log('user is authenticated')
        return next();
    } else {
        //console.log('ensure authenticated didnt work')
        res.redirect('/');
    }
}}
```
-Let's add the oauth routes in the routes/index.js file
-First we need to require our passport in.
- At the top of our index.js file lets add
```javascript
var auth = require('../passport.js')
```
- Now let's add our routes under that
```javascript
router.get('/auth/google', auth.passport.authenticate('google', {
    scope: [
        'profile', 'email',
    ],
    accessType: 'offline',
    approvalPrompt: 'force'
}));

router.get('/auth/google/callback',
    auth.passport.authenticate('google', {
        successRedirect: '/welcome',
        failureRedirect: '/'
      }
    )
);

router.get('/welcome', auth.ensureAuthenticated,  function(req, res, next) {
  query.getUserById(req.user)
  .then((userdata) => {
    res.render('welcome', {user: userdata})
  })
})

```
- Now let's add a button to hit that route. In the views/ index.hbs delete the lines there and add the following
```javascript
<input type="button" onclick="location.href='/auth/google';" value="sign in" />
```

- Now let's create the welcome view that we are redirecting to.
```bash
>touch views/welcome.hbs
```
- in that welcome.hbs file add ```<h2> Welcome {{user.name}}</h2>```
- now run nodemon and see if it works :)

- Getting it on heroku isn't too hard. You just need to add the google codes from your dotenv file to heroku. I can't remember the command so that's why im not adding it. I think that you can add them from your heroku dashboard as well.

- Lastly, you need to add your heroku url to your google developers console in the same place and format as your localhost urls. 
