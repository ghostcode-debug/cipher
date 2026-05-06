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
            userEl.innerHTML = 
                <div class="conversation-avatar">\</div>
                <div class="conversation-info">
                    <div class="conversation-name">\</div>
                    <div class="conversation-preview">Click to chat</div>
                </div>
            ;
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
        
        messageEl.innerHTML = 
            <div class="message-time">\</div>
            <div class="message-bubble">
                \ \
            </div>
        ;
        
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
