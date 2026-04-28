# Data Flow Diagram

## Message Sending Flow

User Types Message
        ↓
Validates Input
        ↓
Encrypts (if enabled)
        ↓
Stores Locally
        ↓
Sends to Server (optional)
        ↓
Server Stores
        ↓
Broadcasts to Recipients
        ↓
Mark as "Sent"
        ↓
Show Checkmark

## Message Receiving Flow

Server Receives Message
        ↓
Validates Format
        ↓
Stores in Database
        ↓
Broadcasts to Recipients
        ↓
Client Receives
        ↓
Decrypts (if encrypted)
        ↓
Validates Signature
        ↓
Stores Locally
        ↓
Triggers Notification
        ↓
Display in Chat
        ↓
Mark as "Delivered"

## Local Storage Flow

Message Data
        ↓
Serialize to JSON
        ↓
Encrypt Locally (optional)
        ↓
Save to:
  - Browser IndexedDB (web)
  - File system (desktop)
  - AsyncStorage (mobile)
  - SecureStore (sensitive data)
        ↓
Data Persists Offline
        ↓
Syncs When Online

## Privacy Setting Toggle Flow

User Clicks Toggle
        ↓
Update Local Setting
        ↓
Save to Settings File
        ↓
Sync to Server (optional)
        ↓
Apply to New Messages
        ↓
Show Confirmation
        ↓
Badge Updates in UI

## Authentication Flow

User Opens App
        ↓
Check Local Auth Token
        ↓
If Valid: Load App
  If Expired: Refresh Token
    If Failed: Show Login
        ↓
User Enters Credentials
        ↓
Send to Server (HTTPS)
        ↓
Server Validates
        ↓
Return JWT Token
        ↓
Store Locally (Secure)
        ↓
Load App
        ↓
Show Conversations

## Offline Flow

User Sends Message (No Internet)
        ↓
Store in Local Queue
        ↓
Show "Pending" Status
        ↓
Internet Reconnects
        ↓
Send Queued Messages
        ↓
Update Status to "Sent"

## Notification Flow

Message Received
        ↓
Check Notification Settings
        ↓
Check if App in Focus
        ↓
If Minimized: Send Notification
        ↓
Play Sound (if enabled)
        ↓
Vibrate (if enabled)
        ↓
Show Badge
        ↓
User Taps Notification
        ↓
Open App to Chat

## Error Handling Flow

Operation Fails
        ↓
Log Error Locally
        ↓
Show User Message
        ↓
Offer Retry Option
        ↓
User Taps Retry
        ↓
Attempt Again
        ↓
Success: Update UI
  Failure: Show Error Detail
