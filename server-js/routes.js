module.exports = function(app, db) {
    app.get('/servers', function(req, res){
        if(!req.session.username){
            res.redirect('/login')
            return;
        }
        res.render('servers');
    });
    app.get('/buy', function(req, res){
        if(!req.session.username){
            res.redirect('/login')
            return;
        }
        res.render('buy');
    });
    app.get('/stats', function(req, res) {
        var kills, deaths, faction;
        if (!req.session.username) {
            res.redirect('/login')
        } else {
            /*db.stats.find({
                currentName: req.session.name
            }, function(err, docs) {
                if(!docs[0]){
                    res.send('Error: Nothing found with your username in the database. Please contact an admin.');
                    return;
                } else {
                    kills = docs[0].kills;
                    faction = docs[0].faction;
                    deaths = docs[0].deaths;
                }
            });*/
            res.redirect('/profile/' + req.session.username);
        }
    });
    app.get('/profile/:name', function(req, res) {
        var kills, deaths, faction;
        if (!req.session.username) {
            res.redirect('/login')
        } else {
            db.users.find({
                'name': req.params.name
            }, function(err, docs){
                if(!docs[0]){
                    console.log('error routesjs');
                    res.rediect('/logout');
                    return;
                }
                var a = docs[0].recent.slice(0, 4);
                var amount = docs[0].threads.length + 1;
                res.render('stats', {
                    'layout': 'main',
                    'recent': a,
                    'postAmount': amount,
                    'voteAmount': docs[0].votes.length,
                    'name': req.params.name
                })
            });
        }
    });
    app.get('/login', function(req, res) {
        if (req.session.username) res.redirect('/stats')
        else res.render('login', {
            layout: 'main'
        })
    });
    app.get('/soon', function(req, res) {
        if (!req.session.username) res.redirect('/login')
        else res.render('soon', {
            layout: 'main'
        })
    });
    app.post('/login', function(req, res) {
        var user = req.body.username;
        var pass = req.body.password;
        var temp;
        db.profile.find({
            currentName: user
        }, function(err, docs) {
            if (typeof docs[0] !== 'undefined') {
                temp = docs[0].password
                if (docs[0].password == "") {
                    res.render('login', {
                        layout: 'main',
                        err: 'Please create a password in game using /register (password)'
                    })
                    return;
                }
                if (pass !== docs[0].password) {
                    res.render('login', {
                        layout: 'main',
                        err: 'Incorrect Username or Password.'
                    })
                    return;
                } else {
                    req.session.username = user;
                    db.users.find({name: user}, function(err, data){
                      var secret = '';
                        for(var i = 0; i < 5; i++){
                          var x = Math.floor(Math.random() * (9 - 0)) + 0;
                          secret += x.toString();
                        }
                        console.log(secret);
                        if(!data[0]){
                            db.users.insert({name: user, threads: [], recent: [], votes: [] , cooldownStart: 0, 'secret': secret}, function(){
                                console.log(user + ' Logged in.');
                                res.redirect('/stats')
                                return;
                            });
                        } else {
                            if(data[0].recent.length > 5){
                                //remove recents
                            }
                            db.users.update({name: user}, {$set: {'secret': secret}});
                            console.log(user + ' Logged in.');
                            res.redirect('/stats')
                            return;
                        }
                    });
                }
            } else {
                res.render('login', {
                    layout: 'main',
                    err: 'Incorrect Minecraft Username.'
                })
                return;
            }
        });
    });
}
