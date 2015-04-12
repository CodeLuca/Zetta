module.exports = function(app, db){
	app.get('/forum', function(req, res){
		if(!req.session.username)
			res.redirect('login');
		else
		res.render('forum', {layout: 'main'});
	});
}