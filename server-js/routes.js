module.exports = function(app, db) {
    app.get('/stats', function(req, res) {
        var kills, deaths, faction;
        if (!req.session.username) {
            res.redirect('/login')
        } else {
            /*factions.stats.find({
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
            res.render('stats', {
                layout: 'main',
                name: req.session.username
            })
        }
    });
    app.get('/profile/:name', function(req, res) {
        var kills, deaths, faction;
        if (!req.session.username) {
            res.redirect('/login')
        } else {
            /*factions.stats.find({
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
            res.render('stats', {
                layout: 'main',
                name: req.params.name
            })
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
                        if(!data[0]){
                            db.users.insert({name: user, threads: [], recent: [], votes: [] , cooldownStart: 0}, function(){
                                console.log(user + ' Logged in.');
                                res.redirect('/stats')
                                return;
                            });
                        } else {
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
