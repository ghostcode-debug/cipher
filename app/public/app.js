let currentUserId = null;

function showLoginForm() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('mainContainer').classList.remove('visible');
}

function showMainApp() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainContainer').classList.add('visible');
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    const result = await api.login(email, password);
    if (result.success) {
        currentUserId = result.userId;
        console.log('✅ Login successful. Encryption enabled!');
        showMainApp();
        initializeApp();
    } else {
        alert('Login failed: ' + (result.error || 'Unknown error'));
    }
}

async function initializeApp() {
    loadUsers();
    setupEventListeners();
    connectWebSocket();
}

async function loadUsers() {
    const users = await api.getUsers();
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';

    users.forEach(user => {
        if (user.id !== api.userId) {
            const userEl = document.createElement('div');
            userEl.className = 'conversation-item';
            userEl.innerHTML = \<div class="conversation-avatar"></div><div class="conversation-info"><div class="conversation-name">${user.username}</div><div class="conversation-preview">Click to chat</div></div>\;
            userEl.onclick = () => selectUser(user);
            usersList.appendChild(userEl);
        }
    });
}

let selectedUser = null;

async function selectUser(user) {
    selectedUser = user;
    document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    document.getElementById('chatTitle').textContent = user.username;
    document.getElementById('userStatus').textContent = '🟢 Online';
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('encryptionStatus').textContent = '🔒 Encrypted';

    await loadMessages(user.id);
}

async function loadMessages(userId) {
    const messages = await api.getMessages(userId);
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    messages.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = 'message ' + (msg.senderId === api.userId ? 'sent' : 'received');
        
        const encryptionBadge = msg.encrypted ? '🔒' : '';
        
        messageEl.innerHTML = \<div class="message-time">\</div><div class="message-bubble">\ \</div>\;
        
        container.appendChild(messageEl);
    });

    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const text = document.getElementById('messageInput').value.trim();
    if (!text || !selectedUser) return;

    document.getElementById('messageInput').value = '';

    const result = await api.sendMessage(selectedUser.id, text);
    if (result.success) {
        await loadMessages(selectedUser.id);
    } else {
        alert('Failed to send message: ' + (result.error || 'Unknown error'));
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
    document.getElementById('loginBtn').onclick = handleLogin;
    document.getElementById('sendBtn').onclick = sendMessage;
    document.getElementById('messageInput').onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    document.getElementById('logoutBtn').onclick = () => {
        api.disconnect();
        showLoginForm();
        document.getElementById('messageInput').value = '';
        document.getElementById('messagesContainer').innerHTML = '<div class=\"no-conversation\">Select a conversation to start messaging</div>';
    };

    document.getElementById('settingsBtn').onclick = () => {
        alert('Privacy Settings\n\n🔐 End-to-End Encryption: ENABLED\n\nYour messages are encrypted and only visible to you and the recipient.');
    };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    showLoginForm();
});


// FILE UPLOAD HANDLER
function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: e.target.result.split(',')[1]
        };
        
        const sendBtn = document.getElementById('sendBtn');
        sendBtn.textContent = 'Uploading...';
        sendBtn.disabled = true;
        
        fetch('http://localhost:5000/api/messages/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId: currentUserId,
                receiverId: currentChatUserId,
                file: fileData
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const fileMsg = '📁 ' + file.name + ' (' + formatFileSize(file.size) + ')';
                addMessage(currentUserId, fileMsg);
            }
        })
        .catch(err => console.error('Upload error:', err))
        .finally(() => {
            sendBtn.textContent = 'Send';
            sendBtn.disabled = false;
        });
    };
    reader.readAsDataURL(file);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// FILE INPUT EVENT
document.getElementById('fileBtn')?.addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) {
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'fileInput';
        input.style.display = 'none';
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
                input.value = '';
            }
        });
        document.body.appendChild(input);
        input.click();
    } else {
        fileInput.click();
    }
});


