import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {}
});
import os from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat', (msg) => {
        io.emit('chat', msg);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
    const networkInterfaces = os.networkInterfaces();
    for (let interfaceKey in networkInterfaces) {
        networkInterfaces[interfaceKey].forEach((details) => {
            if (details.family === 'IPv4' && !details.internal) {
                console.log(`Server running at http://${details.address}:3000/`);
            }
        });
    }

});