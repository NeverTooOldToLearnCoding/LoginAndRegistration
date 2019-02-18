const session = require('express-session');

var bcrypt = require('bcryptjs');
// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();
app.set('trust proxy', 1) // trust first proxy
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 60000 }
}))

// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Require Mongoose
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/my_first_db',{ useNewUrlParser:true});

const UserSchema = new mongoose.Schema({
	first_name: {type: String, required: [true, "A first name is required"], minlength: [1, "First name must have at least 1 characters"]},
	last_name: {type: String, required: [true, "A last name is required"], minlength: [1, "Last name must have at least 1 characters"]},
	email: {type: String, unique: [true, "Email is already taken."], required: [true, "Email is required"], minlength: [1, "Email must have at least 1 characters"]},
	password: {type: String, required: [true, "A password is required"], minlength: [1, "Password must have at least 1 characters"]},
}, {timestamps: true})

const User = mongoose.model('User', UserSchema);

// Use native promises
mongoose.Promise = global.Promise;

// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes

//require express flash
const flash = require('express-flash');
app.use(flash());

// Root Request
app.get('/', function(req, res) {
		// This is where we will retrieve the users from the database and include them in the view page we will be rendering.

		res.render('index');


});

// Add Message to DB 
app.post('/users', function(req, res) {
	// console.log("POST DATA", req.body);
	// create a new User with the name and age corresponding to those from req.body
						bcrypt.hash(req.body.password, 10)
						.then(hashed_password => {
							var user = new User(
							{ first_name:req.body.first_name,
								last_name:req.body.last_name,
								email:req.body.email,
								password:hashed_password,
							});

							user.save(function(err){
								if(err){
									console.log("We have an error!", err);
									// adjust the code below as needed to create a flash message with the tag and content you would like
									for(var key in err.errors){
										req.flash('registration', err.errors[key].message);
									}
									res.redirect('/');
								}
								else {
									console.log("User was successfully saved!");
									res.redirect('/');
								}
							})
						})
						.catch(error => {
									for(var key in err.errors){
										req.flash('registration', err.errors[key].message);
									}
							res.redirect('/');
						})
});

app.post('/sessions', (req, res) => {

console.log("Email: "+req.body.email);

	if(req.body.email == ''){
		console.log(req.body.email);
		req.flash('login',"Email cannot be blank.");
		res.redirect('/');
	}else{

    User.findOne({email:req.body.email}, (err, user) => {

        if (err) {
          console.log("User not found.");
          for(var key in err.errors){
            req.flash('registration', err.errors[key].message);
          }
            res.redirect('/')
        }else {
            // Code...
							bcrypt.compare(req.body.email, user.password)
								.then( result => {
									console.log("User successfully logged in.");
									req.session.user_id = user._id;
	              	res.redirect('/');
								})
								.catch( error => {
									for(var key in err.errors){
										req.flash('registration', err.errors[key].message);
									}
									res.redirect('/');
								})

        }

			})
  }


		});



// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
		console.log("listening on port 8000");
});