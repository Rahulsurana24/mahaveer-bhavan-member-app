# Research

## Summary
The Mahaveer Bhavan codebase is a React Native mobile ecosystem (v0.73.2) with member and admin apps, sharing a Supabase backend. The project was recently restructured from a React web app to React Native, establishing a solid foundation with Android support, comprehensive database schema (19 tables), and 9 backend edge functions. However, most UI implementation is pending: the member app has only 2 screens (Login, Dashboard), and the admin app has no screens yet. Key gaps include iOS support, web admin interface, dark mode/teal theming, navigation/routing, and the majority of screens specified in the detailed plan (registration, ID cards, messaging UI, events, gallery, admin tools).

## Repository: mahaveer-bhavan

### Project Structure Overview
**Location:** `/workspace/cmh6fofaa00b2psi3k3ds3j56/mahaveer-bhavan`

**Key directories**
- `mahaveer-bhavan/member-app/` - React Native app for community members (RN 0.73.2)
- `mahaveer-bhavan/admin-app/` - React Native app for administrators (RN 0.73.2)
- `mahaveer-bhavan/shared/` - Shared TypeScript types, constants, and utilities
- `mahaveer-bhavan/supabase/functions/` - Backend edge functions
- `mahaveer-bhavan/docs/` - Documentation
- `mahaveer-bhavan/scripts/` - Setup and diagnostic scripts

**How it works**
- Both apps built on React Native 0.73.2 with NativeWind (Tailwind CSS)
- Supabase backend for auth, database, storage, and realtime features
- Android build configuration present in both apps (`/android` folders)
- Shared code in `/shared` for types (auth, member, event, message, donation) and constants

### Platform Support Status
**Location:** `mahaveer-bhavan/member-app/` and `mahaveer-bhavan/admin-app/`

**Key findings**
- ✅ Android: `/android` folders exist in both apps with Gradle build configuration
- ❌ iOS: `/ios` folders do NOT exist in either app - needs Xcode project setup
- ❌ Web: No `/web-admin-interface` or web-specific deployment folder exists

**How it works**
- Android builds configured via Gradle (`assembleRelease`, `bundleRelease`)
- iOS support pending - requires `pod install` and Xcode workspace creation
- Web deployment not yet implemented

### Authentication & Role-Based Access
**Location:** `mahaveer-bhavan/shared/src/types/auth.ts`

**Key files**
- `shared/src/types/auth.ts:1-34` - User, AuthSession, AdminRole, AdminPermissions types

**How it works**
- User roles defined: `'member' | 'admin' | 'super_admin' | 'partial_admin' | 'view_only'`
- `force_password_change` boolean flag exists on User type
- AdminPermissions includes: member_management, event_management, financial_management, gallery_moderation, system_settings, user_management
- App.js files in both apps are minimal placeholders with no navigation/routing yet

### Theming & Design System
**Location:** `mahaveer-bhavan/member-app/src/constants/`

**Key files**
- `member-app/src/constants/colors.js:1-54` - Color palette
- `member-app/src/constants/theme.js:1-87` - Spacing, typography, shadows

**Current colors**
- Primary: `#FF6B35` (Orange) - ⚠️ Spec requires Teal
- Secondary: `#004E89` (Blue)
- ❌ Dark mode not configured yet
- Uses NativeWind for styling

### Backend Functions (Supabase Edge Functions)
**Location:** `mahaveer-bhavan/supabase/functions/`

**Implemented functions**
- `jainism-chat/index.ts:1-222` - Dharma AI using OpenRouter (Claude 3.5 Sonnet), rate limiting (20 req/hour), Hindi/English
- `messaging-system/index.ts` - Real-time messaging
- `whatsapp-integration/index.ts` - WhatsApp integration
- `notification-system/index.ts` - Push notifications
- `email-service/index.ts` - Email service
- `member-operations/index.ts` - Member CRUD
- `donation-processing/index.ts` - Donation handling
- `event-operations/index.ts` - Event management
- `payment-processing/index.ts` - Payment gateway

### Member App Implementation Status
**Location:** `mahaveer-bhavan/member-app/src/`

**Screens (2 completed)**
- `screens/Auth/LoginScreen.js` - Login form with email/password validation, forgot password, register navigation
- `screens/Member/DashboardHome.js` - Dashboard with profile header, statistics cards, quick actions, upcoming events, pull-to-refresh

**Common components (6 ready)**
- `components/common/Button.js` - 4 variants (primary, secondary, outline, danger)
- `components/common/Input.js` - Validation, password toggle, multiline
- `components/common/Card.js` - 3 variants (default, elevated, outlined)
- `components/common/Avatar.js` - 4 sizes, initials fallback
- `components/common/Badge.js` - 5 color variants
- `components/common/Loader.js` - Full screen and inline loading

**Hooks (state management)**
- `hooks/useAuth.js` - Login/logout, registration, password reset/update, profile management, AsyncStorage persistence
- `hooks/useData.js` - Events/trips/donations/gallery fetching with SWR caching, event registration, donation submission
- `hooks/useMessages.js` - Real-time messaging via Supabase Realtime, conversation management, read receipts, optimistic updates

**Services & utilities**
- `services/supabase/client.js` - Configured Supabase client for React Native
- `services/functions/media.js` - File uploads to Supabase Storage (profile photos 5MB, gallery 10-50MB, message attachments 20MB)
- `utils/qrCode.js` - Generate/parse member ID QR codes, event registration QR
- `utils/pdfGenerator.js` - ID card PDF/JPG generation (requires react-native-pdf-lib)

### Admin App Implementation Status
**Location:** `mahaveer-bhavan/admin-app/src/`

**Current state**
- App.js is a minimal placeholder container
- No screens implemented yet
- Supabase client configured at `src/services/supabase/client.js`
- Package.json includes drawer navigation (@react-navigation/drawer), charts (react-native-chart-kit), camera (react-native-vision-camera)

### Database Schema (Supabase)
**Location:** `mahaveer-bhavan/shared/src/types/supabase-types.ts:1-887`

**Core tables**
- `members` - Full member profiles (name, DOB, phone, email, address, membership_type, photo_url, qr_code, auth_id)
- `user_profiles` - Auth-linked profiles (auth_id, role_id, needs_password_change, is_active, login_count)
- `user_roles` - Role definitions (name, permissions JSON, description)
- `events` - Events (title, date, time, location, type, fees, capacity, is_published, created_by)
- `event_registrations` - Event signups (member_id, event_id, attended, status)
- `trips` - Trip/pilgrimage details (destination, dates, price, transport_type, itinerary JSON, target_audience array)
- `trip_registrations` - Trip signups (member_id, trip_id, payment_status, status)
- `trip_assignments` - Logistics (room_number, train_seat_number, bus_seat_number, flight_ticket_number, pnr_number)
- `trip_attendance` - Attendance tracking (member_id, trip_id, attended, marked_by, marked_at)
- `trip_documents` - Itinerary files (trip_id, file_url, title, file_type, uploaded_by)
- `donations` - Donation records (member_id, amount, currency, payment_method, transaction_id, receipt_number)
- `gallery_items` - Media library (media_url, media_type, title, is_public, event_id, uploaded_by)
- `messages` - P2P messages (sender_id, receiver_id/recipient_id, content, is_read)
- `notifications` - Push notifications (member_id, title, content, type, is_read, metadata JSON)
- `groups` - Group chats (name, description, avatar_url, created_by)
- `group_members` - Group membership (group_id, user_id, role: admin/member)
- `message_reactions` - Message reactions (message_id, user_id, emoji)
- `voice_messages` - Voice metadata (message_id, waveform_data, transcription)
- `typing_indicators` - Real-time typing status

**Database functions**
- `generate_member_id(membership_type)` - Auto member ID generation
- `check_user_permission(permission_name, user_auth_id)` - Permission validation
- `get_user_role(user_auth_id)` - Fetch role name
- `is_admin_role(user_auth_id)` / `is_superadmin_role(user_auth_id)` - Role checks
- `create_admin_user(user_email, user_role)` - Admin creation
- `setup_super_admin()` / `setup_test_users()` - Setup helpers

**Storage buckets**
- `message-media` - Message attachments (52MB limit, images/videos/audio/documents)

## Gap Analysis: Spec vs Implementation

### ✅ What Exists
- React Native foundation (0.73.2) for both apps
- Android build configuration
- Supabase backend fully configured (database, auth, storage, realtime, edge functions)
- Complete database schema with all required tables
- Authentication system with role-based access (types defined)
- Messaging system (WhatsApp-style with groups, reactions, voice messages)
- Backend functions for all major operations
- Member app: 2 screens, 6 reusable components, 3 hooks
- Dharma AI Assistant fully implemented

### ❌ What's Missing (per spec)

**Platform support:**
- iOS folders (Xcode project setup) for both apps
- Web admin interface deployment

**Design system:**
- Dark mode configuration
- Teal primary color (currently Orange #FF6B35)
- Apple-like premium design polish

**Navigation & routing:**
- Role-based routing logic not implemented
- Force password change screen/flow
- Full navigation structure for both apps

**Member app screens (not implemented):**
- Registration flow with multi-step form
- Photo upload with live cropping
- Digital ID card view with PDF/JPG download
- VoIP calling component
- WhatsApp-style chat UI
- Gallery feed (Instagram-like with like/comment/share)
- Events list and detail screens
- Trip detail with logistics display
- Dharma AI chat interface

**Admin app (almost entirely missing):**
- All admin screens (dashboard, user management, event management, etc.)
- System settings (branding, logo, color, payment gateway config)
- Event/trip creation forms with dynamic pricing
- Logistics assignment interface
- QR/NFC scanner for attendance
- Gallery moderation queue
- Calendar management with holiday marking
- Data import/export tools (web interface)
- Audit log viewer

**Additional gaps:**
- No admin initialization (rahulsuranat@gmail.com with role setup)
- No default password enforcement
- Currency display (₹) not configured
- Dynamic pricing tiers not implemented
- Travel assignment forms not built
- Distribution tracking not implemented
