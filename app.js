const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://chat-server-user:jvZclyYOnZaR1DDY@idokoagbo1.1iuva.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true });

// import user schema
const User = require('./schema/user');
// import message schema
const Message = require('./schema/message');
// import response schema
const Response = require('./schema/response');
const { response } = require('express');

app.use(cors());
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH"]
    }
});

app.use(express.static(__dirname + '/public'));

// login
app.post('/login', (req, res, next) => {

    const { username, password } = req.body;

    User.find({
        email: username,
        password: password,
    }, (error, user) => {
        if (error) {
            return res.status(500).send(error);
        } else {
            if (user.length > 0) {
                return res.send(user[0]);
            }

            return res.status(400).send('Incorrect login credentials');
        }
    })

});

// get all responses
app.get('/responses', (req, res, next) => {

    Response.find({}, (error, document) => {
        if (error) {
            return res.status(500).send(error);
        }

        return res.send(document);
    });

});

// add new message response
app.post('/responses', (req, res, next) => {

    console.log(req.body);

    const { prompt, response } = req.body;

    const newResponse = new Response({
        message: prompt,
        response: response,
    });

    newResponse.save((error, document) => {
        if (error) {
            return res.status(500).send(error);
        }

        return res.send(document);
    })

});

// update message response
app.patch('/response/:id', (req, res, next) => {
    const id = req.params.id;
    const response = req.body.response;

    Response.findById({ _id: id }, (error, document) => {
        if (error) {
            return res.status(500).send(error);
        }
        else {
            document.response = response;
            document.save();

            return res.send(document);
        }
    });
});


// handle communication
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('message', (msg) => {
        const text = msg.split(":");
        const sender = text[0];
        const body = text.pop();
        // save message to db
        const message = new Message({
            message: body,
            sender: sender,
            receiver: sender == 'User' ? 'Agent' : 'User',
        });
        message.save();

        // check for matching response
        Response.find({ message: body }, (error, document) => {
            if (error) {
                console.log(error);
            }
            else {
                if (document.length > 0) {
                    io.emit('message', `Agent: ${document[0].response}`);
                } else {
                    io.emit('message', `${msg}`);
                }
            }
        });
    });
});

http.listen(8000, () => {
    console.log('App listening on port 8000');
});