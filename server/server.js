const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./cipher.db', (err) => {
    if (err) console.error('Database error:', err);
    else console.log('Connected to SQLite database');
});

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)');
    db.run('CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, senderId TEXT NOT NULL, receiverId TEXT NOT NULL, text TEXT NOT NULL, status TEXT DEFAULT "sent", createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(senderId) REFERENCES users(id), FOREIGN KEY(receiverId) REFERENCES users(id))');
    db.run('CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, user1Id TEXT NOT NULL, user2Id TEXT NOT NULL, lastMessageAt DATETIME, FOREIGN KEY(user1Id) REFERENCES users(id), FOREIGN KEY(user2Id) REFERENCES users(id))');
});

const connectedUsers = new Map();

app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        db.run('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)', [userId, username, email, hashedPassword], function(err) {
            if (err) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            res.json({ success: true, userId, username, message: 'Account created successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Wrong password' });
        }

        res.json({ success: true, userId: user.id, username: user.username, email: user.email, message: 'Logged in successfully' });
    });
});

app.get('/api/users', (req, res) => {
    db.all('SELECT id, username, email FROM users', (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(users);
    });
});

app.get('/api/messages/:userId/:otherUserId', (req, res) => {
    const { userId, otherUserId } = req.params;

    db.all('SELECT * FROM messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY createdAt ASC', [userId, otherUserId, otherUserId, userId], (err, messages) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(messages || []);
    });
});

app.post('/api/messages', (req, res) => {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const messageId = uuidv4();

    db.run('INSERT INTO messages (id, senderId, receiverId, text, status) VALUES (?, ?, ?, ?, ?)', [messageId, senderId, receiverId, text, 'delivered'], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, messageId, message: 'Message sent' });
    });
});

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);

            if (message.type === 'login') {
                connectedUsers.set(message.userId, ws);
                console.log('User logged in: ' + message.userId);
                broadcastOnlineUsers();
            } 
            else if (message.type === 'message') {
                const messageId = uuidv4();
                
                db.run('INSERT INTO messages (id, senderId, receiverId, text, status) VALUES (?, ?, ?, ?, ?)', [messageId, message.senderId, message.receiverId, message.text, 'delivered'], (err) => {
                    if (err) {
                        ws.send(JSON.stringify({ error: 'Failed to save message' }));
                        return;
                    }

                    const recipientWs = connectedUsers.get(message.receiverId);
                    if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                        recipientWs.send(JSON.stringify({
                            type: 'message',
                            messageId,
                            senderId: message.senderId,
                            senderUsername: message.senderUsername,
                            text: message.text,
                            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                            status: 'delivered'
                        }));
                    }

                    ws.send(JSON.stringify({
                        type: 'message-sent',
                        messageId,
                        status: 'sent'
                    }));
                });
            }
            else if (message.type === 'logout') {
                connectedUsers.delete(message.userId);
                console.log('User logged out: ' + message.userId);
                broadcastOnlineUsers();
            }
        } catch (error) {
            console.error('WebSocket error:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        for (let [userId, userWs] of connectedUsers.entries()) {
            if (userWs === ws) {
                connectedUsers.delete(userId);
                broadcastOnlineUsers();
                break;
            }
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function broadcastOnlineUsers() {
    const onlineUsers = Array.from(connectedUsers.keys());
    const message = JSON.stringify({
        type: 'online-users',
        users: onlineUsers
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('');
    console.log('Cipher Messaging Server');
    console.log('======================');
    console.log('HTTP running on: http://localhost:' + PORT);
    console.log('WebSocket running on: ws://localhost:' + PORT);
    console.log('');
});
