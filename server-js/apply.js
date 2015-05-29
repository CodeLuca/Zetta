module.exports = function(app, db) {
    app.get('/apply', function(req, res) {
        if (!req.session.username) {
            res.redirect('/login');
            return;
        }
        db.users.find({
            'name': req.session.username
        }, function(err, docs) {
            if (!docs[0]) {
                res.redirect('/logout');
                return;
            } else {
                if (!docs[0].perms) {
                    res.render('apply', {
                        'user': req.session.username,
                        'code': docs[0].secret
                    });
                } else {
                    var mod, yt;
                    db.applications.find({
                        'type': 'moderator'
                    }, function(err, data) {
                        mod = data;
                        two();
                    });

                    function two() {
                        db.applications.find({
                            'type': 'youtuber'
                        }, function(err, data) {
                            yt = data;
                            three();
                        });
                    }

                    function three() {
                        res.render('applyAdmin', {
                            'user': req.session.username,
                            'code': docs[0].secret,
                            'moderator': mod,
                            'youtuber': yt
                        });
                    }
                }
            }
        });
    });
    app.post('/newApp', function(req, res) {
        if (!req.session.username) {
            res.redirect('/login');
            return;
        }
        db.users.find({
            'name': req.session.username
        }, function(err, docs) {
            if (!docs[0]) {
                res.redirect('/logout');
                console.log('ERROR apply!');
                return;
            }
            if (docs[0].secret != req.body.code) {
                res.redirect('/logout')
                return;
            } else {
                make();
            }
        });

        function make() {
            var obj;
            var date = new Date();
            time = date.toString().substring(0, 15)
            if (req.body.type == 'youtube') {
                obj = {
                    'user': req.session.username,
                    'channel': req.body.channel,
                    'link': req.body.link,
                    'type': 'youtuber',
                    'date': time,
                    'status': 'Unread'
                }
            } else if (req.body.type == "moderator") {
                var experience = req.body.experience.replace('\r\n', ' ');
                var info = req.body.info.replace('\r\n', ' ');
                obj = {
                    'user': req.session.username,
                    'server': req.body.server,
                    'age': req.body.age,
                    'timezone': req.body.timezone,
                    'skype': req.body.skype,
                    'activity': req.body.activity,
                    'experience': experience,
                    'info': info,
                    'date': time,
                    'type': 'moderator',
                    'status': 'Unread'
                }
            }
            db.applications.insert(obj);
            res.redirect('/home');
        }
    });
};