let selectedUser = null;

async function initializeApp() {
    console.log('Initializing app...');
    await loadUsers();
    setupEventListeners();
    connectWebSocket();
}

async function loadUsers() {
    console.log('Loading users...');
    try {
        const users = await api.getUsers();
        console.log('Got users:', users);
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

        users.forEach(user => {
            if (user.id !== api.userId) {
                const userEl = document.createElement('div');
                userEl.className = 'conversation-item';
                userEl.innerHTML = `<div class="conversation-avatar"></div><div class="conversation-info"><div class="conversation-name">${user.username}</div><div class="conversation-preview">Click to chat</div></div>`;
                userEl.onclick = () => selectUser(user);
                usersList.appendChild(userEl);
            }
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function selectUser(user) {
    selectedUser = user;
    document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    document.getElementById('chatTitle').textContent = user.username;
    document.getElementById('userStatus').textContent = '🟢 Online';
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('encryptionStatus').textContent = 'Encrypted';

    await loadMessages(user.id);
}

async function loadMessages(userId) {
    try {
        const messages = await api.getMessages(userId);
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';

        messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = 'message ' + (msg.senderId === api.userId ? 'sent' : 'received');
            const encryptionBadge = msg.encrypted ? '🔒' : '';
            const timeStr = msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : '';
            messageEl.innerHTML = `<div class="message-time">${timeStr}</div><div class="message-bubble">${encryptionBadge} ${msg.text}</div>`;
            container.appendChild(messageEl);
        });

        container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

async function sendMessage() {
    const text = document.getElementById('messageInput').value.trim();
    if (!text || !selectedUser) {
        alert('Select a user first');
        return;
    }

    document.getElementById('messageInput').value = '';

    try {
        const result = await api.sendMessage(selectedUser.id, text);
        if (result.success) {
            await loadMessages(selectedUser.id);
        } else {
            alert('Error: ' + (result.error || 'Failed to send'));
        }
    } catch (error) {
        console.error('Send error:', error);
        alert('Error sending message');
    }
}

function connectWebSocket() {
    api.connectWebSocket((message) => {
        if (selectedUser && message.senderId === selectedUser.id) {
            loadMessages(selectedUser.id);
        }
    });
}

function setupEventListeners() {
    document.getElementById('sendBtn').onclick = sendMessage;
    document.getElementById('messageInput').onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    document.getElementById('logoutBtn').onclick = () => {
        api.disconnect();
        location.reload();
    };

    document.getElementById('settingsBtn').onclick = () => {
        alert('Settings coming soon');
    };
}

console.log('app.js loaded');

// FILE UPLOAD HANDLER
document.getElementById('fileBtn').addEventListener('click', () => {
    if (!selectedUser) {
        alert('Please select a user first');
        return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadFile(file);
        }
    };
    input.click();
});

async function uploadFile(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        try {
            const response = await fetch('http://localhost:5000/api/messages/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: api.userId,
                    receiverId: selectedUser.id,
                    file: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64
                    }
                })
            });
            const result = await response.json();
            if (result.success) {
                await loadMessages(selectedUser.id);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file');
        }
    };
    reader.readAsDataURL(file);
}
