module.exports = function(app, db) {
    app.get('/forum', function(req, res) {
        if (!req.session.username) res.redirect('/login');
        else {
            db.threads.find(function(err, docs) {
                docs.sort(function(a, b) {
                    return parseInt(b.votes) - parseInt(a.votes);
                });
                db.users.find({
                    'name': req.session.username
                }, function(err, data){
                    if(!data[0].perms){
                        res.render('forum', {
                            layout: 'main',
                            threads: docs,
                            sitePlayer: req.session.username,
                            code: data[0].secret,
                            aT: 'false'
                        });
                    } else {
                        res.render('forum', {
                            layout: 'main',
                            threads: docs,
                            sitePlayer: req.session.username,
                            code: data[0].secret,
                            aT: 'true'
                        });
                    }
                });
            });
        }
    });
    app.get('/logout', function(req, res) {
        delete req.session.username;
        res.redirect('/login');
    });
    app.get('/newthread', function(req, res) {
        if (!req.session.username) res.redirect('/login')
        else {
            res.render('newthread', {
                layout: 'main'
            });
        }
    });
    app.post('/delthread', function(req, res){
        if (!req.session.username){
            res.redirect('/login');
            return;
        }
        db.users.find({'name': req.body.user}, function(err, docs){
            if(!docs[0] || (docs[0].secret != req.body.secret)){
                res.send('401');
            } else {
                pass();
            }
            function pass(){
                console.log(JSON.stringify(req.body));
                db.threads.remove({
                    'name': req.body.name,
                    'votes': parseInt(req.body.votes),
                    'content': req.body.content
                });
                res.send(200);
            }
        });
    });
    //New Thread Post Request. Such fun.
    app.post('/newthread', function(req, res) {
        var postTitle, allowed;
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
            if (time < (60000) && docs[0].cooldown != 0) {
                //if there is a cooldown show them the Forums page with error.
                db.threads.find(function(err, docs) {
                    docs.sort(function(a, b) {
                        return parseInt(b.votes) - parseInt(a.votes);
                    });
                    res.render('forum', {
                        layout: 'main',
                        threads: docs,
                        err: 'You can only post a thread every 60 seconds, this is to prevent spam. Please wait for the cooldown to wear off.'
                    });
                });
                return;
            } else {
                //Check if player already has made a post with that name.
                db.threads.find({
                    name: req.body.title,
                    user: req.session.username
                }, function(err, docs) {
                    if (docs[0]) {
                        res.render('newthread', {
                            layout: 'main',
                            err: 'You already have a thread with that name!'
                        });
                        // res.redirect('/forum');
                        console.log('false');
                        return;
                    } else {
                        post();
                    }
                });
                //If there is no cooldown let them make a post!
                var content = req.body.content.replace(/(?:\r\n|\r|\n)/g, '<br />');
                function post() {
                    var obj = {
                        name: req.body.title,
                        user: req.session.username,
                        votes: 0,
                        content: content,
                        date: Date.now(),
                        comments: []
                    };
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
                            },
                            $push: {
                                "recent": {
                                    "post": req.body.title,
                                    "type": 'Create'
                                }
                            }
                        })
                        //redirect them to the forums.
                        res.redirect('/forum');
                    });
                }
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
            console.log(votes);
            var found = false;
            for (var i = 0; i < votes.length; i++) {
                if (votes[i].name == req.body.name) {
                    if (votes[i].type == req.body.type) {
                        found = true;
                        console.log(votes[i].type, req.body.type)
                    } else {
                        console.log('opposite')
                        return;
                    }
                }
            }
            if (found == true) {
                res.send();
                return;
            } else {
                db.users.update({
                    'name': req.session.username
                }, {
                    $push: {
                        "recent": {
                            "post": req.body.name,
                            "type": "Vote"
                        }
                    }
                });

                if (req.body.type == 'up') {
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
                } else if (req.body.type == 'down') {
                    db.users.update({
                        "name": req.session.username
                    }, {
                        $push: {
                            "votes": {
                                name: req.body.name,
                                type: 'down'
                            }
                        }
                    })
                    db.threads.update({
                        "name": req.body.name
                    }, {
                        $inc: {
                            "votes": -1
                        }
                    })
                    res.send('');
                }
            }
        });
        // req.body.name;
    });
}