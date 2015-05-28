module.exports = function(app, db, io) {
    app.get('/view/:name&:user', function(req, res) {
        var code, perms;
        if (!req.session.username) {
            res.redirect('/login');
            return;
        }
        var name = req.params.name;
        var user = req.params.user;
        db.users.find({
            "name": req.session.username
        }, function(err, docs) {
            if (!docs[0]) {
                console.log('No Player Found: thread.js');
                return;
            }
            code = docs[0].secret;
            console.log(code);
            if (docs[0].perms) {
                perms = docs[0].perms;
            }
        });
        db.threads.find({
            "name": name,
            'user': user
        }, function(err, docs) {
            if (err) {
                res.send('tell the admin there is an error: ' + err);
                return;
            }
            if (!docs[0]) {
                res.redirect('/forum');
                return;
            }
            var com = docs[0].comments.reverse();
            res.render('thread', {
                layout: 'main',
                "name": name,
                'user': docs[0].user,
                content: docs[0].content,
                siteUser: req.session.username,
                comments: com,
                'code': code,
                'rank': perms
            })
        });
    });
    io.on('connection', function(socket) {
        socket.on('room', function(room) {
            socket.join(room);
            socket.emit('joined');
        });
        socket.on('chat', function(room, msg, name, code) {
            var lastMsg, recent;
            var chk = msg.replace(/\s+/g, '')
            //Check if the message is empty
            if (!msg == '') {
                if (chk != '') {
                    //Find their last message
                    db.users.find({
                        'name': name
                    }, function(err, docs) {
                        //If the user doesn't exist, shit's gone wrong.
                        if (docs == []) {
                            console.log('User not found thread.js "docs == []"')
                            return;
                        } else {
                            if (docs[0].secret != code) {
                                socket.emit('newMsg', "Sadly something went wrong. Don't Worry! Just login again and all will be fixed. This is just for security measures!", 'Admin');
                                return;
                            }
                            //Recent array define
                            recent = docs[0].recent;
                            //If there is no last message, then it don't matter.
                            if (recent[0]) {
                                if (msg == recent[recent.length - 1]) {
                                    socket.emit('newMsg', "Error: Please don't repeat messages.", 'Admin');
                                    return;
                                } else {
                                    success();
                                }
                            } else {
                                success();
                            }
                        }
                    });
                }

                function success() {
                    io.to(room).emit('newMsg', msg, name);
                    db.users.update({
                        'name': name
                    }, {
                        $push: {
                            "recent": {
                                "post": room,
                                "time": time
                            }
                        }
                    });
                    db.threads.update({
                        'name': room
                    }, {
                        $push: {
                            "comments": {
                                'user': name,
                                'msg': msg,
                                'time': Date.now()
                            }
                        }
                    });
                }
            }
        });
        socket.on('disconnect', function() {
            // this returns a list of all rooms this user is in
            if (!io.sockets.manager) {
                return;
            } else {
                var rooms = io.sockets.manager.roomClients[socket.id];
                for (var room in rooms) {
                    socket.leave(room);
                }
            }
        });
    });
};