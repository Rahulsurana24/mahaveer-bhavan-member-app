# Mahaveer Bhavan - Complete Implementation Guide

## 🎯 Project Overview

This is a comprehensive multi-platform Jain community management system with:
- **Member Portal** (Android, iOS)
- **Admin Portal** (Android, iOS, Web)
- **Backend** (Supabase - fully configured)

**Current Status:** Phase 1 Foundation - 40% Complete

## ✅ Completed Work

### Phase 1: Foundation (Partial)
- [x] Database migrations (8 new tables + updates)
- [x] Super admin initialization (rahulsuranat@gmail.com)
- [x] Theme system updated (Teal + Dark Mode)
- [x] Currency utilities created (₹ formatting)
- [x] ChangePasswordScreen implemented (both apps)
- [x] Folder structure organized (android/, ios/, web/, docs/)

### Database Tables
- [x] ai_conversations
- [x] item_distributions
- [x] gallery_likes (updated)
- [x] gallery_comments (updated)
- [x] calendar_holidays (exists)
- [x] calendar_overrides (exists)
- [x] system_settings (updated)
- [x] audit_logs (updated)

## 🚧 Remaining Work

### PHASE 1: Foundation (60% Complete)

#### 1.7 Member App Navigation Setup
**Location:** `android/member/src/navigation/`

**Files to Create:**
- `AuthNavigator.js` - Login, Register, ChangePassword, ForgotPassword
- `MainNavigator.js` - Bottom Tab Navigator
- `index.js` - Root navigator with auth state management

**Bottom Tab Structure:**
```javascript
// 5 Tabs
1. Home (icon: home) - DashboardHome
2. Gallery (icon: images) - GalleryScreen
3. Messages (icon: chatbubble) - MessagesScreen
4. Events (icon: calendar) - EventsListScreen
5. More (icon: ellipsis-horizontal) - MoreMenuScreen
```

**Dependencies:** `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`

#### 1.8 Admin App Navigation Setup
**Location:** `android/admin/src/navigation/`

**Bottom Tab Structure:**
```javascript
// 5 Tabs
1. Dashboard (icon: grid) - DashboardScreen
2. Members (icon: people) - MembersListScreen
3. Events (icon: calendar) - EventsListScreen
4. Scanner (icon: scan) - ScannerScreen
5. More (icon: menu) - MoreMenuScreen
```

#### 1.9 App.js Auth Routing Logic
**Location:** `android/member/App.js`, `android/admin/App.js`

**Auth Flow:**
```
1. Check AsyncStorage for session
2. If session exists:
   - Fetch user profile from user_profiles
   - Check needs_password_change
   - If true → ChangePasswordScreen (forced)
   - If false → Check role
     - member → MainApp (member)
     - admin/super_admin/etc → MainApp (admin)
3. If no session → LoginScreen
```

#### 1.10 iOS Project Setup
**Location:** `ios/member/`, `ios/admin/`

**Steps:**
1. Run `npx react-native init` for iOS
2. Install CocoaPods dependencies
3. Configure Info.plist permissions:
   - NSCameraUsageDescription
   - NSPhotoLibraryUsageDescription
   - NSMicrophoneUsageDescription
   - NSPhotoLibraryAddUsageDescription
4. Copy `src/` folders from Android apps
5. Update imports for iOS-specific modules

#### 1.11 Web Admin Interface
**Location:** `web/admin/`

**Tech Stack:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (dark mode, teal theme)
- React Router
- React Query
- Supabase JS Client
- xlsx library (Excel import/export)

**Project Structure:**
```
web/admin/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── DataImport.tsx
│   │   ├── DataExport.tsx
│   │   ├── Reports.tsx
│   │   └── AuditLogs.tsx
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── styles/
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

### PHASE 2: Member App Implementation (20+ Screens)

#### 2.1 Registration Flow (Priority: HIGH)
**Location:** `android/member/src/screens/Auth/RegisterScreen.js`

**4-Step Multi-Form:**
1. **Step 1:** Basic Info (Name, DOB, Gender, Blood Group)
2. **Step 2:** Contact (Mobile, WhatsApp, Email, Address)
3. **Step 3:** Membership (Type, Emergency Contact)
4. **Step 4:** Photo Upload (with cropping)

**Key Features:**
- Progress indicator at top (1/4, 2/4, etc.)
- Form validation on each step
- Next/Back buttons
- Photo crop using `react-native-image-crop-picker`
- Upload to Supabase Storage `profile-photos/`
- Generate Member ID using DB function
- Send welcome email

**Dependencies:**
- `react-native-image-picker`
- `react-native-image-crop-picker`

#### 2.2 Dashboard Enhancement
**Location:** `android/member/src/screens/Member/DashboardHome.js` (update existing)

**Sections to Add:**
1. ID Card Preview (tappable → opens IDCardScreen)
2. Quick Stats Row (3 cards)
3. Quick Actions Grid (4 items)
4. Upcoming Events (horizontal scroll)
5. Recent Notifications

#### 2.3 Digital ID Card
**Location:** `android/member/src/screens/Member/IDCardScreen.js`

**Features:**
- Full-screen modal with card design
- Member photo (large, circular)
- QR code generated from `MEMBER:{memberID}:{name}`
- Download as PDF (react-native-pdf-lib)
- Download as JPG (react-native-view-shot)
- Share functionality

**Dependencies:**
- `react-native-pdf-lib`
- `react-native-view-shot`
- `react-native-qrcode-svg`

#### 2.4 Gallery / Social Feed
**Location:** `android/member/src/screens/Member/GalleryScreen.js`

**Features:**
- Instagram-style feed
- Like/Comment/Share on posts
- Upload media (pending moderation)
- Infinite scroll
- Real-time updates (Supabase Realtime)

**Screens:**
- `GalleryScreen.js` - Main feed
- `UploadMediaScreen.js` - Upload flow
- `CommentsScreen.js` - Comments modal
- `PhotoViewerScreen.js` - Full-screen photo viewer

**Dependencies:**
- `react-native-fast-image`

#### 2.5 Events & Trips
**Location:** `android/member/src/screens/Member/`

**Screens:**
- `EventsListScreen.js` - List with tabs (Events, Trips)
- `EventDetailScreen.js` - Event details with registration
- `RegistrationFormScreen.js` - Multi-field form
- `RegistrationSuccessScreen.js` - Success with QR code

**Key Features:**
- Dynamic pricing display based on membership type
- Payment integration (Razorpay)
- Logistics display (room, seat, PNR) if assigned
- Download itinerary PDF

**Dependencies:**
- `react-native-razorpay`

#### 2.6 Profile & Settings
**Location:** `android/member/src/screens/Member/`

**Screens:**
- `ProfileScreen.js` - View profile
- `EditProfileScreen.js` - Edit profile
- `NotificationSettingsScreen.js` - Notification preferences
- `LanguageScreen.js` - Language selector (EN/HI)

---

### PHASE 3: Social & Communication Features

#### 3.1 Messaging System
**Location:** `android/member/src/screens/Member/`

**Screens:**
- `MessagesScreen.js` - Conversation list (WhatsApp style)
- `ChatScreen.js` - Chat interface
- `ContactPickerScreen.js` - Select contact for new chat

**Message Types:**
1. Text messages
2. Image messages
3. Video messages
4. Audio messages (voice notes with waveform)
5. Document messages

**Key Features:**
- Real-time delivery (Supabase Realtime)
- Read receipts (double checkmark)
- Typing indicators
- Message reactions (6 emojis)
- Swipe to reply

**Dependencies:**
- `react-native-audio-waveform`
- `react-native-document-picker`
- `react-native-fs`

#### 3.2 VoIP Calling
**Location:** `android/member/src/screens/Member/CallScreen.js`

**Features:**
- Voice calls
- Video calls
- Call controls (mute, speaker, end)
- Incoming call notifications

**Dependencies:**
- `@videosdk.live/react-native-sdk` OR `agora-react-native`
- `react-native-callkeep`

**Backend:**
- Create edge function for call session management
- Generate unique room IDs
- Handle call signaling

#### 3.3 AI Assistant
**Location:** `android/member/src/screens/Member/AIAssistantScreen.js`

**Features:**
- Chat interface with Dharma AI
- Quick suggestion bubbles
- Chat history (load from `ai_conversations`)
- Rate limiting (20 req/hour)
- Hindi & English support

**Backend:**
- Already implemented: `supabase/functions/jainism-chat/`
- Uses OpenRouter API (Claude 3.5 Sonnet)

---

### PHASE 4: Admin App Implementation (15+ Screens)

#### 4.1 Dashboard
**Location:** `android/admin/src/screens/Admin/DashboardScreen.js`

**Features:**
- Key metrics cards (4 metrics)
- Recent activity feed
- Quick actions
- Upcoming events widget
- Pull-to-refresh

#### 4.2 Members Management
**Location:** `android/admin/src/screens/Admin/`

**Screens:**
- `MembersListScreen.js` - Searchable list with filters
- `MemberDetailScreen.js` - Profile, Activity, Audit tabs
- `CreateMemberScreen.js` - Admin member creation
- `EditMemberScreen.js` - Edit member details

**Features:**
- Search by name, ID, phone, email
- Filter by membership type
- Sort options
- Swipe actions (edit, deactivate)
- Bulk operations

#### 4.3 Admin User Management
**Location:** `android/admin/src/screens/Admin/`

**Screens:**
- `AdminUsersScreen.js` - List of admin users
- `CreateAdminScreen.js` - Create admin with role/permissions
- `EditAdminScreen.js` - Edit admin details

**Permissions:** Only Super Admin can access

#### 4.4 Events & Trips Management
**Location:** `android/admin/src/screens/Admin/`

**Screens:**
- `EventsListScreen.js` - Admin event list
- `CreateEventScreen.js` - Multi-section form
- `EditEventScreen.js` - Edit event
- `RegistrationsListScreen.js` - View registrations
- `TravelAssignmentsScreen.js` - Assign logistics

**Features:**
- Create events with dynamic pricing
- Target audience selection
- Bulk registration actions
- CSV import for assignments

#### 4.5 Scanner / Attendance
**Location:** `android/admin/src/screens/Admin/ScannerScreen.js`

**Features:**
- Live camera QR scanning
- Attendance mode (mark attendance)
- Distribution mode (track item distribution)
- Manual entry option
- Scan history

**Dependencies:**
- `react-native-vision-camera`
- `react-native-qrcode-scanner` OR `vision-camera-code-scanner`

#### 4.6 Gallery Moderation
**Location:** `android/admin/src/screens/Admin/GalleryModerationScreen.js`

**Features:**
- Pending review queue
- Full-screen review modal
- Approve/Reject with reason
- Bulk actions
- Keyboard shortcuts (A for approve, R for reject)

#### 4.7 Calendar Management
**Location:** `android/admin/src/screens/Admin/CalendarScreen.js`

**Features:**
- Month view calendar (react-native-calendars)
- Mark holidays with notifications
- Override Upavas/Biyashna schedule
- Day detail sheet

**Dependencies:**
- `react-native-calendars`

#### 4.8 System Settings
**Location:** `android/admin/src/screens/Admin/SystemSettingsScreen.js`

**Features:**
- Organization branding (name, logo, color)
- Contact information
- Payment gateway config (Razorpay)
- Notification settings
- App behavior settings

**Real-time Updates:**
- When branding changes → broadcast to all apps via Supabase Realtime
- Apps reload settings immediately

---

### PHASE 5: Web Admin Interface

#### 5.1 Data Import
**Location:** `web/admin/src/pages/DataImport.tsx`

**Features:**
- Upload CSV/Excel files
- Validate rows (show errors)
- Import members, events, donations
- Download error reports
- Progress indicator

**Library:** `xlsx` for Excel parsing

#### 5.2 Data Export
**Location:** `web/admin/src/pages/DataExport.tsx`

**Features:**
- Filter by date, type, status
- Column selection
- Export as CSV or XLSX
- Pre-built reports (quick export buttons)

#### 5.3 Reports Dashboard
**Location:** `web/admin/src/pages/Reports.tsx`

**Charts:**
1. Member growth (line chart)
2. Financial report (donations over time)
3. Event attendance (bar chart)
4. Gallery engagement (stats)

**Library:** `recharts` for data visualization

#### 5.4 Audit Logs
**Location:** `web/admin/src/pages/AuditLogs.tsx`

**Features:**
- Filterable table (date, admin, action type)
- Sortable columns
- Pagination (50 rows/page)
- Export logs (CSV)

---

### PHASE 6: Cross-Cutting Features

#### 6.1 Push Notifications
**Setup:** Firebase Cloud Messaging (FCM)

**Implementation:**
1. Install `@react-native-firebase/app` and `@react-native-firebase/messaging`
2. Configure FCM for both Android and iOS
3. Get FCM token on app launch → store in `user_profiles.fcm_token`
4. Handle foreground, background, and quit state notifications
5. Setup notification routing based on type

**Notification Types:**
- Event reminders
- Message notifications
- Gallery updates (approved/rejected)
- Admin notifications
- System notifications

**Backend:**
- Edge function: `supabase/functions/notification-system/`
- Send via Firebase Admin SDK

#### 6.2 Offline Support
**Library:** `@react-native-community/netinfo`

**Features:**
- Detect connection status
- Show offline banner
- Queue failed operations in AsyncStorage
- Sync on reconnect
- Cache API responses (SWR or React Query)

#### 6.3 Payment Processing
**Library:** `react-native-razorpay`

**Flow:**
1. User selects online payment
2. Backend creates Razorpay order
3. Open Razorpay checkout
4. Handle success/failure
5. Verify signature on backend
6. Insert payment record

**Backend:**
- Edge function: `supabase/functions/payment-processing/`
- Already partially implemented

#### 6.4 Localization
**Library:** `react-i18next`

**Setup:**
1. Create translation files:
   - `locales/en.json`
   - `locales/hi.json`
2. Initialize i18n
3. Use `t()` function in all screens
4. Language selector in More → Settings

**Content:**
- Static UI fully translated
- Dynamic content (event titles) stored in original language
- AI Assistant already supports both languages

#### 6.5 Error Tracking
**Library:** `@sentry/react-native`

**Setup:**
1. Install and initialize Sentry
2. Auto-capture unhandled errors
3. Attach user context (ID, role)
4. Track screen views

**Analytics:** Firebase Analytics
- Track screen views
- Track key user actions
- Custom events

---

### PHASE 7: Testing & Deployment

#### 7.1 Manual Testing Checklist

**Member App:**
- [ ] Registration flow (all 4 steps)
- [ ] Login and password change
- [ ] Dashboard data loads
- [ ] ID card displays and downloads
- [ ] Gallery feed, like, comment
- [ ] Upload media (check moderation queue)
- [ ] Messages (text, image, voice, video)
- [ ] VoIP calls (voice and video)
- [ ] Events list, register, payment
- [ ] AI Assistant chat
- [ ] Profile editing
- [ ] Logout and re-login

**Admin App:**
- [ ] Login as admin
- [ ] Dashboard metrics
- [ ] Create member
- [ ] Create admin user
- [ ] Create event
- [ ] View registrations
- [ ] Assign logistics
- [ ] Scanner (attendance, distribution)
- [ ] Gallery moderation
- [ ] Calendar (mark holiday)
- [ ] System settings (change branding)

**Web Admin:**
- [ ] Login
- [ ] Import members (CSV)
- [ ] Export data
- [ ] View reports
- [ ] Audit logs

#### 7.2 Deployment

**Android:**
1. Update version in `build.gradle`
2. Build APK/AAB: `./gradlew assembleRelease` / `bundleRelease`
3. Upload to Google Play Console

**iOS:**
1. Update version in `Info.plist`
2. Archive in Xcode
3. Distribute to App Store Connect

**Web:**
1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Set environment variables

---

## 📦 Dependencies Summary

### React Native (Both Apps)

```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "@react-navigation/stack": "^6.x",
  "@react-native-firebase/app": "^18.x",
  "@react-native-firebase/messaging": "^18.x",
  "react-native-image-picker": "^5.x",
  "react-native-image-crop-picker": "^0.40.x",
  "react-native-vision-camera": "^3.x",
  "react-native-pdf-lib": "^1.x",
  "react-native-view-shot": "^3.x",
  "@videosdk.live/react-native-sdk": "^1.x",
  "react-native-audio-waveform": "^1.x",
  "react-native-razorpay": "^2.x",
  "react-native-calendars": "^1.x",
  "react-native-fast-image": "^8.x",
  "react-native-qrcode-svg": "^6.x",
  "@react-native-community/netinfo": "^11.x",
  "react-i18next": "^13.x",
  "@sentry/react-native": "^5.x",
  "react-native-fs": "^2.x",
  "react-native-document-picker": "^9.x",
  "react-native-vector-icons": "^10.x",
  "@supabase/supabase-js": "^2.x"
}
```

### Web Admin

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "@tanstack/react-query": "^5.x",
  "@supabase/supabase-js": "^2.x",
  "xlsx": "^0.18.x",
  "recharts": "^2.x",
  "tailwindcss": "^3.x",
  "vite": "^5.x"
}
```

---

## 🔐 Security Considerations

1. **API Keys:**
   - Supabase keys in environment variables
   - Razorpay keys encrypted in database
   - OpenRouter key in Supabase secrets

2. **Authentication:**
   - JWT tokens auto-refresh
   - Row Level Security (RLS) on all tables
   - Force password change on first login

3. **Permissions:**
   - Check at UI, navigation, and API layers
   - Role-based access control
   - Audit logging for all sensitive actions

4. **Data Protection:**
   - Sensitive data encrypted
   - File uploads validated
   - Rate limiting on APIs

---

## 📊 Database Schema Reference

**Core Tables:**
- `members` (id TEXT) - Member profiles
- `user_profiles` (auth_id UUID) - Auth profiles with roles
- `user_roles` (id UUID) - Role definitions
- `events` (id UUID) - Events and trips
- `event_registrations` - Event signups
- `trip_assignments` - Logistics assignments
- `gallery_posts` - Gallery items
- `gallery_likes` - Post likes
- `gallery_comments` - Post comments
- `messages` - Chat messages
- `notifications` - Push notifications
- `donations` - Donation records
- `ai_conversations` - AI chat history
- `item_distributions` - Item tracking
- `calendar_holidays` - Marked holidays
- `calendar_overrides` - Upavas/Biyashna overrides
- `system_settings` - Global config
- `audit_logs` - Activity logs

---

## 🎨 Design System

**Colors:**
- Primary: #0F766E (Teal)
- Background: #0A0A0A (Dark)
- Text: #FFFFFF (White)

**Typography:**
- SF Pro (iOS), Roboto (Android)
- Sizes: 12, 14, 16, 20, 24, 28, 34

**Spacing:**
- Base: 8px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px

**Currency:**
- Symbol: ₹
- Format: Indian locale (lakhs, crores)

---

## 🚀 Next Steps

1. **Complete Phase 1:**
   - Setup navigation for both apps
   - Update App.js with auth routing
   - Initialize iOS projects
   - Create web admin scaffold

2. **Phase 2 - Member Screens:**
   - Start with Registration (highest priority)
   - Then Dashboard, ID Card
   - Events and Profile

3. **Phase 3 - Communication:**
   - Messaging system
   - VoIP calling
   - AI Assistant

4. **Phase 4 - Admin:**
   - Dashboard and Members
   - Events management
   - Scanner and Moderation

5. **Phase 5 - Web:**
   - Data import/export
   - Reports
   - Audit logs

6. **Phase 6 - Cross-Cutting:**
   - Push notifications
   - Offline support
   - Payments
   - Localization

7. **Phase 7 - Launch:**
   - Testing
   - Deployment
   - Monitoring

---

## 📞 Support

**Super Admin:**
- Email: rahulsuranat@gmail.com
- Password: 9480413653 (change on first login)

**Database:**
- URL: juvrytwhtivezeqrmtpq.supabase.co
- Connection: postgresql://postgres:s3GVV2zOmFjT2aH4@db.juvrytwhtivezeqrmtpq.supabase.co:5432/postgres

**APIs:**
- OpenRouter: Configured in edge functions
- Supabase: Environment variables set

---

**Last Updated:** October 25, 2025
**Status:** Foundation 40% Complete
**Estimated Completion:** 15-20 weeks for full implementation
