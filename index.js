var express = require('express')
var bodyParser = require('body-parser');
var app = express()
var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/test', ['users', 'project']);
var request = require("request");
var bcrypt = require('bcrypt');
var session = require('express-session')
var expressHbs = require('express-handlebars')

//Middleware etc.
app.use(express.static(__dirname + '/views/res'));
app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'homescreen.hbs'}));
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({secret: '1234567890QWERTY'}));
app.enable('trust proxy');

//Routes
require('./server-js/routes')(app);

app.get('/', function(req, res){
	res.render('index');
});

//404 Page
app.get('*', function(req, res){
  res.send('<center><img src="http://www.jornaldanacao.com.br/wp-content/themes/globalnews/images/bg_404.png">', 404);
});

//Start server
var server = app.listen(3000, function() {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)

});