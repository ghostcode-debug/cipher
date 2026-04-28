# Dependencies List

## Web Version Dependencies

### Runtime Dependencies
- None! (Zero dependencies)
- Uses browser APIs only
- No npm packages required

### Dev Dependencies (Optional)
- webpack (optional bundler)
- webpack-dev-server (optional dev server)
- prettier (code formatter)
- eslint (code linter)
- jest (testing)
- cypress (e2e testing)

### Browser APIs Used
- Fetch API (network requests)
- LocalStorage (data storage)
- IndexedDB (large data storage)
- ServiceWorker (offline support)
- WebSocket (real-time, optional)
- Notification API (notifications)
- Geolocation API (location)
- Camera API (media capture)

---

## Desktop Version Dependencies

### Runtime Dependencies
- electron@^24.0.0
- electron-squirrel-startup@^1.1.1
- react@^18.2.0
- react-dom@^18.2.0
- electron-updater@^5.0.0

### Dev Dependencies
- electron-builder@^24.0.0
- webpack@^5.0.0
- webpack-cli@^5.0.0
- webpack-dev-server@^4.0.0
- @babel/core@^7.0.0
- @babel/preset-react@^7.0.0
- babel-loader@^9.0.0
- css-loader@^6.0.0
- style-loader@^3.0.0
- prettier@^2.8.0
- eslint@^8.0.0
- jest@^29.0.0

### Optional Dependencies
- electron-notarize (macOS code signing)
- electron-publisher-s3 (S3 updates)
- typeorm (database ORM)
- sqlite3 (local database)

---

## Mobile Version Dependencies

### Runtime Dependencies
- react@^18.2.0
- react-native@^0.72.0
- expo@^49.0.0
- expo-secure-store@^11.0.0
- @react-native-async-storage/async-storage@^1.17.0
- expo-notifications@^0.16.0
- expo-camera@^13.4.0
- expo-media-library@^15.2.0
- expo-location@^15.1.0
- expo-local-authentication@^13.4.0
- expo-device@^15.1.0

### Dev Dependencies
- @babel/core@^7.0.0
- @types/react@^18.0.0
- @types/react-native@^0.72.0
- prettier@^2.8.0
- eslint@^8.0.0
- jest@^29.0.0
- detox@^20.0.0
- detox-cli@^20.0.0

### Optional Dependencies
- react-native-camera (advanced camera)
- react-native-video (video playback)
- react-native-sound (audio playback)
- react-native-firebase (Firebase integration)

---

## Backend Dependencies (Optional, for Future)

### Runtime Dependencies
- express@^4.18.0
- cors@^2.8.5
- helmet@^7.0.0
- dotenv@^16.0.0
- jsonwebtoken@^9.0.0
- bcrypt@^5.0.0
- pg@^8.0.0 (PostgreSQL)
- mongodb@^5.0.0 (MongoDB)
- socket.io@^4.5.0 (real-time)
- axios@^1.0.0 (HTTP client)
- joi@^17.0.0 (validation)
- winston@^3.8.0 (logging)

### Dev Dependencies
- nodemon@^2.0.0
- jest@^29.0.0
- supertest@^6.3.0
- prettier@^2.8.0
- eslint@^8.0.0

### Optional Dependencies
- typeorm@^0.3.0 (ORM)
- sequelize@^6.0.0 (ORM)
- passport@^0.6.0 (authentication)
- stripe@^11.0.0 (payments)
- sendgrid@^7.7.0 (email)

---

## Security Libraries

### Encryption
- tweetnacl@^1.0.3 (E2E encryption)
- crypto-js@^4.1.0 (encryption utilities)
- libsodium.js@^0.7.0 (advanced crypto)

### Hashing
- bcrypt@^5.0.0 (password hashing)
- argon2@^0.30.0 (password hashing)

### Validation
- joi@^17.0.0 (schema validation)
- zod@^3.0.0 (type validation)
- validator@^13.0.0 (input sanitization)

---

## Build Tools

### Module Bundlers
- webpack@^5.0.0 (JavaScript bundler)
- parcel@^2.0.0 (alternative bundler)
- rollup@^3.0.0 (library bundler)

### Transpilers
- @babel/core@^7.0.0 (ES6+ to ES5)
- typescript@^5.0.0 (type checking)

### Task Runners
- npm scripts (built-in)
- grunt@^1.0.0 (task runner)
- gulp@^4.0.0 (task runner)

---

## Testing Libraries

### Unit Testing
- jest@^29.0.0 (test framework)
- mocha@^10.0.0 (test framework)
- chai@^4.0.0 (assertion library)

### E2E Testing
- cypress@^12.0.0 (web e2e)
- playwright@^1.0.0 (web e2e)
- detox@^20.0.0 (mobile e2e)
- appium@^2.0.0 (mobile automation)

### Code Coverage
- istanbul@^0.4.0 (coverage)
- nyc@^15.0.0 (coverage reporter)

---

## Code Quality

### Linting
- eslint@^8.0.0 (JavaScript linting)
- prettier@^2.8.0 (code formatting)
- stylelint@^14.0.0 (CSS linting)

### Type Checking
- typescript@^5.0.0 (type safety)
- flow@^0.210.0 (alternative type checker)

### Documentation
- jsdoc@^4.0.0 (documentation generation)
- typedoc@^0.23.0 (TypeScript docs)

---

## Dependency Management

### Package Managers
- npm@^8.0.0 (comes with Node.js)
- yarn@^3.0.0 (alternative)
- pnpm@^8.0.0 (alternative)

### Lock Files
- package-lock.json (npm lock file)
- yarn.lock (yarn lock file)
- pnpm-lock.yaml (pnpm lock file)

### Audit & Security
- npm audit (built-in security audit)
- snyk@^1.0.0 (vulnerability scanning)
- dependabot (automatic updates)

---

## Size & Performance

### Web Bundle
- Uncompressed: ~29 KB
- Gzipped: ~8 KB
- No external dependencies
- Load time: <1 second

### Desktop Bundle
- Electron: ~150 MB
- Uncompressed: ~200 MB
- Includes Chromium
- All dependencies included

### Mobile Bundle
- APK (Android): ~75 MB
- IPA (iOS): ~80 MB
- Includes React Native
- All dependencies included

---

## Update Strategy

### Frequency
- Major versions: Quarterly review
- Minor versions: Monthly updates
- Patch versions: As needed (security)
- Security updates: Within 48 hours

### Testing
- Test all updates before deployment
- Use npm outdated to check updates
- Review breaking changes in changelogs
- Keep lock files up to date

---

## Deprecated Libraries

These are NOT used (outdated):
- jQuery (not needed with modern JS)
- Bootstrap 3 (use CSS Grid/Flexbox)
- Lodash (use native ES6)
- Moment.js (use native Date or date-fns)

---

## Recommended Reading

- npm documentation: https://docs.npmjs.com
- Dependency licenses: Choose permissive licenses
- Security: Regular npm audit
- Performance: Bundle size analysis
