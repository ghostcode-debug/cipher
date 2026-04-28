# System Architecture

## Overview
## Components

### Web Version
- HTML5 + CSS3 + JavaScript
- Single-page application
- Works in all modern browsers
- No installation needed
- Direct access via URL

### Desktop Version (Electron)
- Cross-platform (Windows, macOS, Linux)
- Native OS integration
- React for UI
- Node.js for backend logic
- File system access
- System tray integration

### Mobile Version (React Native)
- iOS and Android support
- Expo for simplified development
- Native look and feel
- Camera and media access
- Biometric authentication ready

### Encryption Layer
- Optional end-to-end encryption
- TweetNaCl.js library
- AES-256-GCM algorithm
- X25519 key exchange
- Keys stored locally only

### Backend (Optional)
- Node.js + Express.js
- PostgreSQL or MongoDB
- WebSocket for real-time
- File storage (AWS S3 or similar)
- Authentication (JWT or OAuth)

### Data Storage
- Local: JSON files (desktop), AsyncStorage (mobile)
- Server: Database (PostgreSQL/MongoDB)
- Encryption: At-rest and in-transit
- Backup: User controlled

## Data Flow

1. User sends message
2. Encrypt locally (if enabled)
3. Store in local storage
4. Send to server (optional)
5. Server broadcasts to recipient
6. Recipient receives and decrypts
7. Store in local storage
8. Notify user

## Security Model

- No passwords stored plaintext
- HTTPS/TLS 1.3 for all communication
- Encryption keys never leave device
- No tracking or telemetry
- GDPR and CCPA compliant
- Regular security audits
