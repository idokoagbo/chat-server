const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(__dirname + '/public'));

const responses = {
    'hello': 'hi',
    'whats todays date': 'today is the 6th of february 2023',
}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('message', (msg) => {
        // save message to db
        if (responses[msg]) {
            // io.emit('message', `client: ${msg}`);
            io.emit('message', `Server: ${responses[msg]}`);

            return;
        }
        io.emit('message', `client said: ${msg}`);
    });
});

http.listen(8000, () => {
    console.log('App listening on port 8000');
});