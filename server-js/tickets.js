module.exports = function(app, db) {
    app.get('/tickets', function(req, res) {
        var code;
        if (!req.session.username) {
            res.redirect('/login');
            return;
        }
        db.users.find({
            'name': req.session.username
        }, function(err, docs) {
            if (!docs[0]) {
                res.redirect('/login');
                return;
            }
            code = docs[0].secret
            if (docs[0].perms && docs[0].perms == 'admin') {
                admin();
                return;
            } else {
                normal();
            }
        });

        function normal() {
            db.tickets.find({
                user: req.session.username
            }, function(err, docs) {
                res.render('ticketsPlayer', {
                    layout: 'main',
                    'tickets': docs,
                    'code': code,
                    'sitePlayer': req.session.username
                });
            });
        }

        function admin() {
            db.tickets.find(function(err, docs) {
                res.render('ticketsAdmin', {
                    layout: 'main',
                    'tickets': docs,
                    'code': code,
                    'sitePlayer': req.session.username
                });
            });
        }
    });
    app.post('/newTicket', function(req, res) {
        var time;
        if (!req.session.username) {
            res.redirect('/login');
            return;
        }
        var date = new Date();
        time = date.toString().substring(0, 15)
        var content = req.body.content.toString().replace('\r\n', ' ')
        db.tickets.insert({
            'user': req.session.username,
            'ticketName': req.body.ticketName,
            'type': req.body.type,
            'status': 'open',
            'content': content,
            'comments': [],
            'time': time
        }, function() {
            res.redirect('/tickets');
        });
    });
    app.post('/ticketComment', function(req, res) {
        db.users.find({
            'name': req.session.username,
            'secret': req.body.code
        }, function(err, docs) {
            if (!docs[0]) {
                res.send('Error! Incorrect secret code. Please logout and log back in.')
                return;
            } else {
                if(req.body.ticketStatus == 'Closed'){
                    db.tickets.remove({
                        'ticketName': req.body.ticketName,
                        'user': req.body.ticketCreator,
                        'content': req.body.ticketContent
                    });
                    res.send('Success');
                } else
                    yes();
            }
        });

        function yes() {
            res.send('Success');
            db.tickets.update({
                'ticketName': req.body.ticketName,
                'user': req.body.ticketCreator,
                'content': req.body.ticketContent
            }, {
                $push: {
                    "comments": {
                        'account': req.body.commentUser,
                        'message': req.body.commentMsg
                    }
                },
                $set: {
                    'status': req.body.ticketStatus
                }
            });
        }
    });
};