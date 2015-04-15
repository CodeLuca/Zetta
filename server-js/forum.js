module.exports = function(app, db) {
    app.get('/forum', function(req, res) {
        if (!req.session.username) res.redirect('/login');
        else {
            db.threads.find(function(err, docs) {
                docs.sort(function(a, b) {
                    return parseInt(b.votes) - parseInt(a.votes);
                });
                res.render('forum', {
                    layout: 'main',
                    threads: docs
                });
            });
        }
    });
    app.get('/newthread', function(req, res) {
        if (!req.session.username) res.redirect('/login')
        else {
            res.render('newthread', {
                layout: 'main'
            });
        }
    });
    //New Thread Post Request. Such fun.
    app.post('/newthread', function(req, res) {
        if (!req.session.username) {
            res.redirect('/login');
            return;
        }
        //Find the user's account to check for spam.
        db.users.find({
            "name": req.session.username
        }, function(err, docs) {
            //Error Check!
            if (err) res.send('Report this error to an admin: ' + err);
            //Time since last post
            var time = Date.now() - docs[0].cooldown;
            //Check for cooldown
            if (time < (60000 * 60) && docs[0].cooldown != 0) {
                //if there is a cooldown show them the Forums page with error.
                db.threads.find(function(err, docs) {
                    docs.sort(function(a, b) {
                        return parseInt(b.votes) - parseInt(a.votes);
                    });
                    res.render('forum', {
                        layout: 'main',
                        threads: docs,
                        err: 'You can only post a thread every 60 minutes, this is to prevent spam. Please wait for the cooldown to wear off.'
                    });
                });
                return;
            } else {
                //If there is no cooldown let them make a post!
                var obj = {
                    name: req.body.title,
                    user: req.session.username,
                    votes: 0,
                    content: req.body.content,
                    date: Date.now()
                }
                //Insert the post to the threads database.
                db.threads.insert(obj, function() {
                    console.log('new thread', obj);
                    //Insert it into the user's object.
                    db.users.update({
                        "name": req.session.username
                    }, {
                        //Add cooldown
                        $set: {
                            "cooldown": Date.now()
                        }
                    })
                    //Add the post to the user's object.
                    db.users.update({
                        "name": req.session.username
                    }, {
                        $push: {
                            "threads": {
                                name: req.body.title,
                                content: req.body.content,
                                date: Date.now()
                            }
                        }
                    })
                    //redirect them to the forums.
                    res.redirect('/forum');
                });
            }
        });
    });
    app.post('/vote', function(req, res) {
        if (!req.session.username) {
            res.redirect('/login');
            return;
        }
        db.users.find({
            name: req.session.username
        }, function(err, docs) {
            if (err) res.send('Send this eror to an admin ' + err);
            var votes = docs[0].votes;
            var found = false;
            for (var i = 0; i < votes.length; i++) {
                if (votes[i].name == req.body.name && votes[i].type == req.body.type) {
                    found = true;
                }
            }
            if (found) {
            	res.send();
                return;
            } else {
                db.users.update({
                    "name": req.session.username
                }, {
                    $push: {
                        "votes": {
                            name: req.body.name,
                            type: 'up'
                        }
                    }
                })

                db.threads.update({
                    "name": req.body.name
                }, {
                    $inc: {
                        "votes": 1
                    }
                })
				res.send('');
            }
        });
        // req.body.name;
    });
}