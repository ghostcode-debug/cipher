// 🔐 CIPHER - JavaScript Application Logic

// =============================================
// DATA STORAGE & STATE
// =============================================

let currentConversation = null;
let conversations = {};
let settings = {};

// Sample conversations data
const sampleConversations = {
  alice: {
    name: "Alice",
    avatar: "👩",
    status: "online",
    messages: [
      {
        sender: "alice",
        text: "Hey! How are you?",
        time: "10:30 AM",
        status: "read",
      },
      {
        sender: "user",
        text: "Hi Alice! Doing great, thanks for asking!",
        time: "10:31 AM",
        status: "delivered",
      },
      {
        sender: "alice",
        text: "That's awesome! Want to grab coffee later?",
        time: "10:32 AM",
        status: "read",
      },
    ],
  },
  bob: {
    name: "Bob",
    avatar: "👨",
    status: "away",
    messages: [
      {
        sender: "user",
        text: "Hey Bob, did you finish the project?",
        time: "9:15 AM",
        status: "delivered",
      },
      {
        sender: "bob",
        text: "Almost done! Should be ready by tomorrow",
        time: "9:45 AM",
        status: "read",
      },
    ],
  },
  carol: {
    name: "Carol",
    avatar: "👩‍🦰",
    status: "offline",
    messages: [
      {
        sender: "carol",
        text: "Thanks for the help yesterday!",
        time: "8:00 AM",
        status: "read",
      },
      {
        sender: "user",
        text: "No problem! Anytime",
        time: "8:05 AM",
        status: "delivered",
      },
    ],
  },
};

// Default privacy settings
const defaultSettings = {
  encryption: false,
  readReceipts: true,
  selfDestruct: false,
  location: false,
  typing: true,
  preview: true,
  notifications: true,
};

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener("DOMContentLoaded", function () {
  loadSettings();
  loadConversations();
  initializeEventListeners();
  renderConversationsList();

  console.log("🔐 Cipher App Initialized");
});

function initializeEventListeners() {
  // Conversation selection
  const convList = document.getElementById("conversationsList");
  if (convList) {
    convList.addEventListener("click", selectConversation);
  }

  // Message sending
  const sendBtn = document.getElementById("sendBtn");
  const messageInput = document.getElementById("messageInput");

  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }

  if (messageInput) {
    messageInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Search
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", searchConversations);
  }

  // Privacy panel
  const settingsBtn = document.getElementById("settingsBtn");
  const closePanelBtn = document.getElementById("closePanelBtn");
  const privacyOverlay = document.getElementById("privacyOverlay");

  if (settingsBtn) {
    settingsBtn.addEventListener("click", openPrivacyPanel);
  }

  if (closePanelBtn) {
    closePanelBtn.addEventListener("click", closePrivacyPanel);
  }

  if (privacyOverlay) {
    privacyOverlay.addEventListener("click", function (e) {
      if (e.target === this) {
        closePrivacyPanel();
      }
    });
  }

  // Privacy toggles
  const encryptionToggle = document.getElementById("encryptionToggle");
  const readReceiptsToggle = document.getElementById("readReceiptsToggle");
  const selfDestructToggle = document.getElementById("selfDestructToggle");
  const locationToggle = document.getElementById("locationToggle");
  const typingToggle = document.getElementById("typingToggle");
  const previewToggle = document.getElementById("previewToggle");
  const notificationsToggle = document.getElementById("notificationsToggle");

  if (encryptionToggle)
    encryptionToggle.addEventListener("change", toggleSetting);
  if (readReceiptsToggle)
    readReceiptsToggle.addEventListener("change", toggleSetting);
  if (selfDestructToggle)
    selfDestructToggle.addEventListener("change", toggleSetting);
  if (locationToggle) locationToggle.addEventListener("change", toggleSetting);
  if (typingToggle) typingToggle.addEventListener("change", toggleSetting);
  if (previewToggle) previewToggle.addEventListener("change", toggleSetting);
  if (notificationsToggle)
    notificationsToggle.addEventListener("change", toggleSetting);

  // Action buttons
  const blockBtn = document.getElementById("blockBtn");
  const reportBtn = document.getElementById("reportBtn");
  const clearChatBtn = document.getElementById("clearChatBtn");

  if (blockBtn) blockBtn.addEventListener("click", blockUser);
  if (reportBtn) reportBtn.addEventListener("click", reportUser);
  if (clearChatBtn) clearChatBtn.addEventListener("click", clearChat);
}

// =============================================
// CONVERSATION MANAGEMENT
// =============================================

function loadConversations() {
  const stored = localStorage.getItem("cipher_conversations");
  if (stored) {
    try {
      conversations = JSON.parse(stored);
    } catch (e) {
      conversations = sampleConversations;
    }
  } else {
    conversations = JSON.parse(JSON.stringify(sampleConversations));
    saveConversations();
  }
}

function saveConversations() {
  localStorage.setItem("cipher_conversations", JSON.stringify(conversations));
}

function renderConversationsList() {
  const list = document.getElementById("conversationsList");
  if (!list) return;

  list.innerHTML = "";

  Object.keys(conversations).forEach((id) => {
    const conv = conversations[id];
    const item = createConversationItem(id, conv);
    list.appendChild(item);
  });
}

function createConversationItem(id, conv) {
  const div = document.createElement("div");
  div.className = "conversation-item";
  if (currentConversation === id) {
    div.classList.add("active");
  }
  div.dataset.id = id;

  const lastMessage =
    conv.messages && conv.messages.length > 0
      ? conv.messages[conv.messages.length - 1]
      : null;
  const preview = lastMessage
    ? lastMessage.text.substring(0, 30) + "..."
    : "No messages";
  const time = lastMessage ? lastMessage.time : "";

  div.innerHTML = `
        <div class="conversation-avatar">${conv.avatar}</div>
        <div class="conversation-info">
            <div class="conversation-name">${escapeHtml(conv.name)}</div>
            <div class="conversation-preview">${escapeHtml(preview)}</div>
        </div>
        <div class="conversation-time">${time}</div>
    `;

  return div;
}

function selectConversation(e) {
  const item = e.target.closest(".conversation-item");
  if (!item) return;

  currentConversation = item.dataset.id;

  // Update active state
  document.querySelectorAll(".conversation-item").forEach((i) => {
    i.classList.remove("active");
  });
  item.classList.add("active");

  // Load conversation
  loadConversationView();
}

function loadConversationView() {
  if (!currentConversation) return;

  const conv = conversations[currentConversation];
  if (!conv) return;

  // Update header
  const chatTitle = document.getElementById("chatTitle");
  const userStatus = document.getElementById("userStatus");

  if (chatTitle) chatTitle.textContent = conv.name;
  if (userStatus) {
    userStatus.textContent = conv.status;
    userStatus.className = "user-status " + conv.status;
  }

  // Update encryption badge
  const badge = document.getElementById("encryptionBadge");
  if (badge) {
    if (settings.encryption) {
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  }

  // Enable input
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  if (messageInput) messageInput.disabled = false;
  if (sendBtn) sendBtn.disabled = false;

  // Render messages
  renderMessages();
}

function renderMessages() {
  if (!currentConversation) return;

  const container = document.getElementById("messagesContainer");
  if (!container) return;

  const conv = conversations[currentConversation];
  if (!conv) return;

  container.innerHTML = "";

  if (!conv.messages || conv.messages.length === 0) {
    container.innerHTML =
      '<div class="no-conversation"><p>No messages yet. Start the conversation!</p></div>';
    return;
  }

  conv.messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className = "message " + (msg.sender === "user" ? "sent" : "received");

    const status = msg.sender === "user" ? " " + msg.status : "";

    div.innerHTML = `
            <div class="message-bubble">
                <span>${escapeHtml(msg.text)}</span>
            </div>
            <div class="message-time">${msg.time}${status}</div>
        `;

    container.appendChild(div);
  });

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function sendMessage() {
  if (!currentConversation) return;

  const input = document.getElementById("messageInput");
  if (!input) return;

  const text = input.value.trim();

  if (!text) return;

  // Add message to conversation
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const conv = conversations[currentConversation];
  if (!conv.messages) {
    conv.messages = [];
  }

  conv.messages.push({
    sender: "user",
    text: text,
    time: time,
    status: "sent",
  });

  saveConversations();
  input.value = "";

  // Simulate reply after 1 second
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
    "That sounds great!",
    "I agree with you",
    "Let me think about that",
    "Sounds good to me!",
    "I'll get back to you on that",
    "Thanks for letting me know",
    "Perfect!",
    "Absolutely!",
  ];

  const reply = replies[Math.floor(Math.random() * replies.length)];
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!conv.messages) {
    conv.messages = [];
  }

  conv.messages.push({
    sender: currentConversation,
    text: reply,
    time: time,
    status: "delivered",
  });

  saveConversations();
  renderMessages();
}

function searchConversations(e) {
  const query = e.target.value.toLowerCase();
  const items = document.querySelectorAll(".conversation-item");

  items.forEach((item) => {
    const name = item.querySelector(".conversation-name");
    const preview = item.querySelector(".conversation-preview");

    const nameText = name ? name.textContent.toLowerCase() : "";
    const previewText = preview ? preview.textContent.toLowerCase() : "";

    if (nameText.includes(query) || previewText.includes(query)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}

// =============================================
// PRIVACY SETTINGS
// =============================================

function loadSettings() {
  const stored = localStorage.getItem("cipher_settings");
  if (stored) {
    try {
      settings = JSON.parse(stored);
    } catch (e) {
      settings = JSON.parse(JSON.stringify(defaultSettings));
    }
  } else {
    settings = JSON.parse(JSON.stringify(defaultSettings));
    saveSettings();
  }

  applySettings();
}

function saveSettings() {
  localStorage.setItem("cipher_settings", JSON.stringify(settings));
}

function applySettings() {
  const toggleIds = [
    "encryptionToggle",
    "readReceiptsToggle",
    "selfDestructToggle",
    "locationToggle",
    "typingToggle",
    "previewToggle",
    "notificationsToggle",
  ];

  toggleIds.forEach((id) => {
    const toggle = document.getElementById(id);
    if (toggle) {
      const setting = id.replace("Toggle", "");
      toggle.checked = settings[setting] || false;
    }
  });
}

function toggleSetting(e) {
  const id = e.target.id;
  const setting = id.replace("Toggle", "");

  settings[setting] = e.target.checked;
  saveSettings();

  // Update encryption badge if needed
  if (setting === "encryption") {
    loadConversationView();
  }

  console.log("Setting changed:", setting, "=", e.target.checked);
}

function openPrivacyPanel() {
  const panel = document.getElementById("privacyPanel");
  const overlay = document.getElementById("privacyOverlay");

  if (panel) panel.classList.add("open");
  if (overlay) overlay.classList.add("open");
}

function closePrivacyPanel() {
  const panel = document.getElementById("privacyPanel");
  const overlay = document.getElementById("privacyOverlay");

  if (panel) panel.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
}

// =============================================
// ACTION BUTTONS
// =============================================

function blockUser() {
  if (!currentConversation) return;

  const conv = conversations[currentConversation];
  if (confirm(`Block ${conv.name}?`)) {
    alert(`${conv.name} has been blocked.`);
    closePrivacyPanel();
  }
}

function reportUser() {
  if (!currentConversation) return;

  const conv = conversations[currentConversation];
  if (confirm(`Report ${conv.name}?`)) {
    alert(`Report submitted. Thank you for helping keep Cipher safe!`);
    closePrivacyPanel();
  }
}

function clearChat() {
  if (!currentConversation) return;

  const conv = conversations[currentConversation];
  if (confirm(`Clear all messages with ${conv.name}? This cannot be undone.`)) {
    conv.messages = [];
    saveConversations();
    renderMessages();
    closePrivacyPanel();
    alert("Chat history cleared.");
  }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Log that app is running
console.log("🔐 Cipher - Privacy-Focused Messaging");
console.log("Version 1.0.0");
console.log("All data stored locally. No tracking. No analytics.");
