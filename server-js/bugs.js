module.exports = function(app, db){
	app.get('/bugs', function(req, res){
		if(!req.session.username){
			res.redirect('/login');
			return;
		}
		var secret;
		db.users.find({
			'name': req.session.username
		}, function(err, docs){
			if(!docs[0]){
				res.redirect('/logout');
				return;
			}
			secret = docs[0].secret;
			if(!docs[0].perms){
				res.render('bugs', {
					'user': req.session.username,
					'code': docs[0].secret
				});
			} else {
				admin();
			}
		});
		function admin(){
			db.bugs.find(function(err, docs){
				res.render('adminBugs', {
					'user': req.session.username,
					'code': secret,
					'bugs': docs
				});				
			});
		}
	});	

	app.post('/newBug', function(req, res){
		if(!req.session.username){
			res.redirect('/login');
			return;
		}
		db.users.find({
			'name': req.session.username
		}, function(err, docs){
			if(!docs[0] || (docs[0].secret != req.body.code)){
				console.log(req.body.code, docs[0].secret)
				res.redirect('/logout');
				return;
			} else {
				res.redirect('/stats');
	            var date = new Date();
	            time = date.toString().substring(0, 15)
				var obj = {
					'user': req.session.username,
					'bugName': req.body.bugName,
					'server': req.body.server,
					'info': req.body.info,
					'how': req.body.how,
					'date': time
				}
				db.bugs.insert(obj)
			}
		});
	});
};