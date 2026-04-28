# Requirements Document

## Functional Requirements
- FR-1: User shall be able to send messages
- FR-2: System shall display message history
- FR-3: App shall show encryption status
- FR-4: User shall toggle read receipts
- FR-5: System shall support offline mode
- FR-6: User shall be able to block contacts
- FR-7: Messages shall auto-delete if configured
- FR-8: User shall receive push notifications

## Non-Functional Requirements
- NFR-1: Load time < 1 second
- NFR-2: Memory usage < 50 MB (desktop)
- NFR-3: Battery impact < 5% per hour (mobile)
- NFR-4: 60 FPS animations
- NFR-5: WCAG 2.1 AA accessibility
- NFR-6: Support 10,000+ messages per conversation
- NFR-7: End-to-end encryption (optional)
- NFR-8: Work offline with local storage

## Security Requirements
- SEC-1: No plaintext passwords stored
- SEC-2: All network traffic HTTPS only
- SEC-3: Encryption keys never sent to server
- SEC-4: No tracking/telemetry
- SEC-5: Regular security audits
- SEC-6: Vulnerability disclosure program

## Platform Requirements

### Web
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers
- <1s load time

### Desktop
- Windows 7+
- macOS 10.13+
- Ubuntu 14.04+
- <2s startup time
- <150 MB disk space

### Mobile
- iOS 13+
- Android 8+
- <100 MB app size
- Push notifications
- Camera integration
