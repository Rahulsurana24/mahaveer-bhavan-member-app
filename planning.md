# Sree Mahaveer Seva Integrated Ecosystem - Implementation Plan

## Overview
Multi-platform Jain community management system with Member Portal (iOS/Android) and Admin Portal (iOS/Android/Web), featuring messaging, events, digital ID cards, gallery, and AI assistant.

**Repository:** mahaveer-bhavan (existing React Native 0.73.2 foundation)
**Backend:** Supabase (fully configured with 19 tables, 9 edge functions)
**Design:** Dark mode with Teal primary color, Apple-like premium aesthetic
**Currency:** Indian Rupees (₹)

## Current State (Updated: October 26, 2025)

### ✅ COMPLETED
- ✅ React Native apps scaffolded (member-app, admin-app)
- ✅ Android build configuration ready
- ✅ Complete database schema with authentication/roles
- ✅ Backend functions implemented (AI chat, messaging, payments, events)
- ✅ **Member app: 42+ screens fully implemented** (ALL core features)
  - Auth screens (4): Login, Register, ForgotPassword, ChangePassword
  - Core screens (5): Dashboard, Gallery, Messages, Events, More Menu
  - Detail screens (7): EventDetail, TripDetail, Profile, IDCard, EditProfile, Chat, AIAssistant
  - Registration screens (3): EventRegistration, TripRegistration, Success screens
  - Modal screens (10+): PhotoViewer, Comments, UploadMedia, StoryViewer, IncomingCall, etc.
- ✅ **Navigation fully built** (RootNavigator, MainNavigator, AuthNavigator)
  - Auth state management with Supabase
  - Role-based routing (member-only access)
  - Bottom tabs navigation (5 tabs)
  - Modal screens configured
  - Theme-aware navigation bars
- ✅ **Dark mode/teal theme fully configured** (100% coverage)
  - ThemeContext with Light/Dark/System modes
  - Complete teal-themed color palette
  - All 20 major screens themed
  - Theme persists to AsyncStorage
  - Auto-detects system theme changes
- ✅ **Common components** (20+): Avatar, Button, Badge, Card, Input, ThemeToggle, etc.

### ❌ PENDING
- ❌ iOS support pending (requires macOS + Xcode)
- ❌ Web admin interface missing (separate React web app planned)
- ❌ Android build needs fixing (25 dependency conflicts to resolve)

## Implementation Scope
Full implementation of all features across Member Portal, Admin Portal, and Web Admin Interface.

---

## Platform Setup & Configuration

### iOS Support Setup
**Repo:** mahaveer-bhavan

**Member App iOS Configuration**
- Location: `mahaveer-bhavan/member-app/ios/` (new folder)
- Action: Initialize iOS project using `npx react-native run-ios --no-packager`
- Required files:
  - Xcode workspace/project files
  - Info.plist with camera, photo library, microphone permissions for VoIP
  - Podfile with required native dependencies
- Dependencies to add via CocoaPods:
  - react-native-vision-camera (for QR scanning, photo capture)
  - react-native-pdf-lib (for ID card PDF generation)
  - @react-native-voice/voice (for VoIP calling)

**Admin App iOS Configuration**
- Location: `mahaveer-bhavan/admin-app/ios/` (new folder)
- Action: Initialize iOS project using `npx react-native run-ios --no-packager`
- Required files: Same structure as member app
- Dependencies: Camera for QR/NFC scanning, chart libraries

**iOS Permissions (Info.plist entries)**
- NSCameraUsageDescription: "To scan QR codes and capture photos"
- NSPhotoLibraryUsageDescription: "To save ID cards and upload media"
- NSMicrophoneUsageDescription: "To enable voice and video calls"
- NSPhotoLibraryAddUsageDescription: "To save downloaded ID cards"

### Web Admin Interface Setup
**Location:** `mahaveer-bhavan/web-admin-interface/` (new folder)

**Architecture Decision:** Separate React web application (NOT React Native Web)

**Tech Stack:**
- React 18+ with TypeScript
- Vite for build tooling
- TailwindCSS for styling (matching mobile dark mode/teal theme)
- React Router for navigation
- Supabase JS client (shared backend)

**Shared Resources:**
- Types: Import from `mahaveer-bhavan/shared/src/types/`
- Supabase client config: Reference same environment variables
- Constants: Share color/theme values

**Deployment Target:** Web browser (accessible via URL for admin maintenance)

---

## Theme System & Design Implementation

### Color Palette Update
**Locations:**
- `mahaveer-bhavan/member-app/src/constants/colors.js`
- `mahaveer-bhavan/admin-app/src/constants/colors.js`
- `mahaveer-bhavan/web-admin-interface/src/styles/theme.ts` (new)

**Action:** Replace entire color palette with dark mode design

**New Color System:**
```
Primary Colors:
- primary: '#0F766E' (Teal 700 - main brand color)
- primaryLight: '#14B8A6' (Teal 500 - hover/active states)
- primaryDark: '#115E59' (Teal 800 - pressed states)

Dark Mode Background:
- background: '#0A0A0A' (Pure dark - main bg)
- backgroundElevated: '#1A1A1A' (Cards/elevated surfaces)
- backgroundSecondary: '#2A2A2A' (Secondary sections)

Text Colors:
- textPrimary: '#FFFFFF' (Primary text)
- textSecondary: '#A0A0A0' (Secondary text)
- textTertiary: '#707070' (Disabled/placeholder text)

Semantic Colors:
- success: '#10B981' (Green - confirmations)
- error: '#EF4444' (Red - errors/destructive)
- warning: '#F59E0B' (Amber - warnings)
- info: '#3B82F6' (Blue - information)

Borders & Dividers:
- border: '#2A2A2A' (Default borders)
- borderLight: '#3A3A3A' (Subtle dividers)
```

**Currency Symbol Configuration:**
- Add constant: `CURRENCY_SYMBOL = '₹'`
- Add helper function: `formatCurrency(amount)` returns `₹${amount.toLocaleString('en-IN')}`
- Location: `mahaveer-bhavan/shared/src/utils/currency.ts` (new file)

### Apple-Like Premium Design Guidelines
**Typography:**
- Font family: SF Pro (iOS), Roboto (Android), System default fallback
- Sizes: Large titles (34px), Titles (28px), Headings (20px), Body (16px), Caption (12px)
- Weights: Regular (400), Medium (500), Semibold (600), Bold (700)

**Spacing System (8px base):**
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

**Shadows & Elevation:**
- Subtle elevation for cards: `shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4`
- Modal/sheet elevation: `shadowOpacity: 0.5, shadowRadius: 16, elevation: 8`

**Animation Standards:**
- Transitions: 200ms for micro-interactions, 300ms for screen transitions
- Easing: Smooth curves (Bezier easing)
- Use LayoutAnimation for smooth list updates

**Component Polish:**
- All buttons have active/pressed states with opacity 0.8
- Input fields have focus ring in primary color
- Smooth loading skeletons (shimmer effect)
- Pull-to-refresh with haptic feedback

---

## Authentication & Routing Architecture

### Initial System Setup
**Purpose:** Create the super admin account on first deployment

**Implementation:** Database seed script or one-time backend function
**Location:** `mahaveer-bhavan/supabase/migrations/` (new migration file)

**Super Admin Account:**
- Email: `rahulsuranat@gmail.com`
- Password: `9480413653`
- Role: `super_admin` (highest privilege)
- Created in: `auth.users` table (Supabase Auth) and `public.user_profiles` with `role_id` linking to `user_roles` table

**Initial Setup Logic:**
1. Check if any users exist with `super_admin` role
2. If not, create user via Supabase Admin API
3. Insert profile record with `needs_password_change: true`
4. Associate with super_admin role from `user_roles` table

### Authentication Flow (Both Apps)

**Login Screen**
**Locations:**
- `mahaveer-bhavan/member-app/src/screens/Auth/LoginScreen.js` (already exists - update)
- `mahaveer-bhavan/admin-app/src/screens/Auth/LoginScreen.js` (new - identical to member)

**Login Process:**
1. User enters email and password
2. Call Supabase `signInWithPassword(email, password)`
3. On success, fetch user profile from `public.user_profiles` JOIN `user_roles` using auth_id
4. Extract: `role_id`, `needs_password_change`, `is_active` fields
5. Store auth session in AsyncStorage
6. Route based on conditions (see below)

**Force Password Change Screen**
**Location:**
- `mahaveer-bhavan/member-app/src/screens/Auth/ChangePasswordScreen.js` (new)
- `mahaveer-bhavan/admin-app/src/screens/Auth/ChangePasswordScreen.js` (new)

**Trigger Condition:** When `needs_password_change === true`

**Screen Behavior:**
- No back button (user is trapped until password changed)
- No navigation to any other screen possible
- Form fields: Current Password, New Password, Confirm New Password
- Validation: New password minimum 8 characters, must differ from current
- On submit: Call Supabase `updateUser({ password: newPassword })`
- On success: Update `user_profiles.needs_password_change = false`, then route to main app

**Role-Based Routing Logic**

**After successful authentication:**
```
IF needs_password_change === true:
  → Navigate to ChangePasswordScreen (forced)
ELSE IF role_name === 'member':
  → Navigate to Member App (Main Stack Navigator)
ELSE IF role_name IN ['admin', 'super_admin', 'partial_admin', 'view_only']:
  → Navigate to Admin App (Drawer Navigator)
ELSE:
  → Show error: "Invalid account role" and logout
```

**App Structure Decision:** Each app (member-app, admin-app) has its own login screen, but admins should use admin app, members should use member app. Cross-role access is blocked at routing level.

**Session Persistence:**
- Use AsyncStorage to persist auth token
- On app launch: Check AsyncStorage for token
- If token exists: Validate with Supabase, fetch user role, route accordingly
- If token invalid/expired: Navigate to LoginScreen

---

## Member App Implementation

### Navigation Structure
**Library:** React Navigation v6 (already in package.json)
**Pattern:** Bottom Tab Navigator (Instagram-style)

**Main Stack Navigator:**
- Auth Stack (Login, Register, Change Password, Forgot Password)
- Main Tab Navigator (after authentication)
- Modal Screens (ID Card, Photo Viewer, etc.)

**Bottom Tab Navigator (5 tabs):**
1. **Home** - Dashboard with quick actions and stats (icon: home)
2. **Gallery** - Social feed with posts (icon: grid/images)
3. **Messages** - Chat conversations list (icon: chat-bubble)
4. **Events** - Events and trips list (icon: calendar)
5. **More** - Profile, AI Assistant, Settings (icon: menu/3-dots)

**Tab Bar Styling:**
- Background: `#1A1A1A` (elevated background)
- Active tab color: `#0F766E` (teal primary)
- Inactive tab color: `#707070` (tertiary text)
- Height: 65px with safe area padding
- Icons: Use react-native-vector-icons (Ionicons)

### Registration Flow

**Screen:** `mahaveer-bhavan/member-app/src/screens/Auth/RegisterScreen.js` (new)

**Multi-Step Form (4 steps with progress indicator at top):**

**Step 1: Basic Information**
- Full Name (required, 3-100 chars, trim whitespace)
- Date of Birth (required, date picker, must be 18+ years)
- Gender (required, dropdown: Male/Female/Other)
- Blood Group (optional, dropdown: A+, A-, B+, B-, O+, O-, AB+, AB-)
- Next button (validates before proceeding)

**Step 2: Contact Information**
- Mobile Number (required, 10 digits, Indian format validation)
- WhatsApp Number (optional, 10 digits, checkbox "Same as mobile")
- Email (required, valid email format)
- Address Line 1 (required, max 200 chars)
- Address Line 2 (optional, max 200 chars)
- City (required, max 50 chars)
- State (required, dropdown of Indian states)
- PIN Code (required, 6 digits)
- Next button

**Step 3: Membership Details**
- Membership Type (required, radio buttons):
  - Tapasvi
  - Karyakarta
  - Shraman
  - Shravak
  - General Member
- Emergency Contact Name (required, max 100 chars)
- Emergency Contact Number (required, 10 digits)
- Relation (required, dropdown: Parent/Spouse/Sibling/Friend/Other)
- Next button

**Step 4: Photo Upload**
- Header: "Upload Your Photo"
- Instruction text: "This photo will appear on your digital ID card"
- Upload button: "Choose Photo" (opens image picker)
- Image picker options: Camera or Gallery (use react-native-image-picker)
- After selection: Open crop screen (see Photo Cropping below)
- Preview: Show cropped image in circular avatar (large, 200px diameter)
- Re-upload button if user wants to change photo
- Submit button: "Complete Registration"

**Photo Cropping Implementation:**
- Library: react-native-image-crop-picker
- Aspect ratio: 1:1 (square)
- Cropping UI: Overlay with drag handles and zoom
- Max output size: 1024x1024px
- Compression: JPEG quality 0.85
- After crop: Upload to Supabase Storage bucket `profile-photos/`
- File naming: `{memberID}_{timestamp}.jpg`

**Submission Process:**
1. Validate all fields across all steps
2. Upload cropped photo to Supabase Storage
3. Get photo URL from storage
4. Generate unique Member ID using database function `generate_member_id(membership_type)`
5. Generate QR code data: `MEMBER:{memberID}:{fullName}`
6. Insert record into `public.members` table with all data
7. Create auth account in Supabase Auth with email/temporary password
8. Send welcome email with login credentials (via email-service edge function)
9. Navigate to success screen with "Registration Complete" message
10. Auto-logout and redirect to LoginScreen

**Validation Rules:**
- Name: No special characters except spaces, hyphens, apostrophes
- Mobile/WhatsApp: Must start with 6-9 (Indian mobile format)
- Email: Standard email regex validation
- PIN Code: Must be valid 6-digit Indian PIN
- Age: Calculate from DOB, must be 18+
- Photo: Required, minimum 200x200px before crop

**Error Handling:**
- If email already exists: "This email is already registered"
- If mobile already exists: "This mobile number is already registered"
- If photo upload fails: Retry up to 3 times, then show error with retry button
- If network error during submission: Save form data to AsyncStorage, allow resume

### Home/Dashboard Screen

**Screen:** `mahaveer-bhavan/member-app/src/screens/Member/DashboardHome.js` (already exists - enhance)

**Layout Sections:**

**1. Header (top)**
- Avatar (circular, 48px, tappable - opens ProfileScreen)
- Greeting text: "Good morning/afternoon/evening, {firstName}"
- Notification bell icon (top-right, shows red badge if unread notifications)

**2. Digital ID Card Preview (prominent card)**
- Background: Gradient (teal primary to darker teal)
- Member photo (circular, 80px)
- Member name (bold, 18px)
- Member ID below name (14px, lighter text)
- "View Full ID" button (opens ID Card modal)
- Subtle shadow for elevation

**3. Quick Stats Row (3 cards side-by-side)**
- Events Attended (number, icon: calendar-check)
- Donations Made (₹ amount, icon: heart)
- Messages Unread (number, icon: chat)
- Each card tappable to navigate to relevant section

**4. Quick Actions Grid (4 items, 2x2)**
- Register for Event (icon: calendar-plus, navigates to EventsListScreen)
- Send Message (icon: chat, navigates to MessagesScreen)
- Make Donation (icon: hand-heart, opens DonationScreen)
- View Gallery (icon: images, navigates to GalleryScreen)

**5. Upcoming Events Section**
- Section header: "Upcoming Events" with "View All" link
- Horizontal scroll list of event cards (first 3 events)
- Each card shows: event image, title, date, location
- If no events: "No upcoming events" placeholder

**6. Recent Notifications Section**
- Section header: "Recent Updates"
- List of last 3 notifications (title, timestamp, icon)
- "View All" button at bottom

**Pull-to-Refresh:**
- Refreshes all dashboard data (profile, stats, events, notifications)
- Shows native refresh indicator
- Haptic feedback on pull

### Digital ID Card Feature

**Modal Screen:** `mahaveer-bhavan/member-app/src/screens/Member/IDCardScreen.js` (new)

**Display Format:** Full-screen modal with ID card design

**Card Layout (vertical, credit card style):**
- Header banner: Organization name (dynamic from system settings) with logo
- Background: White with subtle pattern
- Member photo: Large circular (150px) at top-center
- Member Name: Bold, 22px, centered
- Member ID: Below name, 16px, teal color
- Membership Type: Badge below ID (colored based on type)
- QR Code: Large (200x200px) at bottom
- Generated from: `MEMBER:{memberID}:{fullName}`
- Footer: "Valid Member" text with checkmark icon

**Action Buttons (bottom of modal):**
- Download as PDF (primary button, uses react-native-pdf-lib)
- Download as JPG (secondary button, uses react-native-view-shot)
- Share (opens native share sheet with image)
- Close button (X icon, top-right of modal)

**PDF Generation:**
- Library: react-native-pdf-lib
- Size: A6 (standard ID card size)
- Layout: Same as screen design
- Save to device: Downloads folder with filename `MemberID_{memberID}.pdf`
- After save: Show success toast with "Open" button to view PDF

**JPG Generation:**
- Library: react-native-view-shot
- Capture entire card view as image
- Resolution: 1200x1800px (high quality)
- Save to device: Photos/Gallery
- After save: Show success toast and option to share

**Permissions:**
- iOS: NSPhotoLibraryAddUsageDescription
- Android: WRITE_EXTERNAL_STORAGE

### Gallery / Social Feed Screen

**Screen:** `mahaveer-bhavan/member-app/src/screens/Member/GalleryScreen.js` (new)

**Layout:** Instagram-style feed with infinite scroll

**Post Card Design:**
- Header: Uploader avatar + name + timestamp (if uploaded by admin, show "Official")
- Media: Image or video (full width, aspect ratio preserved)
  - Image: Use react-native-fast-image for caching
  - Video: Show play button overlay, tap to open video player
- Action Bar (below media):
  - Like button (heart icon, filled if liked, count shown)
  - Comment button (chat icon, count shown)
  - Share button (share icon, opens native share)
- Caption/Title: Below action bar (expandable if long)
- View Comments link: "View all X comments" (opens CommentsScreen)

**User Upload Feature:**
- Floating "+" button (bottom-right, above tab bar)
- Tap opens upload screen (UploadMediaScreen)

**Upload Media Screen:** `mahaveer-bhavan/member-app/src/screens/Member/UploadMediaScreen.js` (new)

**Upload Flow:**
1. Choose media: Camera or Gallery (image/video)
2. For images: Optional crop/filter (basic Instagram-like filters)
3. Add caption/title (max 500 chars)
4. Optional: Tag event (dropdown of user's attended events)
5. Submit button: "Upload for Review"

**Submission:**
- Upload media to Supabase Storage bucket `gallery-media/pending/`
- Insert record into `public.gallery_items` with `is_public: false`, `uploaded_by: memberID`
- Show success message: "Your upload is pending admin approval"
- Admins see this in moderation queue

**Like Feature:**
- Tap heart: Insert/delete record in `gallery_likes` table (member_id, gallery_item_id)
- Optimistic update: Heart fills immediately, undo if API fails
- Like count updates in real-time

**Comment Feature:**
- Opens full-screen CommentsScreen (modal)
- List of comments (avatar, name, text, timestamp)
- Text input at bottom (fixed position)
- Post comment: Inserts into `gallery_comments` table
- Real-time: Use Supabase Realtime subscription for new comments

**Share Feature:**
- Use React Native Share API
- Share text: "Check out this post from {organizationName}: {caption}" + media URL
- If media is image: Share image directly
- If video: Share link to media

**Infinite Scroll:**
- Load 20 posts initially
- Load next 20 when user scrolls to bottom (pagination)
- Show loading spinner at bottom while loading

**Pull-to-Refresh:**
- Reload latest posts
- Reset to first page

### Messaging System

**Messages List Screen:** `mahaveer-bhavan/member-app/src/screens/Member/MessagesScreen.js` (new)

**Layout:** WhatsApp-style conversation list

**Conversation Card (each item in list):**
- Avatar (circular, 56px)
- Name/Group name (bold, 16px)
- Last message preview (gray, 14px, truncate to 1 line)
- Timestamp (top-right, 12px, gray)
- Unread badge (teal circle with count, if unread messages)
- Typing indicator (if other person is typing): "typing..." in green

**List Behavior:**
- Sort by: Most recent message first
- Show loading skeleton while loading
- Pull-to-refresh: Reload conversations
- Swipe actions (iOS style):
  - Left swipe: Delete conversation (confirmation dialog)
  - Right swipe: Mark as unread/read

**Top Actions:**
- Search bar (top): Filter conversations by name
- New message button (top-right, "+" icon): Opens contact picker to start new chat

**Real-time Updates:**
- Subscribe to `messages` table changes via Supabase Realtime
- Update conversation list when new message arrives
- Show notification if app is in foreground

**Chat Screen:** `mahaveer-bhavan/member-app/src/screens/Member/ChatScreen.js` (new)

**Layout:** WhatsApp-style chat interface

**Header:**
- Back button (left)
- Contact avatar + name (center)
- Video call button (top-right, video icon)
- Voice call button (top-right, phone icon)
- More options (3-dot menu): Block, Report, Clear chat

**Message List (inverted FlatList):**
- Sent messages: Right-aligned, teal background, white text
- Received messages: Left-aligned, dark gray background, white text
- Message bubble styling: Rounded corners (16px), padding (12px)
- Timestamp: Inside bubble (bottom-right, 10px, lighter text)
- Read status: Double checkmark (gray if delivered, teal if read)

**Message Types:**

**1. Text Messages:**
- Plain text, support emojis
- Linkify URLs (tappable, open in browser)
- Long-press options: Copy, Delete, Reply, React

**2. Image Messages:**
- Thumbnail in bubble (max 300px width)
- Tap to open full-screen image viewer (zoom/pan)
- Send: Pick from gallery or camera, optional caption

**3. Video Messages:**
- Thumbnail with play icon overlay
- Tap to open full-screen video player
- Send: Pick from gallery or record video (max 2 minutes)

**4. Audio Messages (Voice Notes):**
- Waveform visualization (use react-native-audio-waveform)
- Duration shown (e.g., "0:45")
- Play/pause button
- Record: Hold-to-record button (mic icon)
  - Recording UI: Animated waveform, timer, "Slide to cancel"
  - Release to send, slide left to cancel
  - Max duration: 5 minutes

**5. Document Messages:**
- File icon + filename + size
- Tap to download and open (use react-native-fs + Linking)

**Message Reactions:**
- Long-press message: Show reaction picker (6 emojis: ❤️ 👍 😂 😮 😢 🙏)
- Tap emoji: Add reaction (stored in `message_reactions` table)
- Show reactions below message bubble (grouped, with count)

**Input Bar (bottom, fixed):**
- Text input (multiline, auto-expand up to 5 lines)
- Emoji button (left): Opens emoji picker
- Attachment button (left): Opens action sheet (Photo, Video, Document, Location)
- Send button (right): Only visible when text entered
- Voice message button (right): Hold-to-record (when text input empty)

**Typing Indicator:**
- When user types: Send typing event to `typing_indicators` table (expires after 5 seconds)
- When other person types: Show "typing..." below name in header
- Use debounce (500ms) to avoid excessive updates

**VoIP Calling Implementation:**

**Library:** @videosdk.live/react-native-sdk or Agora RTC

**Voice Call:**
- Tap phone icon: Initiate voice call
- Create call session in backend (edge function)
- Generate unique room ID
- Send push notification to recipient: "{callerName} is calling..."
- Open CallScreen with connecting state

**Video Call:**
- Tap video icon: Initiate video call
- Same flow as voice call but with video enabled

**Call Screen:** `mahaveer-bhavan/member-app/src/screens/Member/CallScreen.js` (new)

**Call States:**
1. **Connecting:** Show "Connecting..." with avatar
2. **Ringing:** Show "Ringing..." with avatar, cancel button
3. **Active:** Show video (if video call) or avatar (if voice)
4. **Ended:** Show "Call ended" and duration, auto-close after 2 seconds

**Call Controls (bottom):**
- Mute button (mic icon, toggle)
- Speaker button (speaker icon, toggle loudspeaker)
- Video toggle (only for video calls, can switch to voice-only)
- End call button (red, phone icon, ends and closes screen)

**Call Permissions:**
- iOS: NSMicrophoneUsageDescription, NSCameraUsageDescription
- Android: RECORD_AUDIO, CAMERA

**Call Notifications:**
- Incoming call: Full-screen notification with Accept/Decline buttons
- Use react-native-callkeep for native call UI integration (iOS/Android)

### Events & Trips

**Events List Screen:** `mahaveer-bhavan/member-app/src/screens/Member/EventsListScreen.js` (new)

**Top Tabs (2 tabs):**
- Events (religious events, ceremonies)
- Trips (pilgrimages, tours)

**Filter Bar (below tabs):**
- Dropdown: All / Upcoming / Past / Registered
- Search bar: Search by event name

**Event Card (list item):**
- Event image (full width, 200px height)
- Title (bold, 18px)
- Date range (icon + text, e.g., "Dec 25-27, 2025")
- Location (icon + text)
- Fee badge (top-right of image): "₹1,500" or "Free"
- Registration status badge (if registered): "Registered" in teal
- Tap card: Opens EventDetailScreen

**Event Detail Screen:** `mahaveer-bhavan/member-app/src/screens/Member/EventDetailScreen.js` (new)

**Layout (scrollable):**

**1. Hero Image:**
- Large event image (full width, 300px height)
- Back button (top-left, white with shadow)
- Share button (top-right, white with shadow)

**2. Event Info Card:**
- Title (bold, 24px)
- Date & time (icon + text)
- Location (icon + text, tappable - opens maps)
- Organizer (icon + text, e.g., "Organized by Trust")

**3. Description Section:**
- Full event description (expandable)
- "Read more" link if text exceeds 4 lines

**4. Pricing Section:**
- Dynamic pricing based on user's membership type (fetched from `events.fees` JSONB)
- Show user's applicable fee prominently
- Example: "Your fee: ₹1,200 (Tapasvi rate)"
- If multiple types: Show table of all rates

**5. Itinerary Section (for trips):**
- Day-by-day schedule
- Download itinerary button: Downloads PDF from `trip_documents` table

**6. Logistics Section (if user registered):**
- Only visible if user has `event_registrations.status = 'confirmed'`
- Shows personalized details from `trip_assignments`:
  - Room Number (if assigned)
  - Seat Number (bus/train/flight)
  - PNR Number (if applicable)
- If not assigned yet: "Logistics will be shared soon"

**7. Action Buttons (bottom, fixed):**
- If not registered: "Register Now" button (primary, full width)
  - Opens RegistrationFormScreen
- If registered: "View Registration" button (secondary)
  - Opens RegistrationDetailsScreen
- If event past and attended: "Download Certificate" button

**Registration Form Screen:** `mahaveer-bhavan/member-app/src/screens/Member/RegistrationFormScreen.js` (new)

**Form Fields:**
- Number of attendees (dropdown: 1-10)
- If >1: Collect names of additional attendees (text inputs)
- Dietary preferences (checkboxes: Veg, Vegan, Jain, Gluten-free, None)
- Special requests/comments (textarea, max 500 chars, optional)
- Emergency contact (pre-filled from profile, editable)
- Terms & conditions checkbox (required)

**Payment Section:**
- Total fee calculation shown prominently: "Total: ₹{calculated_fee}"
  - Fee = user's membership type fee × number of attendees
- Payment method (radio buttons):
  - Online (Razorpay)
  - Offline (Bank transfer - shows bank details)
  - Pay at event

**Submit Button:**
- "Confirm Registration" (primary button)
- On tap:
  1. Validate all fields
  2. If online payment: Open Razorpay checkout (use react-native-razorpay)
  3. If successful: Insert record into `event_registrations` table with `status: 'confirmed'`
  4. Send confirmation email (via email-service edge function)
  5. Send push notification: "Registration confirmed for {eventName}"
  6. Navigate to success screen

**Registration Success Screen:**
- Checkmark animation
- "Registration Successful!" message
- Event details summary
- QR code: `EVENT_REG:{registrationID}:{memberID}`
- "View Registration" button (navigates to RegistrationDetailsScreen)
- "Back to Events" button

### Dharma AI Assistant

**AI Chat Screen:** `mahaveer-bhavan/member-app/src/screens/Member/AIAssistantScreen.js` (new)

**Access:** From "More" tab → "Dharma AI Assistant" option

**Layout:** Chat interface (similar to ChatScreen but with AI)

**Header:**
- Title: "Dharma AI Assistant"
- Subtitle: "Ask about Jainism, Varsitap, rituals"
- Info button (top-right): Shows AI capabilities and limitations

**Chat Interface:**
- User messages: Right-aligned, teal background
- AI responses: Left-aligned, dark gray background with AI avatar
- Typing indicator when AI is responding: Animated dots

**Input Bar:**
- Text input (multiline, placeholder: "Ask a question about Jainism...")
- Send button (paper plane icon)

**Quick Suggestions (shown when chat empty):**
- Bubble buttons with common questions:
  - "What is Varsitap?"
  - "Explain Upavas rules"
  - "Daily prayer routine"
  - "Jain festivals"
- Tap suggestion: Auto-fills input and sends

**AI Backend:**
- Endpoint: Supabase edge function `jainism-chat` (already implemented)
- API: OpenRouter (Claude 3.5 Sonnet)
- Rate limiting: 20 requests/hour per user (enforced in edge function)
- Languages: Hindi and English (auto-detected)

**Message Flow:**
1. User types question and sends
2. Show user message in chat immediately
3. Show AI typing indicator
4. Call edge function POST `/functions/v1/jainism-chat` with body: `{ message: userMessage, userId: memberID }`
5. Edge function returns AI response
6. Display AI response in chat
7. Store conversation in `ai_conversations` table (for history)

**Error Handling:**
- If rate limit exceeded: "You've reached the hourly limit. Please try again later."
- If API error: "Sorry, I couldn't process that. Please try again."
- Retry button shown on errors

**Chat History:**
- Load last 50 messages from `ai_conversations` table on screen open
- Infinite scroll to load older messages (pagination)

### Profile & Settings

**Profile Screen:** `mahaveer-bhavan/member-app/src/screens/Member/ProfileScreen.js` (new)

**Access:** From "More" tab or tap avatar on Dashboard

**Layout (scrollable):**

**1. Profile Header:**
- Large avatar (120px, circular)
- Edit photo button (camera icon overlay)
- Name (bold, 22px)
- Member ID (14px, gray)
- Membership type badge

**2. Stats Row (3 items):**
- Events Attended (number)
- Donations (₹ total)
- Member Since (date)

**3. Personal Information Section:**
- Date of Birth (icon + text)
- Gender (icon + text)
- Blood Group (icon + text)
- Mobile (icon + text, tappable to call)
- Email (icon + text, tappable to email)
- Address (icon + text)
- Edit button (top-right of section): Opens EditProfileScreen

**4. Emergency Contact Section:**
- Contact name and number
- Relation
- Edit button

**5. Settings Section (list):**
- Change Password (chevron right, navigates to ChangePasswordScreen)
- Notifications (chevron right, navigates to NotificationSettingsScreen)
- Language (chevron right, dropdown: English/Hindi)
- About (chevron right, shows app version, credits)

**6. Logout Button:**
- Red text, centered
- Confirmation dialog: "Are you sure you want to logout?"
- On confirm: Clear AsyncStorage, navigate to LoginScreen

**Edit Profile Screen:** `mahaveer-bhavan/member-app/src/screens/Member/EditProfileScreen.js` (new)

**Editable Fields:**
- Mobile number
- WhatsApp number
- Email (requires verification)
- Address fields (line 1, line 2, city, state, PIN)
- Blood group
- Emergency contact details

**Non-Editable Fields (grayed out):**
- Name (requires admin approval to change)
- Date of Birth
- Gender
- Membership Type
- Member ID

**Save Button:**
- "Save Changes" (primary, bottom)
- Validates fields
- Updates `members` table
- Shows success toast
- Navigates back to ProfileScreen

**Change Photo:**
- Tap edit photo button: Opens image picker
- Same crop flow as registration
- Uploads to storage, updates `members.photo_url`

---

## Admin App Implementation

### Navigation Structure
**Library:** React Navigation v6
**Pattern:** Bottom Tab Navigator (5 tabs)

**Main Stack Navigator:**
- Auth Stack (Login, Change Password)
- Main Tab Navigator (after authentication)
- Modal Screens (Create Event, Edit Member, etc.)

**Bottom Tab Navigator (5 tabs):**
1. **Dashboard** - Analytics, stats, quick actions (icon: grid/dashboard)
2. **Members** - Member list and management (icon: people)
3. **Events** - Events/trips management (icon: calendar)
4. **Scanner** - QR/NFC scanning for attendance (icon: scan/barcode)
5. **More** - Gallery moderation, settings, calendar, tools (icon: menu)

**Tab Bar Styling:** Same as Member app (dark mode, teal primary)

**Role-Based Access Control:**
- All screens check user permissions before rendering
- Use `user_profiles.permissions` JSONB field or `user_roles.permissions`
- If user lacks permission: Show "Access Denied" message
- Permissions:
  - `member_management` - View/edit members
  - `event_management` - Create/edit events
  - `financial_management` - View donations, configure payment
  - `gallery_moderation` - Approve/reject gallery uploads
  - `system_settings` - Modify branding, colors, trust info
  - `user_management` - Create/manage admin accounts

### Dashboard Screen

**Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/DashboardScreen.js` (new)

**Layout (scrollable):**

**1. Header:**
- Admin avatar (48px, circular)
- Greeting: "Welcome back, {adminName}"
- Role badge: "Super Admin" / "Partial Admin" / "View Only"
- Notification bell (top-right, with badge)

**2. Key Metrics Cards (2x2 grid):**
- Total Members (number, icon: people, tappable → MembersScreen)
- Upcoming Events (number, icon: calendar, tappable → EventsScreen)
- Pending Approvals (number for gallery moderation, icon: clock, tappable → ModerationScreen)
- This Month Donations (₹ amount, icon: rupee, tappable → FinanceScreen)

**3. Recent Activity Feed:**
- Section header: "Recent Activity"
- List of last 10 activities (avatar, action text, timestamp)
- Examples:
  - "Rahul Suranat registered for Varsitap 2025"
  - "New member joined: Priya Shah"
  - "Gallery item approved by Admin"
  - "Holiday marked: Mahavir Jayanti"
- Each item shows relevant icon and is tappable for details

**4. Quick Actions (horizontal scroll):**
- "Create Event" button (teal, opens CreateEventScreen)
- "Add Member" button (opens CreateMemberScreen)
- "Scan Attendance" button (opens ScannerScreen)
- "View Reports" button (opens ReportsScreen - web only feature, show message to use web)

**5. Upcoming Events Widget:**
- Section header: "Next 7 Days"
- List of next 3 events with date, title, registrations count
- "View All" button

**Pull-to-Refresh:** Reloads all dashboard data

### Members Management

**Members List Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/MembersListScreen.js` (new)

**Header Actions:**
- Search bar: Filter by name, ID, phone, email
- Filter button: Opens filter sheet (by membership type, registration date)
- Add button (top-right, "+" icon): Opens CreateMemberScreen

**List View Options (toggle buttons):**
- List view (default): Shows cards with avatar, name, ID, type
- Grid view: Shows grid of avatars with names

**Member Card (list item):**
- Avatar (56px, circular)
- Name (bold, 16px)
- Member ID (below name, 12px, gray)
- Membership type badge (colored by type)
- Phone number (icon + text)
- Status indicator (dot): Active (green) / Inactive (gray)
- Tap card: Opens MemberDetailScreen

**Sorting Options (dropdown top-right):**
- Recently Added
- Name (A-Z)
- Name (Z-A)
- Member ID

**Infinite Scroll:** Load 50 members at a time

**Swipe Actions (iOS style):**
- Right swipe: Quick edit (opens EditMemberScreen)
- Left swipe: Deactivate/Delete (confirmation dialog)

**Member Detail Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/MemberDetailScreen.js` (new)

**Layout (scrollable, tabs at top):**

**Tab 1: Profile**
- Large avatar (120px)
- Name and Member ID
- Membership type badge
- QR code preview (tap to enlarge)
- Personal information (all fields from registration)
- Edit button (floating, bottom-right): Opens EditMemberScreen

**Tab 2: Activity**
- Registered events list (title, date, status)
- Attendance history (event name, date, attended yes/no)
- Donations history (amount, date, transaction ID)
- Messages sent count
- Gallery uploads count

**Tab 3: Audit Log**
- Timeline of all changes to this member record
- Each entry: Action, admin who made change, timestamp
- Examples: "Profile updated by Admin", "Photo changed", "Deactivated by Super Admin"

**Action Menu (3-dot menu, top-right):**
- Send Message (opens chat with this member)
- Send Notification (opens notification composer)
- Deactivate Account (toggle active status)
- Reset Password (sends reset email)
- Delete Account (requires super admin, confirmation dialog)

**Create/Edit Member Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/CreateMemberScreen.js` (new)

**Form:** Same fields as member registration flow, but admin fills it
**Additional Fields (admin-only):**
- Membership Status (dropdown: Active/Inactive/Suspended)
- Notes (textarea, admin-only notes about member, max 1000 chars)
- Created by (auto-filled with admin name, read-only)

**Submit:**
- Validate all fields
- If create: Generate Member ID, insert into `members` table
- If edit: Update `members` table, log change in audit log
- Send welcome email if new member
- Navigate back to MembersListScreen

### Admin User Management

**Admin Users Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/AdminUsersScreen.js` (new)

**Access:** From "More" tab → "Admin Management"
**Permission Required:** `user_management` (only Super Admin has this)

**Header:**
- Title: "Admin Users"
- Add button (top-right, "+ New Admin"): Opens CreateAdminScreen

**List of Admin Users (cards):**
- Avatar (56px)
- Name (bold)
- Email (gray)
- Role badge: "Super Admin" / "Admin" / "Partial Admin" / "View Only"
- Status: Active/Inactive (toggle switch)
- Last login timestamp
- Tap card: Opens AdminDetailScreen

**Create Admin Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/CreateAdminScreen.js` (new)

**Form Fields:**
- Full Name (required, max 100 chars)
- Email (required, valid email, will be used for login)
- Role (required, dropdown):
  - Super Admin (all permissions)
  - Admin (most permissions except system settings and user management)
  - Partial Admin (custom permissions - opens permission selector)
  - View Only (read-only access)
- Phone Number (optional, 10 digits)
- Temporary Password (auto-generated, shown to admin to share with new user)
- Permissions (if Partial Admin selected):
  - Checkboxes for each permission:
    - Member Management
    - Event Management
    - Financial Management
    - Gallery Moderation
    - Calendar Management

**Submit Button:**
- "Create Admin Account"
- Validates fields
- Calls backend function `create_admin_user(email, role, permissions)`
- Creates auth account in Supabase with `needs_password_change: true`
- Shows success with temporary password (admin must share this)
- Navigate back to AdminUsersScreen

**Edit Admin Screen:**
- Same fields as create, but can edit role/permissions
- Cannot edit super admin (rahulsuranat@gmail.com) - show read-only
- Can reset password (sends reset email)
- Can deactivate admin (toggle)

### Events & Trips Management

**Events List Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/EventsListScreen.js` (new)

**Top Tabs (2 tabs):**
- Events
- Trips

**Header Actions:**
- Create button (top-right, "+ New Event"): Opens CreateEventScreen
- Filter: All / Upcoming / Past / Draft
- Search bar

**Event Card (list item):**
- Event image (thumbnail, 80px square)
- Title (bold)
- Date range
- Location
- Registrations count / capacity (e.g., "45/100")
- Status badge: Published / Draft / Completed
- 3-dot menu:
  - Edit (opens EditEventScreen)
  - Duplicate (creates copy)
  - Delete (confirmation dialog)
  - View Registrations (opens RegistrationsListScreen)
  - Mark as Completed (for past events)

**Create Event Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/CreateEventScreen.js` (new)

**Form (multi-step or single scrollable):**

**Basic Information:**
- Title (required, max 200 chars)
- Type (dropdown: Religious Event, Ceremony, Workshop, Pilgrimage, Social Event)
- Description (textarea, max 2000 chars)
- Event image (upload, same flow as member photo upload)

**Date & Location:**
- Start Date (date picker, required)
- End Date (date picker, required, must be >= start date)
- Start Time (time picker)
- End Time (time picker)
- Location (text input, max 200 chars)
- Map Location (optional, lat/long or address lookup)

**Capacity & Registration:**
- Max Capacity (number, 1-10000)
- Registration Deadline (date picker, must be before start date)
- Allow Walk-in Registration (toggle)
- Target Audience (multi-select checkboxes):
  - All Members
  - Tapasvi Only
  - Karyakarta Only
  - Shraman Only
  - Shravak Only
  - General Members

**Dynamic Pricing:**
- Section header: "Fees by Membership Type"
- List of membership types with input fields for each:
  - Tapasvi: ₹ [input] (default 0)
  - Karyakarta: ₹ [input]
  - Shraman: ₹ [input]
  - Shravak: ₹ [input]
  - General Member: ₹ [input]
- Toggle: "Free Event" (sets all to 0 and disables inputs)

**Itinerary (for trips):**
- Add day-by-day schedule
- For each day:
  - Day number (auto)
  - Description (textarea)
  - Activities list (add/remove items)
- Upload itinerary PDF (optional, stored in `trip_documents`)

**Additional Settings:**
- Published (toggle: if off, event is draft and not visible to members)
- Enable Comments (toggle: allow members to comment on event)
- Send Notification on Publish (toggle: push notification to all eligible members)

**Submit Buttons:**
- "Save as Draft" (saves with published: false)
- "Publish Event" (saves with published: true, sends notifications if enabled)

**Validation:**
- Title required
- Dates valid (end >= start, deadline before start)
- At least one target audience selected
- If paid event, at least one fee > 0

**Registrations List Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/RegistrationsListScreen.js` (new)

**Purpose:** View all members registered for a specific event

**Header:**
- Event title
- Total registrations count
- Export button: "Export to CSV" (downloads list)

**Filter Bar:**
- Payment Status: All / Paid / Pending / Free
- Attendance: All / Attended / Not Attended / Unmarked
- Search: By member name or ID

**Registration Card (list item):**
- Member avatar and name
- Member ID
- Registration date
- Payment status badge: Paid (green) / Pending (yellow) / Free (gray)
- Attendance status (if event completed): Checkmark (attended) / X (not attended) / - (unmarked)
- Special requests text (if provided, expandable)
- Tap card: Opens member detail

**Bulk Actions (select mode):**
- Select multiple registrations (checkbox on each card)
- Actions bar appears at bottom:
  - Mark All as Paid
  - Mark All as Attended
  - Send Notification to Selected
  - Export Selected

### Logistics Assignment Tool

**Travel Assignments Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/TravelAssignmentsScreen.js` (new)

**Access:** From event detail → "Assign Logistics" button (only for trips)

**Purpose:** Assign room/seat/PNR details to registered attendees

**Header:**
- Trip title
- Total registered: [count]
- Assigned: [count] / [total]
- Progress bar showing assignment completion

**List of Registered Members:**
- Each card shows:
  - Avatar and name
  - Member ID
  - Current assignments (if any): Room, Seat, PNR
  - Edit button: Opens assignment form

**Assignment Form (modal or side sheet):**
**Fields:**
- Room Number (text input, alphanumeric, max 20 chars)
- Bus Seat Number (text input, optional)
- Train Seat Number (text input, optional)
- Flight Ticket Number (text input, optional)
- PNR Number (text input, alphanumeric, max 20 chars)
- Notes (textarea, max 500 chars, admin-only)

**Submit:**
- Validates at least one field filled
- Inserts/updates record in `trip_assignments` table
- Sends push notification to member: "Your travel details for {tripName} have been updated"
- Shows success toast
- Closes modal and updates list

**Bulk Assignment Mode:**
- Upload CSV with columns: MemberID, Room, BusSeat, TrainSeat, FlightTicket, PNR
- Parse CSV and batch insert/update assignments
- Show summary: "Assigned 45 members, 3 errors"
- Download error report if any failures

### Scanner / Attendance Tracking

**Scanner Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/ScannerScreen.js` (new)

**Purpose:** Scan QR codes for event attendance and item distribution

**Layout:**

**Camera View (full screen):**
- Live camera feed for QR scanning
- Overlay: Transparent with white square frame (scan area guide)
- Use react-native-vision-camera with QR code detection

**Scan Mode Selector (top, tabs):**
- Attendance Mode (default)
- Distribution Mode

**Event/Item Selector (below mode tabs):**
- If Attendance Mode: Dropdown to select event
- If Distribution Mode: Dropdown to select item type (e.g., "Gift Bag", "Prasad", "Certificate")

**Bottom Info Panel (semi-transparent overlay):**
- Last scanned: Member name and ID
- Today's count: [number] scanned
- Status indicator: Ready to scan (green) / Processing (yellow) / Error (red)

**Scan Flow (Attendance Mode):**
1. Admin selects event from dropdown
2. Points camera at member's QR code (from ID card)
3. QR data parsed: `MEMBER:{memberID}:{name}`
4. Query: Check if member registered for selected event (`event_registrations` table)
5. If registered:
   - Mark attendance: Update `event_registrations.attended = true` or insert to `trip_attendance`
   - Vibrate + success sound
   - Show green checkmark animation with member name
   - Push notification to member: "Attendance marked for {eventName}"
6. If not registered:
   - Show error: "Member not registered for this event"
   - Red X animation
   - Option: "Register Now" (quick registration flow)
7. If already marked:
   - Show info: "Already marked attended"
   - Yellow info icon

**Scan Flow (Distribution Mode):**
1. Admin selects item type from dropdown
2. Scans member QR code
3. Record distribution in `item_distributions` table (item_type, member_id, event_id, distributed_by, timestamp)
4. Success feedback (vibration, animation)
5. Push notification to member: "You received {itemType} at {eventName}"

**Manual Entry Option:**
- Button at bottom: "Enter Member ID Manually"
- Opens input dialog
- Type member ID → Same flow as QR scan

**History (swipe up from bottom):**
- Sheet showing today's scans
- List: Member name, time, event/item
- Search and filter options

**NFC Support (future enhancement):**
- Same flow but triggered by NFC tag scan instead of QR
- Use react-native-nfc-manager

### Gallery Moderation

**Gallery Moderation Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/GalleryModerationScreen.js` (new)

**Access:** From "More" tab → "Gallery Moderation"
**Permission Required:** `gallery_moderation`

**Purpose:** Review user-uploaded media before publishing

**Filter Tabs:**
- Pending Review (default, count badge)
- Approved
- Rejected

**Pending Review List:**
- Grid view (2 columns) or list view (toggle)
- Each item shows:
  - Media thumbnail (image/video)
  - Uploader avatar and name
  - Upload timestamp
  - Caption/title (truncated)
  - Tap item: Opens full-screen review modal

**Review Modal:**
- Full-screen media viewer (zoomable for images, playable for videos)
- Caption/title (full text)
- Uploader info: Name, member ID, membership type
- Tagged event (if any)
- Metadata: Upload date, file size, dimensions

**Action Buttons (bottom):**
- Approve (green button):
  - Updates `gallery_items.is_public = true`
  - Moves media from `gallery-media/pending/` to `gallery-media/public/` in storage
  - Sends push notification to uploader: "Your post has been approved!"
  - Closes modal, moves to next item
- Reject (red button):
  - Opens rejection reason input (textarea, required)
  - Updates `gallery_items.moderation_status = 'rejected'`, stores reason
  - Sends push notification with reason: "Your post was not approved. Reason: {reason}"
  - Closes modal, moves to next item
- Report (flag icon, if content is inappropriate):
  - Marks as reported, logs in audit
  - Deletes from storage
  - Sends warning notification to uploader

**Keyboard Shortcuts (for efficiency):**
- A key: Approve
- R key: Reject
- Arrow right/left: Navigate between items

**Bulk Actions:**
- Select multiple (checkbox mode)
- Approve All Selected
- Reject All Selected

### Calendar Management

**Calendar Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/CalendarScreen.js` (new)

**Access:** From "More" tab → "Calendar Management"
**Permission Required:** `calendar_management` (admin or partial admin)

**Purpose:** Manage religious calendar, Upavas/Biyashna schedule, holidays

**Layout:**

**Calendar View (month view):**
- Standard month calendar (use react-native-calendars)
- Today highlighted in teal
- Dates with events/holidays marked with colored dots:
  - Teal dot: Event/trip
  - Orange dot: Upavas (fasting day)
  - Yellow dot: Biyashna
  - Red dot: Holiday
- Tap date: Shows details for that day

**Day Detail Sheet (bottom sheet when date tapped):**
- Date header
- List of items on that date:
  - Events (with registration counts)
  - Upavas/Biyashna (default or override)
  - Holidays (if marked)
- Actions:
  - Mark as Holiday (toggle, opens holiday form)
  - Override Upavas/Biyashna (admin override of default schedule)

**Mark Holiday Form (modal):**
- Holiday Name (text input, e.g., "Mahavir Jayanti")
- Description (textarea, optional)
- Send Notification (checkbox, default checked)
- Target Audience (checkboxes):
  - All Members
  - Tapasvi Only
  - Karyakarta Only

**Submit:**
- Inserts holiday into `calendar_holidays` table (date, name, description)
- If "Send Notification" checked:
  - Immediately sends push notification to selected audience: "Holiday: {name} on {date}"
- Shows success toast
- Calendar updates to show red dot on date

**Upavas/Biyashna Override:**
- Purpose: Admin can mark specific dates as Upavas or Biyashna, overriding default calculation
- Form:
  - Type (dropdown: Upavas / Biyashna)
  - Notes (textarea, why override)
- Submit: Updates `calendar_overrides` table
- Calendar updates to show orange/yellow dot

**Upcoming View (tab):**
- List view of next 30 days with events/holidays
- Scrollable, shows all scheduled items chronologically

### System Settings

**System Settings Screen:** `mahaveer-bhavan/admin-app/src/screens/Admin/SystemSettingsScreen.js` (new)

**Access:** From "More" tab → "System Settings"
**Permission Required:** `system_settings` (Super Admin only)

**Layout: Sections (scrollable list)**

**1. Organization Branding:**
- Trust Name (text input, max 100 chars)
- Logo (image upload, square, max 1MB)
  - Shows current logo preview
  - Upload button: Choose file, uploads to `branding/` storage bucket
- Primary Color (color picker):
  - Current: #0F766E (teal) shown as color swatch
  - Tap swatch: Opens color picker
  - Changes apply to both apps globally (updates constants)
- Save button: Updates `system_settings` table

**2. Contact Information:**
- Primary Email (email input)
- Primary Phone (10 digits)
- Address (textarea, full address)
- Website URL (text input, valid URL)
- Save button

**3. Payment Gateway Configuration:**
- Razorpay API Key (text input, secure, masked)
- Razorpay Secret Key (text input, secure, masked)
- Test Mode (toggle: enables Razorpay test environment)
- Bank Details (for offline payments):
  - Bank Name (text input)
  - Account Number (text input)
  - IFSC Code (text input)
  - Account Holder Name (text input)
- Save button (encrypted storage in backend)

**4. Notification Settings:**
- Firebase Server Key (text input, secure, for push notifications)
- Email Service API Key (text input, for email sending)
- WhatsApp Business API (text input, if integrated)
- Default notification preferences (checkboxes):
  - Send email on registration
  - Send push on event reminder (1 day before)
  - Send SMS for important updates
- Save button

**5. App Behavior:**
- Maintenance Mode (toggle: shows "Under Maintenance" to all users except super admin)
- Require Photo on Registration (toggle, default true)
- Auto-Approve Gallery Uploads (toggle, default false - requires moderation)
- Max File Upload Size (dropdown: 5MB / 10MB / 20MB / 50MB)
- Save button

**6. Audit & Logs:**
- View Audit Logs button: Opens AuditLogsScreen
- Export System Data button: Generates full database backup
- Clear Cache button: Clears app cache for all users

**Real-time Updates:**
- When branding (name, logo, color) is saved:
  - Update `system_settings` table
  - Trigger realtime event to all connected apps
  - Member and Admin apps listen for this event and reload settings
  - UI updates immediately without app restart

---

## Web Admin Interface Implementation

**Location:** `mahaveer-bhavan/web-admin-interface/` (new React app)

**Purpose:** Advanced admin tools requiring larger screen (data import/export, complex reports)

**Tech Stack:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (dark mode, teal theme matching mobile)
- React Router
- React Query (data fetching)
- Supabase JS Client
- xlsx library (Excel import/export)

### Navigation Structure

**Layout:** Sidebar navigation + main content area

**Sidebar Menu:**
- Dashboard (overview)
- Data Import (members, events)
- Data Export (members, events, donations, attendance)
- Reports (financial, attendance, member growth)
- Audit Logs (system-wide activity)
- Settings (same as mobile System Settings)

**Authentication:**
- Same login as mobile admin app
- Role check: Only admins (not members) can access
- Session management with Supabase Auth

### Data Import Screen

**Page:** `web-admin-interface/src/pages/DataImport.tsx`

**Purpose:** Bulk import members, events, donations via CSV/Excel

**Layout:**

**Import Type Selector (tabs):**
- Members
- Events
- Donations

**Members Import Tab:**

**Step 1: Upload File**
- Drag-and-drop zone or file picker
- Supported formats: CSV, XLSX
- Max file size: 10MB
- Shows preview of first 10 rows in table

**Required Columns (template downloadable):**
- Full Name (required)
- Email (required, unique)
- Mobile (required, 10 digits)
- Date of Birth (required, format: DD/MM/YYYY)
- Gender (required: Male/Female/Other)
- Membership Type (required: Tapasvi/Karyakarta/Shraman/Shravak/General Member)
- Address Line 1, City, State, PIN Code
- Emergency Contact Name, Emergency Contact Number, Relation
- Blood Group (optional)
- WhatsApp Number (optional)

**Step 2: Validation**
- System validates each row:
  - Check required fields present
  - Validate email format and uniqueness
  - Validate mobile format (10 digits starting 6-9)
  - Validate DOB format and age 18+
  - Validate membership type from allowed values
- Shows validation results:
  - Valid rows: [count] (green)
  - Errors: [count] (red) with details table (row number, field, error message)
- Options:
  - Download error report (CSV with error details)
  - Fix errors and re-upload
  - Proceed with valid rows only (skip errors)

**Step 3: Import Options**
- Auto-generate Member IDs (checkbox, default checked)
- Send welcome emails (checkbox, default unchecked for bulk)
- Create auth accounts (checkbox: if checked, generates temporary passwords)
- Default password policy (dropdown: Auto-generate / Set common / Email link)

**Step 4: Execute**
- "Import" button starts process
- Progress bar shows: [X] of [Total] imported
- Real-time log of actions:
  - "Row 1: Created member M-TAP-001"
  - "Row 5: Error - Email already exists"
- On completion:
  - Success summary: "Imported 95 members, 5 errors"
  - Download success report (CSV: Member ID, Name, Email, Temp Password if applicable)
  - Download error report (if any errors)

**Events/Donations Import:** Similar flow with relevant columns

### Data Export Screen

**Page:** `web-admin-interface/src/pages/DataExport.tsx`

**Purpose:** Export data for analysis, backups, reporting

**Export Type Selector (tabs):**
- Members
- Events
- Registrations
- Donations
- Attendance
- Gallery Items
- Messages (anonymized)

**Members Export Tab:**

**Filter Options:**
- Membership Type (multi-select: All / specific types)
- Registration Date Range (date pickers)
- Status (Active / Inactive / All)
- Include Sensitive Data (checkbox, requires super admin):
  - If checked: Includes email, phone, address
  - If unchecked: Exports ID, name, type, registration date only

**Column Selection:**
- Checkboxes for each field:
  - Member ID, Name, DOB, Gender, Blood Group
  - Email, Mobile, WhatsApp
  - Address, City, State, PIN
  - Membership Type, Registration Date
  - Emergency Contact details
  - Statistics: Events attended, donations total
- Select All / Deselect All buttons

**Export Format:**
- Dropdown: CSV / Excel (XLSX)

**Export Button:**
- "Generate Export" button
- Shows progress: "Generating export..."
- Downloads file: `members_export_YYYY-MM-DD.csv`

**Pre-built Reports (quick export buttons):**
- "All Active Members" (all fields, active only)
- "Tapasvi Members Only" (filtered by type)
- "Members with Birthdays This Month"
- "Recently Joined (Last 30 Days)"
- Each button: One-click export with predefined filters

**Events/Registrations Export:**
- Similar filters (date range, event type, status)
- Includes: Event details, registration counts, revenue

**Donations Export:**
- Filters: Date range, payment method, amount range
- Includes: Donor name, amount, date, transaction ID, receipt number
- Total amount shown at bottom

**Attendance Export:**
- Filters: Event, date range
- Includes: Member ID, name, event, attendance status, scan timestamp

### Reports Dashboard

**Page:** `web-admin-interface/src/pages/Reports.tsx`

**Purpose:** Visual analytics and insights

**Report Types (cards):**

**1. Member Growth Report:**
- Line chart: Members joined over time (monthly)
- Breakdown by membership type (stacked bar chart)
- Total members count (large number)
- Date range selector (filter)

**2. Financial Report:**
- Total donations (large number, ₹ formatted)
- Donations over time (line chart)
- Donations by payment method (pie chart: Online, Offline, Cash)
- Top donors list (table: Name, amount, count)

**3. Event Attendance Report:**
- Events list with attendance %
- Attendance trends (chart)
- Most attended events (bar chart)

**4. Gallery Engagement Report:**
- Total posts (public)
- Likes/Comments trends
- Top contributors (members with most uploads)

**Export Button for Each Report:** Downloads as PDF or Excel

### Audit Logs Viewer

**Page:** `web-admin-interface/src/pages/AuditLogs.tsx`

**Purpose:** System-wide activity tracking for security and compliance

**Layout:** Data table with filters

**Columns:**
- Timestamp (sortable)
- Admin User (name + email)
- Action Type (e.g., "Member Created", "Event Published", "Settings Updated")
- Target (e.g., Member ID, Event name)
- Details (expandable, shows before/after values if edit)
- IP Address

**Filters:**
- Date Range (date pickers)
- Admin User (dropdown of all admins)
- Action Type (multi-select: Create, Update, Delete, Login, Logout, Export, Import)
- Search (free text search in details)

**Table Features:**
- Pagination (50 rows per page)
- Sortable columns
- Export logs (CSV)

---

## Cross-Cutting Features & Infrastructure

### Push Notifications System

**Implementation:** Firebase Cloud Messaging (FCM)

**Setup (both apps):**
- Install: `@react-native-firebase/app` and `@react-native-firebase/messaging`
- iOS: Configure APNs certificates, add GoogleService-Info.plist
- Android: Add google-services.json
- Request permission on app launch (iOS) or first use (Android)

**Token Management:**
- On app launch: Get FCM token via `messaging().getToken()`
- Store token in `user_profiles.fcm_token` field (update on app open)
- Handle token refresh: Listen to `messaging().onTokenRefresh()`, update database

**Notification Types:**

**1. Event Notifications:**
- Trigger: Event published, event reminder (1 day before), registration confirmed
- Payload: `{ type: 'event', eventId, title, body, action: 'open_event' }`
- On tap: Navigate to EventDetailScreen with eventId

**2. Message Notifications:**
- Trigger: New message received while app in background
- Payload: `{ type: 'message', senderId, senderName, conversationId, body: message preview }`
- On tap: Navigate to ChatScreen with conversationId

**3. Gallery Notifications:**
- Trigger: Upload approved/rejected, new like/comment on user's post
- Payload: `{ type: 'gallery', action: 'approved'/'rejected'/'liked', itemId, body }`
- On tap: Navigate to GalleryScreen, open specific post

**4. Admin Notifications:**
- Trigger: New registration, pending moderation, holiday marked
- Payload: `{ type: 'admin', action, targetId, body }`
- On tap: Navigate to relevant admin screen

**5. System Notifications:**
- Trigger: Password changed, account updated, maintenance mode
- Payload: `{ type: 'system', body }`
- On tap: Open relevant settings screen

**Notification Handling:**

**Foreground (app open):**
- Listen: `messaging().onMessage(remoteMessage => { ... })`
- Show in-app banner/toast (use react-native-flash-message)
- Do NOT show native notification (handled by banner)
- Update badge count, play sound

**Background (app closed/minimized):**
- Native notification shows automatically
- On tap: `messaging().onNotificationOpenedApp(remoteMessage => { ... })`
- Parse payload, navigate to appropriate screen

**Notification Opened From Quit State:**
- Check: `messaging().getInitialNotification()`
- If exists: Parse and navigate after app fully loads

**Backend Integration:**
- Send notifications via Supabase edge function `notification-system`
- Function calls Firebase Admin SDK `admin.messaging().sendToToken()`
- Supports individual, batch, and topic-based notifications

**Notification Preferences:**
- Screen: NotificationSettingsScreen (in member app, under More → Settings)
- Toggles:
  - Event reminders (on/off)
  - Messages (on/off)
  - Gallery updates (on/off)
  - Administrative updates (on/off)
- Store preferences in `user_profiles.notification_preferences` JSONB field
- Backend checks preferences before sending

### Permissions System Enforcement

**Implementation Pattern:** Check permissions at multiple layers

**1. UI Layer (Hide/Show based on role):**
- Components use `useAuth()` hook to access current user
- Check `user.role` and `user.permissions`
- If user lacks permission: Don't render button/screen/feature

**Example:**
```
const { user } = useAuth()
const canManageEvents = user.permissions?.includes('event_management')

{canManageEvents && (
  <Button onPress={() => navigate('CreateEvent')}>
    Create Event
  </Button>
)}
```

**2. Screen/Route Layer (Navigation guard):**
- Before entering restricted screen, check permission
- If user lacks permission: Show "Access Denied" screen or redirect

**Example (React Navigation):**
```
<Stack.Screen
  name="SystemSettings"
  component={SystemSettingsScreen}
  listeners={({ navigation }) => ({
    beforeRemove: (e) => {
      if (!user.permissions?.includes('system_settings')) {
        e.preventDefault()
        Alert.alert('Access Denied', 'You do not have permission to access system settings')
      }
    }
  })}
/>
```

**3. API/Backend Layer (Supabase RLS):**
- Use Row Level Security policies on all tables
- Policies check `auth.uid()` and join to `user_profiles` to verify role/permissions
- Example policy on `members` table:
  - SELECT: Allow all authenticated users
  - INSERT/UPDATE/DELETE: Only users with `member_management` permission

**4. Edge Function Layer:**
- Edge functions check user role/permissions before executing sensitive operations
- Use helper function: `await checkUserPermission(authToken, 'event_management')`
- Return 403 if user lacks permission

**Permission Definitions (from user_roles table):**
- `member_management`: View, create, edit, delete members
- `event_management`: Create, edit, delete events and trips
- `financial_management`: View donations, configure payment gateway
- `gallery_moderation`: Approve/reject gallery uploads
- `system_settings`: Modify branding, colors, app settings
- `user_management`: Create/manage admin accounts
- `calendar_management`: Mark holidays, override Upavas schedule

### Error Handling & Offline Support

**Error Handling Strategy:**

**1. Network Errors:**
- Detect: Catch errors from Supabase calls (connection refused, timeout)
- User feedback: Show toast: "Network error. Please check your connection and try again."
- Action: Retry button, option to continue offline (if applicable)

**2. Authentication Errors:**
- Detect: 401 Unauthorized responses
- Action: Clear AsyncStorage, redirect to LoginScreen
- User feedback: "Your session has expired. Please login again."

**3. Permission Errors:**
- Detect: 403 Forbidden responses
- User feedback: "You don't have permission to perform this action."
- Action: Log to audit, prevent further attempts

**4. Validation Errors:**
- Detect: Form validation failures, 400 Bad Request from API
- User feedback: Show error messages inline below relevant fields (red text)
- Action: Highlight invalid fields, focus first error

**5. Server Errors:**
- Detect: 500 Internal Server Error responses
- User feedback: "Something went wrong. Please try again later."
- Action: Log error details to error tracking service (e.g., Sentry)

**Offline Support:**

**Library:** NetInfo from `@react-native-community/netinfo`

**Connection Monitoring:**
- Listen: `NetInfo.addEventListener(state => { ... })`
- On connection loss: Show persistent banner at top: "You are offline"
- On reconnect: Hide banner, sync pending changes

**Offline Capabilities:**

**Read-Only Data:**
- Use SWR or React Query with caching
- Cache API responses in AsyncStorage (for events, member profile, gallery posts)
- Stale-while-revalidate strategy: Show cached data, fetch fresh in background

**Write Operations:**
- Queue failed operations in AsyncStorage
- Example: User tries to post comment while offline
  - Save to local queue: `{ type: 'post_comment', data: { ... }, timestamp }`
  - Show in UI as "Pending"
- On reconnect: Process queue (POST to API)
  - On success: Remove from queue, update UI to "Sent"
  - On failure: Keep in queue, show retry option

**Offline Indicators:**
- Show offline badge on user avatar or in header
- Disable actions that require network (e.g., payments, photo uploads)
- Show "Offline Mode" message on screens that require data

### Real-Time Features (Supabase Realtime)

**Implementation:** Supabase Realtime subscriptions

**1. Messaging (Real-Time Chat):**
- Subscribe to `messages` table changes where `receiver_id = currentUserId`
- On INSERT: New message arrives, update conversation list, play sound
- On UPDATE: Message read status changed, update checkmarks
- Implementation: `supabase.channel('messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, handleNewMessage).subscribe()`

**2. Typing Indicators:**
- Subscribe to `typing_indicators` table
- On INSERT/UPDATE where conversation matches: Show "typing..." in chat header
- Auto-expire after 5 seconds (backend deletes old entries)

**3. Notifications:**
- Subscribe to `notifications` table where `member_id = currentUserId`
- On INSERT: Show in-app notification banner, update bell badge count
- On UPDATE (is_read changed): Update badge count

**4. Gallery Updates:**
- Subscribe to `gallery_items` table where `is_public = true`
- On INSERT: New post added to feed (prepend to list)
- On UPDATE (likes/comments): Update like count in real-time

**5. System Settings (Branding Changes):**
- Subscribe to `system_settings` table
- On UPDATE: Reload app theme (colors, logo, trust name)
- Show toast: "App settings updated"

**6. Event Registrations (Admin):**
- Admins subscribe to `event_registrations` for events they're viewing
- On INSERT: New registration appears in list in real-time
- Update registration count instantly

**Subscription Management:**
- Create subscriptions when screen mounts
- Clean up (unsubscribe) when screen unmounts
- Use React hooks pattern:

```
useEffect(() => {
  const subscription = supabase.channel('channel-name').on(...).subscribe()
  return () => { supabase.removeChannel(subscription) }
}, [dependencies])
```

### File Upload & Download Handling

**Upload Flow:**

**1. Image Upload (Profile Photos, Event Images, Gallery):**
- Library: react-native-image-picker (choose) + react-native-image-crop-picker (crop)
- Max size limits (check before upload):
  - Profile photos: 5MB
  - Event images: 10MB
  - Gallery posts: 50MB
- Compression: Use react-native-image-resizer to compress to target quality
- Upload to Supabase Storage: `supabase.storage.from(bucket).upload(path, file)`
- Progress: Show progress bar (use upload progress callback)
- Error handling: Retry up to 3 times on network error, then show failure message

**2. Document Upload (Itineraries, Certificates):**
- Library: react-native-document-picker
- Supported formats: PDF, DOC, DOCX
- Max size: 20MB
- Upload same as images but no compression

**3. Video Upload (Gallery):**
- Max size: 100MB (enforced client-side)
- Max duration: 5 minutes (check before upload)
- Show upload progress with percentage
- Background upload: Continue even if user navigates away (use background task library)

**Upload Progress UI:**
- Show progress bar with percentage (0-100%)
- Estimated time remaining (calculate from upload speed)
- Cancel button (aborts upload, cleans up partial file)

**Download Flow:**

**1. ID Card PDF/JPG Download:**
- Generate PDF using react-native-pdf-lib or generate JPG using react-native-view-shot
- Save to device: Use react-native-fs to write to Downloads (Android) or Documents (iOS)
- Permissions: Request WRITE_EXTERNAL_STORAGE on Android
- After save: Show toast with "Open" button to view file

**2. Document Download (Itineraries):**
- Fetch from Supabase Storage: `supabase.storage.from(bucket).download(path)`
- Save to device Downloads folder
- Show notification: "Downloaded: {filename}"
- Open file: Use Linking.openURL() or react-native-file-viewer

**3. Export Downloads (Admin Web):**
- Generate CSV/Excel in browser
- Use browser download API: `URL.createObjectURL()` and anchor tag with download attribute
- Filename includes timestamp: `members_export_2025-01-20.csv`

### Payment Processing (Razorpay Integration)

**Library:** react-native-razorpay

**Setup:**
- Install library, link native modules
- Configure Razorpay API key from system settings (fetched dynamically)

**Payment Flow (Event Registration):**

**1. Initiate Payment:**
- User completes registration form, selects "Online Payment"
- Calculate total amount: `fee × attendees`
- Create order via backend: POST to edge function `payment-processing/create-order`
  - Backend calls Razorpay API `orders.create({ amount, currency: 'INR', ... })`
  - Returns: `{ orderId, amount }`

**2. Open Razorpay Checkout:**
```javascript
const options = {
  key: razorpayKey, // from system settings
  amount: amountInPaise, // amount × 100
  currency: 'INR',
  name: trustName, // from system settings
  description: `Registration for ${eventName}`,
  order_id: orderId,
  prefill: {
    name: userName,
    email: userEmail,
    contact: userPhone
  },
  theme: { color: '#0F766E' } // teal primary
}

RazorpayCheckout.open(options)
  .then(handlePaymentSuccess)
  .catch(handlePaymentError)
```

**3. Handle Payment Success:**
- Razorpay returns: `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }`
- Verify signature in backend (security check)
- If valid:
  - Insert event registration with `payment_status: 'paid'`
  - Insert donation record with transaction details
  - Generate receipt number
  - Send confirmation email and push notification
  - Navigate to success screen

**4. Handle Payment Failure:**
- Show error: "Payment failed. Please try again."
- Options: Retry payment, choose different payment method
- Log failure in database for tracking

**Error Scenarios:**
- User cancels payment: Show "Payment cancelled" toast, return to form
- Network error during payment: Show retry option
- Invalid card/insufficient funds: Razorpay shows error, allow retry

**Payment History (Member):**
- Screen: PaymentHistoryScreen (under Profile → More)
- List of all payments: Amount, date, event name, transaction ID, receipt number
- Download receipt button (PDF generation)

**Payment Tracking (Admin):**
- Dashboard shows total revenue
- Financial report screen: Filter by date, event, payment method
- Export payments to CSV for accounting

### Localization (English/Hindi Support)

**Library:** react-i18next (or react-native-localize + i18n-js)

**Setup:**
- Define translation files:
  - `locales/en.json` - English translations
  - `locales/hi.json` - Hindi translations
- Initialize i18n with default language (English)
- Detect device language: Use react-native-localize to get device language, set as default if supported

**Translation Files Structure:**
```json
{
  "common": {
    "login": "Login",
    "logout": "Logout",
    "save": "Save",
    "cancel": "Cancel"
  },
  "member": {
    "dashboard": {
      "greeting": "Good morning, {{name}}",
      "stats": {
        "events": "Events Attended",
        "donations": "Donations Made"
      }
    }
  },
  "admin": {
    "members": {
      "title": "Members",
      "addMember": "Add Member"
    }
  }
}
```

**Usage in Components:**
```javascript
import { useTranslation } from 'react-i18next'

const DashboardScreen = () => {
  const { t } = useTranslation()
  return <Text>{t('member.dashboard.greeting', { name: userName })}</Text>
}
```

**Language Selector:**
- Location: Member app → More → Settings → Language
- Dropdown: English / हिंदी (Hindi)
- On change: Update i18n language, save preference to AsyncStorage
- App UI updates immediately

**Special Considerations:**
- Currency: Always show ₹ symbol (not localized)
- Dates: Format based on language (DD/MM/YYYY for both, but labels in respective language)
- Numbers: Use Indian numbering system (lakhs, crores) - `toLocaleString('en-IN')`
- RTL: Not required (both English and Hindi are LTR)

**Content Translation:**
- Static UI: Fully translated (buttons, labels, messages)
- Dynamic content (event titles, descriptions): Stored in language user created them in (no auto-translation)
- AI Assistant: Already supports both languages (auto-detects from user input)

### App Icons & Splash Screens

**Member App:**
- App name: "Mahaveer Bhavan" (or trust name from settings)
- Icon: Trust logo (from system settings, fallback to default icon)
- Colors: Teal gradient background

**Admin App:**
- App name: "Mahaveer Admin"
- Icon: Same trust logo with "Admin" badge overlay
- Colors: Teal gradient (darker variant)

**Splash Screen:**
- Both apps: Trust logo (large, centered) on dark background
- Loading indicator below logo (teal color)
- Duration: 1-2 seconds while checking auth status

**Icon Generation:**
- Use tool: react-native-make (generates all required icon sizes)
- Adaptive icons (Android): Foreground logo + background solid color
- iOS: Rounded square icon (all sizes from 1024x1024 master)

### Error Tracking & Analytics

**Error Tracking:** Sentry (or Firebase Crashlytics)

**Setup:**
- Install: `@sentry/react-native`
- Initialize with DSN in app entry point
- Auto-capture: Unhandled errors, promise rejections, native crashes
- Context: Attach user ID, role, screen name to error reports

**Analytics:** Firebase Analytics

**Track Events:**
- Screen views: Auto-tracked with `@react-native-firebase/analytics`
- User actions:
  - `login` (user_id, role)
  - `registration_started`, `registration_completed`
  - `event_viewed` (event_id), `event_registered` (event_id)
  - `message_sent`, `gallery_upload`, `donation_made`
  - `admin_action` (action_type, target)

**Custom Dashboards:**
- Firebase console: View DAU/MAU, screen flows, user retention
- Track conversion: Registration completion rate, event registration rate

### Security Measures

**1. API Security:**
- All API calls use Supabase client with auth token in header
- Tokens expire after 1 hour, auto-refresh handled by Supabase client
- If refresh fails: Logout user, clear AsyncStorage

**2. Sensitive Data Storage:**
- Never store plain passwords
- API keys (Razorpay, FCM) stored encrypted in Supabase secrets/environment variables
- User tokens stored in secure AsyncStorage (encrypted on iOS Keychain, Android Keystore)

**3. Input Validation:**
- Client-side: Validate all form inputs before submission
- Server-side: Re-validate in edge functions and database constraints
- Sanitize inputs: Prevent SQL injection (Supabase handles this), XSS (escape HTML in user content)

**4. File Upload Security:**
- Validate file types: Check MIME type and extension
- Scan for malicious content: Backend virus scan for uploaded files
- Storage access: Private buckets with signed URLs (expire after 1 hour)

**5. Rate Limiting:**
- API calls: Enforce limits in edge functions (e.g., AI chat 20 req/hour)
- Failed login attempts: Lock account after 5 failed attempts (15 min cooldown)
- Message sending: Prevent spam (max 100 messages/day per user)

**6. Audit Logging:**
- Log all sensitive actions: Login, password change, admin actions, data exports
- Store in `audit_logs` table: User, action, timestamp, IP address, details
- Retention: Keep logs for 1 year, then archive

---

## Database Schema Updates

### New Tables Required

**1. ai_conversations**
```
- id (uuid, primary key)
- user_id (uuid, foreign key to members)
- message (text, user's question)
- response (text, AI's answer)
- created_at (timestamp)
```

**2. gallery_likes**
```
- id (uuid, primary key)
- gallery_item_id (uuid, foreign key to gallery_items)
- member_id (uuid, foreign key to members)
- created_at (timestamp)
- UNIQUE constraint on (gallery_item_id, member_id)
```

**3. gallery_comments**
```
- id (uuid, primary key)
- gallery_item_id (uuid, foreign key to gallery_items)
- member_id (uuid, foreign key to members)
- comment_text (text, max 500 chars)
- created_at (timestamp)
```

**4. item_distributions**
```
- id (uuid, primary key)
- member_id (uuid, foreign key to members)
- event_id (uuid, foreign key to events, nullable)
- item_type (text, e.g., "Gift Bag", "Prasad")
- distributed_by (uuid, foreign key to user_profiles)
- distributed_at (timestamp)
```

**5. calendar_holidays**
```
- id (uuid, primary key)
- date (date)
- name (text)
- description (text, nullable)
- created_by (uuid, foreign key to user_profiles)
- created_at (timestamp)
```

**6. calendar_overrides**
```
- id (uuid, primary key)
- date (date)
- type (text, enum: 'Upavas', 'Biyashna')
- notes (text, nullable)
- created_by (uuid, foreign key to user_profiles)
- created_at (timestamp)
```

**7. system_settings**
```
- id (uuid, primary key)
- trust_name (text)
- logo_url (text, storage URL)
- primary_color (text, hex code)
- primary_email (text)
- primary_phone (text)
- address (text)
- website_url (text)
- razorpay_key_id (text, encrypted)
- razorpay_secret (text, encrypted)
- bank_name (text)
- bank_account_number (text)
- bank_ifsc (text)
- bank_account_holder (text)
- maintenance_mode (boolean, default false)
- require_photo_on_registration (boolean, default true)
- auto_approve_gallery (boolean, default false)
- max_upload_size_mb (integer, default 10)
- updated_by (uuid, foreign key to user_profiles)
- updated_at (timestamp)
```

**8. audit_logs**
```
- id (uuid, primary key)
- user_id (uuid, foreign key to user_profiles)
- action_type (text, e.g., "member_created", "event_published")
- target_type (text, e.g., "member", "event")
- target_id (uuid, nullable)
- details (jsonb, before/after values)
- ip_address (text)
- created_at (timestamp)
```

### Existing Table Updates

**gallery_items:**
- Add column: `moderation_status` (text, enum: 'pending', 'approved', 'rejected', default 'pending')
- Add column: `rejection_reason` (text, nullable)
- Add column: `reviewed_by` (uuid, foreign key to user_profiles, nullable)
- Add column: `reviewed_at` (timestamp, nullable)

**user_profiles:**
- Add column: `fcm_token` (text, nullable, for push notifications)
- Add column: `notification_preferences` (jsonb, nullable, stores enabled/disabled preferences)
- Add column: `language_preference` (text, enum: 'en', 'hi', default 'en')

**members:**
- Add column: `is_active` (boolean, default true, for soft delete/deactivation)

---

## Testing Strategy

### Manual Testing Checklist

**Member App:**
- [ ] Registration flow (all 4 steps, photo upload)
- [ ] Login with correct/incorrect credentials
- [ ] Force password change on first login
- [ ] Dashboard data loads correctly
- [ ] ID card displays and downloads (PDF/JPG)
- [ ] Gallery feed loads, like/comment works
- [ ] Upload media, check moderation queue (admin side)
- [ ] Messages: Send text, image, voice note, video
- [ ] VoIP call: Voice and video calling
- [ ] Events: View list, register, make payment
- [ ] View logistics after registration
- [ ] AI Assistant: Ask questions in English and Hindi
- [ ] Profile: Edit details, change photo
- [ ] Logout and re-login

**Admin App:**
- [ ] Login as admin
- [ ] Dashboard metrics display correctly
- [ ] Create member manually
- [ ] View member details, edit, deactivate
- [ ] Create admin user with different roles
- [ ] Create event with dynamic pricing
- [ ] View event registrations
- [ ] Assign logistics to trip registrants
- [ ] Scanner: Scan QR for attendance
- [ ] Scanner: Distribution mode
- [ ] Gallery moderation: Approve/reject
- [ ] Calendar: Mark holiday, send notification
- [ ] System settings: Change logo, color (verify both apps update)
- [ ] Logout

**Web Admin:**
- [ ] Login, verify admin-only access
- [ ] Import members via CSV
- [ ] Export members, donations, attendance
- [ ] View reports (charts render correctly)
- [ ] Audit logs display and filter works

### Edge Cases to Test

**1. Network Issues:**
- [ ] Upload photo with poor connection (retry logic)
- [ ] Submit form offline (queue for later)
- [ ] Reconnect and auto-sync queued operations

**2. Permissions:**
- [ ] View-only admin cannot edit anything
- [ ] Partial admin can only access assigned sections
- [ ] Member cannot access admin screens

**3. Data Validation:**
- [ ] Invalid email format rejected
- [ ] Age < 18 rejected
- [ ] Duplicate email/mobile rejected
- [ ] Event registration after deadline blocked

**4. Payment Scenarios:**
- [ ] Successful payment flow
- [ ] User cancels payment
- [ ] Payment fails (insufficient funds)
- [ ] Network error during payment

**5. Concurrent Updates:**
- [ ] Two admins edit same member simultaneously (last write wins, show warning)
- [ ] Gallery item approved by admin A while admin B viewing (real-time update)

**6. File Uploads:**
- [ ] Upload oversized file (blocked with error)
- [ ] Upload invalid file type (rejected)
- [ ] Upload during offline (queued for later)

---

## Deployment Instructions

### Member App Deployment

**Android:**
1. Update version in `android/app/build.gradle`: `versionCode`, `versionName`
2. Generate release keystore (if first time): `keytool -genkeypair -v -keystore release.keystore ...`
3. Build APK: `cd android && ./gradlew assembleRelease`
4. Build AAB (for Play Store): `cd android && ./gradlew bundleRelease`
5. Output: `android/app/build/outputs/apk/release/app-release.apk` or `bundle/release/app-release.aab`
6. Upload to Google Play Console, submit for review

**iOS:**
1. Update version in `ios/MahaveerBhavan/Info.plist`: `CFBundleShortVersionString`, `CFBundleVersion`
2. Open Xcode: `open ios/MahaveerBhavan.xcworkspace`
3. Select scheme: "Release"
4. Archive: Product → Archive
5. Distribute: Organizer → Distribute App → App Store Connect
6. Upload to App Store Connect, submit for review

### Admin App Deployment

Same process as Member App but with admin-app folder and different app identifier

### Web Admin Interface Deployment

**Build:**
1. Install dependencies: `cd web-admin-interface && npm install`
2. Build production: `npm run build`
3. Output: `dist/` folder with static files

**Deploy Options:**

**Option 1: Vercel (Recommended)**
1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `vercel --prod`
3. Set environment variables in Vercel dashboard (Supabase URL, keys)

**Option 2: Netlify**
1. Connect Git repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables in Netlify dashboard

**Option 3: Self-hosted (VPS)**
1. Upload `dist/` folder to server
2. Configure Nginx/Apache to serve static files
3. SSL certificate via Let's Encrypt
4. Set environment variables on server

### Environment Variables

**Required for all deployments:**

**Member & Admin Apps:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `RAZORPAY_KEY` - Razorpay API key (fetched from system_settings at runtime)
- `GOOGLE_CLIENT_ID` - For Google OAuth (if using)

**Web Admin:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Supabase (Backend):**
- `OPENROUTER_API_KEY` - For AI chat (already configured in edge functions)
- `FCM_SERVER_KEY` - Firebase Cloud Messaging
- `RAZORPAY_SECRET` - Stored encrypted in database, not in env

### Post-Deployment Checklist

- [ ] Create super admin account (rahulsuranat@gmail.com)
- [ ] Configure system settings (trust name, logo, colors)
- [ ] Configure payment gateway (Razorpay keys, bank details)
- [ ] Setup Firebase for push notifications
- [ ] Test end-to-end flows on production
- [ ] Monitor error logs (Sentry) for first 24 hours
- [ ] Prepare user documentation/training materials

---

## Implementation Priorities & Sequencing

### Phase 1: Foundation (Critical Infrastructure)
**Estimated Effort:** 2-3 weeks

**Priority:** Must be completed first

1. **Platform Setup:**
   - Initialize iOS folders for both apps (`npx react-native run-ios`)
   - Setup Web admin React app with Vite
   - Configure all native dependencies (camera, pdf, image picker)

2. **Theme System:**
   - Update color constants to teal (#0F766E) and dark mode
   - Create shared theme utilities
   - Update existing components with new theme

3. **Authentication & Routing:**
   - Implement force password change flow
   - Setup role-based navigation guards
   - Create super admin initialization migration
   - Test cross-role access blocking

4. **Database Schema Updates:**
   - Create 8 new tables (ai_conversations, gallery_likes, etc.)
   - Add columns to existing tables (moderation_status, fcm_token, etc.)
   - Setup RLS policies for new tables

5. **Navigation Structure:**
   - Implement bottom tab navigators for both apps
   - Setup stack navigators for auth and modal screens
   - Configure navigation theme (dark mode)

### Phase 2: Member App Core Features
**Estimated Effort:** 3-4 weeks

**Dependency:** Phase 1 complete

1. **Registration Flow:**
   - 4-step multi-form with validation
   - Photo upload with cropping (react-native-image-crop-picker)
   - Member ID generation integration
   - Email welcome notifications

2. **Dashboard Enhancement:**
   - Update existing DashboardHome with new layout
   - Add ID card preview component
   - Integrate stats and quick actions
   - Implement pull-to-refresh

3. **Digital ID Card:**
   - Card design with QR code
   - PDF generation (react-native-pdf-lib)
   - JPG export (react-native-view-shot)
   - Download to device with permissions

4. **Profile & Settings:**
   - Profile screen with stats
   - Edit profile with validation
   - Change password screen
   - Notification settings

5. **Events Module:**
   - Events list with filters
   - Event detail with dynamic pricing
   - Registration form with payment integration
   - Success screen with QR code

### Phase 3: Social & Communication Features
**Estimated Effort:** 4-5 weeks

**Dependency:** Phase 2 complete

1. **Gallery / Social Feed:**
   - Instagram-style feed with infinite scroll
   - Like/comment/share functionality
   - User upload with moderation queue
   - Full-screen media viewer

2. **Messaging System:**
   - Conversation list with real-time updates
   - Chat screen with multiple message types
   - Image/video/audio message support
   - Voice notes with waveform
   - Message reactions
   - Typing indicators

3. **VoIP Calling:**
   - Voice and video call screens
   - Integration with @videosdk.live or Agora
   - Call notifications
   - Native call UI (react-native-callkeep)

4. **AI Assistant:**
   - Chat interface
   - Integration with existing jainism-chat edge function
   - Quick suggestions
   - Chat history with pagination

### Phase 4: Admin App Implementation
**Estimated Effort:** 4-5 weeks

**Dependency:** Phase 1 complete, can run parallel to Phase 2-3

1. **Dashboard & Members:**
   - Admin dashboard with metrics
   - Members list with search/filter
   - Member detail with tabs
   - Create/edit member forms
   - Admin user management

2. **Events & Trips Management:**
   - Events list for admin
   - Create event with dynamic pricing
   - Registrations list with bulk actions
   - Logistics assignment tool (mobile + CSV upload)

3. **Scanner & Attendance:**
   - Camera-based QR scanner
   - Attendance mode implementation
   - Distribution tracking mode
   - Manual entry option
   - Scan history

4. **Gallery Moderation:**
   - Pending review queue
   - Full-screen review modal
   - Approve/reject with notifications
   - Bulk actions

5. **Calendar & System Settings:**
   - Calendar view with event markers
   - Holiday marking with notifications
   - Upavas/Biyashna overrides
   - System settings (all sections)
   - Real-time branding updates

### Phase 5: Web Admin Interface
**Estimated Effort:** 2-3 weeks

**Dependency:** Phase 4 complete (or can overlap)

1. **Setup & Authentication:**
   - Vite + React + TypeScript setup
   - Tailwind dark mode theme
   - Auth integration with Supabase
   - Sidebar navigation

2. **Data Import/Export:**
   - CSV/Excel import with validation
   - Members, events, donations import
   - Multi-format export (CSV/XLSX)
   - Pre-built report exports

3. **Reports Dashboard:**
   - Member growth charts
   - Financial reports
   - Attendance analytics
   - Gallery engagement stats

4. **Audit Logs:**
   - Filterable table
   - Export functionality
   - Detailed activity tracking

### Phase 6: Cross-Cutting & Polish
**Estimated Effort:** 2-3 weeks

**Dependency:** Phases 2-5 complete

1. **Push Notifications:**
   - FCM integration
   - Notification handlers (foreground/background/quit)
   - Notification preferences
   - Backend integration with edge functions

2. **Offline Support:**
   - NetInfo integration
   - Caching strategy with SWR/React Query
   - Offline queue for write operations
   - Sync on reconnect

3. **Payment Processing:**
   - Razorpay integration (react-native-razorpay)
   - Payment flow for event registrations
   - Payment history screen
   - Receipt generation

4. **Localization:**
   - i18n setup with English/Hindi
   - Translation files for all screens
   - Language selector
   - Dynamic language switching

5. **Error Tracking & Analytics:**
   - Sentry setup
   - Firebase Analytics integration
   - Custom event tracking
   - Crash reporting

6. **Security Hardening:**
   - Rate limiting implementation
   - Audit logging
   - File upload security
   - Input sanitization review

### Phase 7: Testing & Deployment
**Estimated Effort:** 1-2 weeks

**Dependency:** All phases complete

1. **Comprehensive Testing:**
   - Execute manual testing checklist
   - Test all edge cases
   - Cross-device testing (iOS/Android)
   - Load testing (concurrent users)

2. **Performance Optimization:**
   - Image optimization
   - Bundle size reduction
   - Query optimization
   - Lazy loading implementation

3. **Deployment:**
   - Generate app icons and splash screens
   - Build and submit to app stores (iOS/Android)
   - Deploy web admin to Vercel/Netlify
   - Configure production environment variables

4. **Post-Launch:**
   - Monitor error logs
   - User feedback collection
   - Hot-fixes as needed
   - Documentation finalization

---

## File Structure Clarification

**Current Structure (from research):**
```
mahaveer-bhavan/
├── member-app/          # React Native member app
│   ├── android/         # Android build files (exists)
│   ├── ios/            # iOS files (to be created)
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── package.json
├── admin-app/           # React Native admin app
│   ├── android/         # Android build files (exists)
│   ├── ios/            # iOS files (to be created)
│   ├── src/
│   │   └── screens/
│   └── package.json
├── shared/              # Shared TypeScript types and utilities
│   └── src/
│       └── types/
├── supabase/
│   ├── functions/       # Edge functions (9 implemented)
│   └── migrations/      # Database migrations
└── web-admin-interface/ # To be created
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── styles/
    └── package.json
```

**Note:** The user's original spec mentioned a unified `/src`, `/android`, `/ios` structure, but the existing codebase uses separate app folders (member-app, admin-app). **Recommendation:** Keep the current structure as-is since:
- Separate apps allow independent deployment and versioning
- Easier to manage different dependencies per app
- Clearer separation of concerns
- `/shared` folder already provides code reuse for types/utilities

If the user wants to merge into a monorepo structure with shared source code, that would require significant restructuring and is not recommended at this stage.

---

## Key Decision Points Documented

### 1. Web Admin Architecture
**Decision:** Separate React web app (not React Native Web)
**Rationale:** Better suited for complex data tables, CSV handling, and desktop-optimized UI

### 2. Bottom Tabs for Admin
**Decision:** Bottom tabs navigation (not drawer)
**Rationale:** Consistency with member app, better mobile UX, easier thumb access

### 3. VoIP Library Choice
**Decision:** @videosdk.live/react-native-sdk or Agora RTC
**Rationale:** Both support voice/video, have React Native SDKs, reliable infrastructure

### 4. Teal Color Shade
**Decision:** #0F766E (Tailwind teal-700)
**Rationale:** Deeper shade works better in dark mode, more premium feel

### 5. Separate Login Apps
**Decision:** Each app has own login, role-based routing within app
**Rationale:** Members use member app, admins use admin app, role check blocks cross-access

---

## Final Validation Checklist

### Feature Coverage
- [x] All Member app features specified (registration, ID, messages, gallery, events, AI)
- [x] All Admin app features specified (dashboard, members, events, scanner, moderation, calendar, settings)
- [x] Web admin features specified (import, export, reports, audit logs)
- [x] Authentication flows detailed (login, password change, role routing)
- [x] Theme system fully specified (dark mode, teal colors, Apple aesthetic)
- [x] Platform setup covered (iOS, Android, Web)

### Technical Completeness
- [x] Navigation structures defined for both apps
- [x] Database schema updates listed (8 new tables, 3 table updates)
- [x] Push notifications implementation detailed
- [x] Permissions system enforcement specified
- [x] Error handling and offline support covered
- [x] Real-time features (Supabase Realtime) specified
- [x] File upload/download flows detailed
- [x] Payment processing (Razorpay) implementation specified
- [x] Localization (English/Hindi) covered
- [x] Security measures documented

### Edge Cases
- [x] Network error handling specified
- [x] Offline mode behavior defined
- [x] Concurrent edit handling addressed
- [x] Permission violations handled
- [x] File upload failures covered
- [x] Payment error scenarios detailed
- [x] Validation edge cases listed

### Deployment
- [x] iOS deployment steps documented
- [x] Android deployment steps documented
- [x] Web deployment options provided
- [x] Environment variables listed
- [x] Post-deployment checklist included
- [x] Testing strategy defined

### Ambiguity Check
- [x] No decisions left for implementation agent
- [x] All behaviors explicitly described
- [x] All error messages specified
- [x] All validation rules detailed
- [x] All UI layouts described
- [x] All API interactions specified
- [x] All navigation flows mapped

---

## Dependencies & Libraries Summary

**React Native (Both Apps):**
- React Navigation v6 (navigation)
- @react-native-firebase/app, @react-native-firebase/messaging (push notifications)
- react-native-image-picker (photo selection)
- react-native-image-crop-picker (photo cropping)
- react-native-vision-camera (camera for QR scanning)
- react-native-pdf-lib (PDF generation)
- react-native-view-shot (JPG export)
- @videosdk.live/react-native-sdk OR Agora RTC (VoIP calling)
- react-native-audio-waveform (voice message waveform)
- react-native-razorpay (payment processing)
- react-native-fs (file system access)
- @react-native-community/netinfo (network status)
- react-i18next (localization)
- react-native-vector-icons (icons)
- react-native-fast-image (image caching)
- react-native-calendars (calendar view for admin)
- @react-native-voice/voice (voice input, if needed)
- react-native-callkeep (native call UI)
- @sentry/react-native (error tracking)

**Web Admin:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router (navigation)
- React Query (data fetching)
- @supabase/supabase-js (backend client)
- xlsx (Excel import/export)
- recharts (for data visualization)

**Backend (Already Setup):**
- Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- OpenRouter API (AI chat - already configured)

---

## Success Criteria

**This implementation is successful when:**

1. **Members can:**
   - Register with photo, receive Member ID
   - Login and view their digital ID card
   - Download ID as PDF/JPG
   - Browse and interact with gallery (like, comment, upload)
   - Send/receive messages with voice, video, media
   - Make voice and video calls
   - View and register for events with payment
   - See their logistics after registration
   - Ask questions to AI assistant in English/Hindi
   - Edit their profile and settings

2. **Admins can:**
   - Login with role-based access
   - Create and manage members
   - Create and manage admin users with permissions
   - Create events with dynamic pricing by membership type
   - Assign logistics (room, seat, PNR) to registrants
   - Scan QR codes for attendance and distribution
   - Moderate gallery uploads (approve/reject)
   - Mark holidays and send notifications
   - Change system branding (logo, colors) with real-time updates
   - Import/export data via web interface
   - View reports and audit logs

3. **System provides:**
   - Dark mode with teal branding across all platforms
   - Real-time updates (messages, notifications, gallery)
   - Push notifications for all key events
   - Offline support with queue sync
   - Secure authentication with forced password change
   - Role-based permissions at all layers
   - Error tracking and analytics
   - Multi-language support (English/Hindi)

4. **Technical quality:**
   - No unhandled errors in production
   - Sub-2-second page load times
   - Smooth 60fps animations
   - < 50MB app size (member and admin)
   - 99%+ uptime
   - Zero data loss
   - GDPR/data privacy compliance
