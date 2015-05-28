var express = require('express')
var bodyParser = require('body-parser');
var app = express()
var mongojs = require('mongojs');
// var db = mongojs('mongodb://192.99.46.113:27017/pure', ['profile', 'threads', 'users']);
var db = mongojs('mongodb://localhost:27017/pure', ['profile', 'threads', 'users', 'tickets']);
var request = require("request");
var bcrypt = require('bcrypt');
var session = require('express-session')
var expressHbs = require('express-handlebars');
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Middleware etc.
app.use(express.static(__dirname + '/views/res'));
app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({secret: '1234567890QWERTY'}));
app.enable('trust proxy');

//Routes
require('./server-js/thread')(app, db, io);
require('./server-js/tickets')(app, db /*factions*/);
require('./server-js/routes')(app, db /*factions*/);
require('./server-js/forum')(app, db /*factions*/);

app.get('/', function(req, res){
	res.redirect('/login');
});

app.post('/ticketComment', function(req, res){
	res.redirect('/login');
});

app.get('/home', function(req, res){
	res.render('home');
});
//404 Page
app.get('*', function(req, res){
  res.send('<h2 style="font-family: arial; text-align: center; color: #890000">Page not found. <br>I know... It is fustrating. 	ლ(ಠ益ಠლ)', 404);
});

http.listen(3000);