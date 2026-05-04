document.addEventListener('DOMContentLoaded', function() {
    console.log('App starting - showing login modal');
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('mainContainer').classList.remove('visible');
});

let currentConversation = null;
let allUsers = [];
let messageLimiter = new RateLimiter(10, 1000);

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    api.login(email, password).then(result => {
        if (result.success) {
            console.log('Login successful, showing main app');
            document.getElementById('loginContainer').classList.add('hidden');
            document.getElementById('mainContainer').classList.add('visible');
            initializeApp();
        } else {
            alert('Login failed: ' + (result.error || 'Unknown error'));
        }
    });
}

function handleLogout() {
    console.log('Logging out');
    api.disconnect();
    api.userId = null;
    api.username = null;
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('mainContainer').classList.remove('visible');
    document.getElementById('conversationsList').innerHTML = '';
    document.getElementById('loginEmail').value = 'alice@example.com';
    document.getElementById('loginPassword').value = 'password123';
}

function initializeApp() {
    console.log('Initializing app for user: ' + api.username);
    loadAppVersion();
    loadUsers();
    initializeEventListeners();
    setupServerMessageHandler();
}

function loadAppVersion() {
    document.getElementById('appVersion').textContent = 'v1.0.0';
}

function initializeEventListeners() {
    document.getElementById('conversationsList').addEventListener('click', selectConversation);
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    document.getElementById('searchInput').addEventListener('input', searchConversations);
}

function loadUsers() {
    console.log('Loading users from server');
    api.getUsers().then(users => {
        console.log('Users loaded:', users.length);
        allUsers = users.filter(u => u.id !== api.userId);
        renderConversationsList();
    }).catch(err => {
        console.error('Error loading users:', err);
    });
}

function renderConversationsList() {
    const list = document.getElementById('conversationsList');
    list.innerHTML = '';
    
    if (allUsers.length === 0) {
        list.innerHTML = '<p style="padding: 20px; color: #999;">No users found</p>';
        return;
    }
    
    allUsers.forEach(user => {
        const div = document.createElement('div');
        div.className = 'conversation-item';
        if (currentConversation === user.id) {
            div.classList.add('active');
        }
        div.dataset.id = user.id;
        
        const html = '<div class="conversation-avatar">' + user.username.charAt(0).toUpperCase() + '</div>' +
            '<div class="conversation-info">' +
            '<div class="conversation-name">' + escapeHtml(user.username) + '</div>' +
            '<div class="conversation-preview">Click to chat</div>' +
            '</div>';
        
        div.innerHTML = html;
        list.appendChild(div);
    });
}

function selectConversation(e) {
    const item = e.target.closest('.conversation-item');
    if (!item) return;
    
    currentConversation = item.dataset.id;
    document.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    loadConversationView();
}

function loadConversationView() {
    if (!currentConversation) return;
    
    const user = allUsers.find(u => u.id === currentConversation);
    if (!user) return;
    
    document.getElementById('chatTitle').textContent = user.username;
    document.getElementById('userStatus').textContent = 'online';
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    
    loadMessages();
}

function loadMessages() {
    if (!currentConversation || !api.userId) return;
    
    api.getMessages(currentConversation).then(messages => {
        renderMessages(messages);
    }).catch(err => {
        console.error('Error loading messages:', err);
    });
}

function renderMessages(messages) {
    const container = document.getElementById('messagesContainer');
    
    if (!messages || messages.length === 0) {
        container.innerHTML = '<div class="no-conversation"><p>No messages yet. Start the conversation!</p></div>';
        return;
    }
    
    container.innerHTML = '';
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'message ' + (msg.senderId === api.userId ? 'sent' : 'received');
        
        const status = msg.senderId === api.userId ? ' ' + msg.status : '';
        const time = msg.createdAt ? msg.createdAt.substring(11, 16) : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const html = '<div class="message-bubble"><span>' + escapeHtml(msg.text) + '</span></div>' +
            '<div class="message-time">' + time + status + '</div>';
        
        div.innerHTML = html;
        container.appendChild(div);
    });
    
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    if (!currentConversation || !api.userId) {
        alert('Not logged in or no conversation selected');
        return;
    }
    
    if (!messageLimiter.isAllowed()) {
        alert('Too many messages! Please slow down.');
        return;
    }
    
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    if (text.length > 5000) {
        alert('Message too long');
        return;
    }
    
    console.log('Sending message:', text);
    api.sendMessageWebSocket(currentConversation, text);
    input.value = '';
    
    setTimeout(() => loadMessages(), 500);
}

function setupServerMessageHandler() {
    window.onServerMessage = function(message) {
        console.log('Server message received:', message.type);
        if (message.type === 'message') {
            if (currentConversation === message.senderId) {
                loadMessages();
            }
        }
    };
}

function searchConversations(e) {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.conversation-item').forEach(item => {
        const name = item.querySelector('.conversation-name');
        const nameText = name ? name.textContent.toLowerCase() : '';
        item.style.display = nameText.includes(query) ? '' : 'none';
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('Cipher app.js loaded');
