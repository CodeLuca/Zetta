module.exports = function(app, db) {
	app.get('/view/:name', function(req, res){
		if(!req.session.username){
			res.redirect('/login');
			return;
		}

		var name = req.params.name;

		db.threads.find({"name": name}, function(err, docs){
			if(err) { res.send('tell the admin there is an error: ' + err); return; }
			if(!docs[0]) { res.redirect('/forum'); return; }

			res.render('thread', {
		        layout: 'main',
		        "name": name,
		        content: docs[0].content,
		        user: docs[0].user
	    	})
		});
	});
};