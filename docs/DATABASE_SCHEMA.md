# Database Schema

## Local Storage (JSON Format)

### Messages Collection
File: messages_[conversationId].json

{
  "messages_alice": [
    {
      "id": "msg_1",
      "sender": "alice",
      "text": "Hello!",
      "timestamp": "2025-01-01T10:00:00Z",
      "encrypted": false,
      "status": "delivered",
      "read_at": null,
      "attachments": []
    }
  ]
}

### Settings
File: settings.json

{
  "theme": "dark",
  "encryption": true,
  "readReceipts": true,
  "notifications": true,
  "typing": true,
  "soundEnabled": true,
  "vibration": true,
  "autoStartMinimized": false,
  "language": "en",
  "fontSize": "medium"
}

### User Preferences
File: user_preferences.json

{
  "lastActiveConversation": "alice",
  "windowSize": {
    "width": 1200,
    "height": 800
  },
  "sidebarCollapsed": false,
  "notifications": {
    "desktop": true,
    "sound": true,
    "preview": true
  }
}

## Backend Database (PostgreSQL)

### Users Table

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  public_key TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

### Conversations Table

CREATE TABLE conversations (
  conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES users(user_id),
  user_id_2 UUID NOT NULL REFERENCES users(user_id),
  name VARCHAR(255),
  type VARCHAR(50) DEFAULT 'dm',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

### Messages Table

CREATE TABLE messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(conversation_id),
  sender_id UUID NOT NULL REFERENCES users(user_id),
  content TEXT NOT NULL,
  metadata JSONB,
  status VARCHAR(50) DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  expires_at TIMESTAMP,
  deleted_at TIMESTAMP
);

### Message Attachments Table

CREATE TABLE message_attachments (
  attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(message_id),
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### Settings Table

CREATE TABLE settings (
  setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  key VARCHAR(255) NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, key)
);

### Encryption Keys Table

CREATE TABLE encryption_keys (
  key_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  key_type VARCHAR(50),
  key_material TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

## Database Indexes

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

CREATE INDEX idx_conversations_users ON conversations(user_id_1, user_id_2);
CREATE INDEX idx_conversations_created ON conversations(created_at);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_settings_user ON settings(user_id);

## Data Relationships

users
  ├── conversations (1 to many)
  │   ├── messages (1 to many)
  │   │   └── attachments (1 to many)
  │   └── settings (1 to many)
  └── encryption_keys (1 to many)

## Backup Strategy

### Local
- Desktop: Daily backup to user folder
- Mobile: Automatic iCloud/Google backup
- Web: Browser auto-backup (IndexedDB)

### Server (Optional)
- Incremental: Every 6 hours
- Full: Weekly
- Retention: 30 days
- Encryption: At-rest

## Data Retention

- Active messages: Forever
- Deleted messages: 30 days (soft delete)
- User account: Forever until deleted
- Logs: 90 days
- Backups: 30 days after deletion
