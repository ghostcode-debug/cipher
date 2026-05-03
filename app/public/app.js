// Rate Limiter class - DEFINE FIRST
class RateLimiter {
    constructor(maxRequests, timeWindowMs) {
        this.maxRequests = maxRequests;
        this.timeWindowMs = timeWindowMs;
        this.requests = [];
    }

    isAllowed() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindowMs);
        
        if (this.requests.length < this.maxRequests) {
            this.requests.push(now);
            return true;
        }
        return false;
    }
}

// app.js - Cipher Desktop App with Electron Integration

let currentConversation = null;
let conversations = {};
let settings = {};
let messageLimiter = new RateLimiter(10, 1000);

const sampleConversations = {
    alice: {
        name: 'Alice',
        avatar: '👩',
        status: 'online',
        messages: [
            { sender: 'alice', text: 'Hey! How are you?', time: '10:30 AM', status: 'read' },
            { sender: 'user', text: 'Hi Alice! Doing great!', time: '10:31 AM', status: 'delivered' },
            { sender: 'alice', text: 'Thats awesome!', time: '10:32 AM', status: 'read' }
        ]
    },
    bob: {
        name: 'Bob',
        avatar: '👨',
        status: 'away',
        messages: [
            { sender: 'user', text: 'Hey Bob, hows it going?', time: '9:15 AM', status: 'delivered' },
            { sender: 'bob', text: 'Good! Busy with work', time: '9:45 AM', status: 'read' }
        ]
    },
    carol: {
        name: 'Carol',
        avatar: '👩‍🦰',
        status: 'offline',
        messages: [
            { sender: 'carol', text: 'Thanks for the help!', time: '8:00 AM', status: 'read' },
            { sender: 'user', text: 'No problem!', time: '8:05 AM', status: 'delivered' }
        ]
    }
};

const defaultSettings = {
    encryption: false,
    readReceipts: true,
    selfDestruct: false,
    location: false,
    typing: true,
    preview: true,
    notifications: true
};

document.addEventListener('DOMContentLoaded', function() {
    loadAppVersion();
    loadSettings();
    loadConversations();
    initializeEventListeners();
    
    console.log('Cipher Desktop App Loaded');
});

function loadAppVersion() {
    if (window.electronAPI && window.electronAPI.getAppVersion) {
        window.electronAPI.getAppVersion().then(info => {
            document.getElementById('appVersion').textContent = 'v' + info.version;
        }).catch(err => {
            document.getElementById('appVersion').textContent = 'v1.0.0';
        });
    }
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
    document.getElementById('settingsBtn').addEventListener('click', openPrivacyPanel);
    document.getElementById('closePanelBtn').addEventListener('click', closePrivacyPanel);
    document.getElementById('privacyOverlay').addEventListener('click', closePrivacyPanel);
    
    document.getElementById('encryptionToggle').addEventListener('change', toggleSetting);
    document.getElementById('readReceiptsToggle').addEventListener('change', toggleSetting);
    document.getElementById('selfDestructToggle').addEventListener('change', toggleSetting);
    document.getElementById('locationToggle').addEventListener('change', toggleSetting);
    document.getElementById('typingToggle').addEventListener('change', toggleSetting);
    document.getElementById('previewToggle').addEventListener('change', toggleSetting);
    document.getElementById('notificationsToggle').addEventListener('change', toggleSetting);
    
    document.getElementById('blockBtn').addEventListener('click', blockUser);
    document.getElementById('reportBtn').addEventListener('click', reportUser);
    document.getElementById('clearChatBtn').addEventListener('click', clearChat);
}

function loadConversations() {
    if (window.electronAPI && window.electronAPI.loadConversations) {
        window.electronAPI.loadConversations().then(result => {
            if (result.success && result.data && Object.keys(result.data).length > 0) {
                conversations = result.data;
            } else {
                conversations = JSON.parse(JSON.stringify(sampleConversations));
                saveConversations();
            }
            renderConversationsList();
        }).catch(err => {
            conversations = JSON.parse(JSON.stringify(sampleConversations));
            renderConversationsList();
        });
    } else {
        const stored = localStorage.getItem('cipher_conversations');
        if (stored) {
            conversations = JSON.parse(stored);
        } else {
            conversations = JSON.parse(JSON.stringify(sampleConversations));
        }
        renderConversationsList();
    }
}

function saveConversations() {
    if (window.electronAPI && window.electronAPI.saveConversations) {
        window.electronAPI.saveConversations(conversations).catch(err => {
            localStorage.setItem('cipher_conversations', JSON.stringify(conversations));
        });
    } else {
        localStorage.setItem('cipher_conversations', JSON.stringify(conversations));
    }
}

function renderConversationsList() {
    const list = document.getElementById('conversationsList');
    list.innerHTML = '';
    
    for (const id in conversations) {
        const conv = conversations[id];
        const item = createConversationItem(id, conv);
        list.appendChild(item);
    }
}

function createConversationItem(id, conv) {
    const div = document.createElement('div');
    div.className = 'conversation-item';
    if (currentConversation === id) {
        div.classList.add('active');
    }
    div.dataset.id = id;
    
    const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
    const preview = lastMessage ? lastMessage.text.substring(0, 30) + '...' : 'No messages';
    const time = lastMessage ? lastMessage.time : '';
    
    const html = '<div class="conversation-avatar">' + conv.avatar + '</div>' +
        '<div class="conversation-info">' +
        '<div class="conversation-name">' + escapeHtml(conv.name) + '</div>' +
        '<div class="conversation-preview">' + escapeHtml(preview) + '</div>' +
        '</div>' +
        '<div class="conversation-time">' + time + '</div>';
    
    div.innerHTML = html;
    return div;
}

function selectConversation(e) {
    const item = e.target.closest('.conversation-item');
    if (!item) return;
    
    currentConversation = item.dataset.id;
    
    document.querySelectorAll('.conversation-item').forEach(i => {
        i.classList.remove('active');
    });
    item.classList.add('active');
    
    loadConversationView();
}

function loadConversationView() {
    if (!currentConversation) return;
    
    const conv = conversations[currentConversation];
    if (!conv) return;
    
    document.getElementById('chatTitle').textContent = conv.name;
    document.getElementById('userStatus').textContent = conv.status;
    document.getElementById('userStatus').className = 'user-status ' + conv.status;
    
    const badge = document.getElementById('encryptionBadge');
    if (settings.encryption) {
        badge.style.display = 'inline-flex';
    } else {
        badge.style.display = 'none';
    }
    
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    
    renderMessages();
}

function renderMessages() {
    if (!currentConversation) return;
    
    const container = document.getElementById('messagesContainer');
    const conv = conversations[currentConversation];
    
    if (!conv || !conv.messages || conv.messages.length === 0) {
        container.innerHTML = '<div class="no-conversation"><p>No messages yet. Start the conversation!</p></div>';
        return;
    }
    
    container.innerHTML = '';
    
    conv.messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'message ' + (msg.sender === 'user' ? 'sent' : 'received');
        
        const status = msg.sender === 'user' ? ' ' + msg.status : '';
        
        const html = '<div class="message-bubble"><span>' + escapeHtml(msg.text) + '</span></div>' +
            '<div class="message-time">' + msg.time + status + '</div>';
        
        div.innerHTML = html;
        container.appendChild(div);
    });
    
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    if (!currentConversation) return;
    
    if (!messageLimiter.isAllowed()) {
        alert('Too many messages! Please slow down.');
        return;
    }
    
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    if (text.length > 5000) {
        alert('Message too long (max 5000 characters)');
        return;
    }
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    if (!conversations[currentConversation].messages) {
        conversations[currentConversation].messages = [];
    }
    
    conversations[currentConversation].messages.push({
        sender: 'user',
        text: text,
        time: time,
        status: 'sent'
    });
    
    saveConversations();
    input.value = '';
    
    setTimeout(() => {
        simulateReply();
    }, 1000);
    
    renderMessages();
}

function simulateReply() {
    if (!currentConversation) return;
    
    const conv = conversations[currentConversation];
    if (!conv) return;
    
    const replies = [
        'That sounds great!',
        'I agree with you',
        'Let me think about that',
        'Sounds good to me!',
        'Ill get back to you on that',
        'Thanks for letting me know',
        'Perfect!',
        'Absolutely!'
    ];
    
    const reply = replies[Math.floor(Math.random() * replies.length)];
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    if (!conv.messages) {
        conv.messages = [];
    }
    
    conv.messages.push({
        sender: currentConversation,
        text: reply,
        time: time,
        status: 'delivered'
    });
    
    saveConversations();
    renderMessages();
}

function searchConversations(e) {
    const query = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.conversation-item');
    
    items.forEach(item => {
        const name = item.querySelector('.conversation-name');
        const preview = item.querySelector('.conversation-preview');
        
        const nameText = name ? name.textContent.toLowerCase() : '';
        const previewText = preview ? preview.textContent.toLowerCase() : '';
        
        if (nameText.includes(query) || previewText.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function loadSettings() {
    if (window.electronAPI && window.electronAPI.loadSettings) {
        window.electronAPI.loadSettings().then(result => {
            if (result.success && result.data && Object.keys(result.data).length > 0) {
                settings = result.data;
            } else {
                settings = JSON.parse(JSON.stringify(defaultSettings));
                saveSettings();
            }
            applySettings();
        }).catch(err => {
            settings = JSON.parse(JSON.stringify(defaultSettings));
            applySettings();
        });
    } else {
        const stored = localStorage.getItem('cipher_settings');
        if (stored) {
            settings = JSON.parse(stored);
        } else {
            settings = JSON.parse(JSON.stringify(defaultSettings));
        }
        applySettings();
    }
}

function saveSettings() {
    if (window.electronAPI && window.electronAPI.saveSettings) {
        window.electronAPI.saveSettings(settings).catch(err => {
            localStorage.setItem('cipher_settings', JSON.stringify(settings));
        });
    } else {
        localStorage.setItem('cipher_settings', JSON.stringify(settings));
    }
}

function applySettings() {
    document.getElementById('encryptionToggle').checked = settings.encryption || false;
    document.getElementById('readReceiptsToggle').checked = settings.readReceipts !== false;
    document.getElementById('selfDestructToggle').checked = settings.selfDestruct || false;
    document.getElementById('locationToggle').checked = settings.location || false;
    document.getElementById('typingToggle').checked = settings.typing !== false;
    document.getElementById('previewToggle').checked = settings.preview !== false;
    document.getElementById('notificationsToggle').checked = settings.notifications !== false;
}

function toggleSetting(e) {
    const id = e.target.id;
    const setting = id.replace('Toggle', '');
    
    settings[setting] = e.target.checked;
    saveSettings();
    
    if (setting === 'encryption') {
        loadConversationView();
    }
    
    console.log('Setting changed: ' + setting + ' = ' + e.target.checked);
}

function openPrivacyPanel() {
    document.getElementById('privacyPanel').classList.add('open');
    document.getElementById('privacyOverlay').classList.add('open');
}

function closePrivacyPanel() {
    document.getElementById('privacyPanel').classList.remove('open');
    document.getElementById('privacyOverlay').classList.remove('open');
}

function blockUser() {
    if (!currentConversation) return;
    
    const conv = conversations[currentConversation];
    if (confirm('Block ' + conv.name + '?')) {
        alert(conv.name + ' has been blocked.');
        closePrivacyPanel();
    }
}

function reportUser() {
    if (!currentConversation) return;
    
    const conv = conversations[currentConversation];
    if (confirm('Report ' + conv.name + '?')) {
        alert('Report submitted. Thank you!');
        closePrivacyPanel();
    }
}

function clearChat() {
    if (!currentConversation) return;
    
    const conv = conversations[currentConversation];
    if (confirm('Clear all messages with ' + conv.name + '?')) {
        conv.messages = [];
        saveConversations();
        renderMessages();
        closePrivacyPanel();
        alert('Chat history cleared.');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('Cipher app.js loaded successfully');
