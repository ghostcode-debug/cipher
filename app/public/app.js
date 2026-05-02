// app.js - Cipher Desktop App Logic
// Main application functionality

let currentConversation = null;
let conversations = {};
let settings = {};

// Sample conversations
const sampleConversations = {
    alice: {
        name: 'Alice',
        avatar: '👩',
        status: 'online',
        messages: [
            { sender: 'alice', text: 'Hey! How are you?', time: '10:30 AM', status: 'read' },
            { sender: 'user', text: 'Hi Alice! Doing great!', time: '10:31 AM', status: 'delivered' },
            { sender: 'alice', text: 'That\'s awesome!', time: '10:32 AM', status: 'read' },
        ]
    },
    bob: {
        name: 'Bob',
        avatar: '👨',
        status: 'away',
        messages: [
            { sender: 'user', text: 'Hey Bob, how\'s it going?', time: '9:15 AM', status: 'delivered' },
            { sender: 'bob', text: 'Good! Busy with work', time: '9:45 AM', status: 'read' },
        ]
    },
    carol: {
        name: 'Carol',
        avatar: '👩‍🦰',
        status: 'offline',
        messages: [
            { sender: 'carol', text: 'Thanks for the help!', time: '8:00 AM', status: 'read' },
            { sender: 'user', text: 'No problem!', time: '8:05 AM', status: 'delivered' },
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

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    loadConversations();
    initializeEventListeners();
    renderConversationsList();
    loadAppVersion();
    
    console.log('🔐 Cipher Desktop App Loaded');
});

function loadAppVersion() {
    if (window.electronAPI && window.electronAPI.getAppVersion) {
        window.electronAPI.getAppVersion().then(info => {
            document.getElementById('appVersion').textContent = 'v' + info.version;
        });
    }
}

function initializeEventListeners() {
    // Conversation selection
    document.getElementById('conversationsList').addEventListener('click', selectConversation);
    
    // Message sending
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Search
    document.getElementById('searchInput').addEventListener('input', searchConversations);
    
    // Privacy panel
    document.getElementById('settingsBtn').addEventListener('click', openPrivacyPanel);
    document.getElementById('closePanelBtn').addEventListener('click', closePrivacyPanel);
    document.getElementById('privacyOverlay').addEventListener('click', closePrivacyPanel);
    
    // Privacy toggles
    document.getElementById('encryptionToggle').addEventListener('change', toggleSetting);
    document.getElementById('readReceiptsToggle').addEventListener('change', toggleSetting);
    document.getElementById('selfDestructToggle').addEventListener('change', toggleSetting);
    document.getElementById('locationToggle').addEventListener('change', toggleSetting);
    document.getElementById('typingToggle').addEventListener('change', toggleSetting);
    document.getElementById('previewToggle').addEventListener('change', toggleSetting);
    document.getElementById('notificationsToggle').addEventListener('change', toggleSetting);
    
    // Action buttons
    document.getElementById('blockBtn').addEventListener('click', blockUser);
    document.getElementById('reportBtn').addEventListener('click', reportUser);
    document.getElementById('clearChatBtn').addEventListener('click', clearChat);
}

// CONVERSATION MANAGEMENT
function loadConversations() {
    const stored = localStorage.getItem('cipher_conversations');
    if (stored) {
        conversations = JSON.parse(stored);
    } else {
        conversations = JSON.parse(JSON.stringify(sampleConversations));
        saveConversations();
    }
}

function saveConversations() {
    localStorage.setItem('cipher_conversations', JSON.stringify(conversations));
}

function renderConversationsList() {
    const list = document.getElementById('conversationsList');
    list.innerHTML = '';
    
    Object.keys(conversations).forEach(id => {
        const conv = conversations[id];
        const item = createConversationItem(id, conv);
        list.appendChild(item);
    });
}

function createConversationItem(id, conv) {
    const div = document.createElement('div');
    div.className = 'conversation-item';
    if (currentConversation === id) {
        div.classList.add('active');
    }
    div.dataset.id = id;
    
    const lastMessage = conv.messages[conv.messages.length - 1];
    const preview = lastMessage ? lastMessage.text.substring(0, 30) + '...' : 'No messages';
    const time = lastMessage ? lastMessage.time : '';
    
    div.innerHTML = \
        <div class="conversation-avatar">\</div>
        <div class="conversation-info">
            <div class="conversation-name">\</div>
            <div class="conversation-preview">\</div>
        </div>
        <div class="conversation-time">\</div>
    \;
    
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
    
    container.innerHTML = '';
    
    conv.messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'message ' + (msg.sender === 'user' ? 'sent' : 'received');
        
        const status = msg.sender === 'user' ? ' ' + msg.status : '';
        
        div.innerHTML = \
            <div class="message-bubble">
                <span>\</span>
            </div>
            <div class="message-time">\\</div>
        \;
        
        container.appendChild(div);
    });
    
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    if (!currentConversation) return;
    
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
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
    const replies = [
        'That sounds great!',
        'I agree with you',
        'Let me think about that',
        'Sounds good to me!',
        'I\'ll get back to you on that',
        'Thanks for letting me know',
        'Perfect!',
        'Absolutely!'
    ];
    
    const reply = replies[Math.floor(Math.random() * replies.length)];
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
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
        const name = item.querySelector('.conversation-name').textContent.toLowerCase();
        const preview = item.querySelector('.conversation-preview').textContent.toLowerCase();
        
        if (name.includes(query) || preview.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// PRIVACY SETTINGS
function loadSettings() {
    const stored = localStorage.getItem('cipher_settings');
    if (stored) {
        settings = JSON.parse(stored);
    } else {
        settings = JSON.parse(JSON.stringify(defaultSettings));
        saveSettings();
    }
    
    applySettings();
}

function saveSettings() {
    localStorage.setItem('cipher_settings', JSON.stringify(settings));
}

function applySettings() {
    document.getElementById('encryptionToggle').checked = settings.encryption;
    document.getElementById('readReceiptsToggle').checked = settings.readReceipts;
    document.getElementById('selfDestructToggle').checked = settings.selfDestruct;
    document.getElementById('locationToggle').checked = settings.location;
    document.getElementById('typingToggle').checked = settings.typing;
    document.getElementById('previewToggle').checked = settings.preview;
    document.getElementById('notificationsToggle').checked = settings.notifications;
}

function toggleSetting(e) {
    const id = e.target.id;
    const setting = id.replace('Toggle', '');
    
    settings[setting] = e.target.checked;
    saveSettings();
    
    if (setting === 'encryption') {
        loadConversationView();
    }
    
    console.log('Setting changed:', setting, '=', e.target.checked);
}

function openPrivacyPanel() {
    document.getElementById('privacyPanel').classList.add('open');
    document.getElementById('privacyOverlay').classList.add('open');
}

function closePrivacyPanel() {
    document.getElementById('privacyPanel').classList.remove('open');
    document.getElementById('privacyOverlay').classList.remove('open');
}

// ACTION BUTTONS
function blockUser() {
    if (!currentConversation) return;
    
    const conv = conversations[currentConversation];
    if (confirm(\Block \?\)) {
        alert(\\ has been blocked.\);
        closePrivacyPanel();
    }
}

function reportUser() {
    if (!currentConversation) return;
    
    const conv = conversations[currentConversation];
    if (confirm(\Report \?\)) {
        alert(\Report submitted. Thank you!\);
        closePrivacyPanel();
    }
}

function clearChat() {
    if (!currentConversation) return;
    
    const conv = conversations[currentConversation];
    if (confirm(\Clear all messages with \?\)) {
        conv.messages = [];
        saveConversations();
        renderMessages();
        closePrivacyPanel();
        alert('Chat history cleared.');
    }
}

// UTILITY
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✅ Cipher app.js loaded');
