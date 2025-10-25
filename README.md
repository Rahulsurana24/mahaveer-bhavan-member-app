# 🕉️ Sree Mahaveer Seva Integrated Ecosystem

A comprehensive multi-platform Jain community management system with Member Portal, Admin Portal, and Web Admin Interface.

## 📱 Project Overview

### Platforms
- **Member Portal**: iOS & Android mobile apps
- **Admin Portal**: iOS, Android & Web interface
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)

### Design
- **Theme**: Dark Mode with Teal Primary Color (#0F766E)
- **Aesthetic**: Apple-like premium design
- **Currency**: Indian Rupees (₹)
- **Languages**: English & Hindi

---

## 🏗️ Project Structure

```
/workspace/cmh6fofaa00b2psi3k3ds3j56/
├── android/
│   ├── member/              # Android Member App
│   └── admin/               # Android Admin App
├── ios/
│   ├── member/              # iOS Member App (to be created)
│   └── admin/               # iOS Admin App (to be created)
├── web/
│   └── admin/               # Web Admin Interface (to be created)
├── shared/
│   └── src/
│       ├── types/           # Shared TypeScript types
│       ├── constants/       # Shared constants
│       └── utils/           # Shared utilities (currency, etc.)
├── supabase/
│   ├── functions/           # Edge Functions (9 implemented)
│   └── migrations/          # Database migrations
└── docs/
    ├── IMPLEMENTATION_GUIDE.md   # Complete implementation roadmap
    └── README.md                  # This file
```

---

## ✅ Current Status

### Phase 1: Foundation - **40% Complete**

**Completed:**
- ✅ Database setup (19 tables, 8 new tables added)
- ✅ Super admin initialization
- ✅ Theme system (Teal + Dark Mode)
- ✅ Currency utilities (₹ formatting)
- ✅ ChangePasswordScreen (both apps)
- ✅ Folder structure organized

**Pending:**
- ⏳ Navigation setup (both apps)
- ⏳ iOS project initialization
- ⏳ Web admin interface scaffold
- ⏳ 20+ Member app screens
- ⏳ 15+ Admin app screens
- ⏳ Cross-cutting features (notifications, payments, etc.)

---

## 🎯 Key Features

### Member Portal
- **Registration**: Multi-step form with photo upload & cropping
- **Digital ID Card**: PDF/JPG download with QR code
- **Messaging**: WhatsApp-style chat with voice notes, images, videos
- **VoIP Calling**: Voice and video calling
- **Gallery**: Instagram-like social feed (like, comment, share)
- **Events & Trips**: Registration with dynamic pricing & Razorpay payments
- **Dharma AI Assistant**: Jainism Q&A chatbot (Claude 3.5 Sonnet)
- **Profile & Settings**: Edit profile, notification preferences, language

### Admin Portal
- **Dashboard**: Key metrics, recent activity, quick actions
- **Members Management**: CRUD operations, search, filter, bulk actions
- **Admin User Management**: Create/manage admin accounts with roles
- **Events Management**: Create events with dynamic pricing, logistics assignment
- **Scanner**: QR code scanning for attendance & item distribution
- **Gallery Moderation**: Approve/reject user uploads
- **Calendar Management**: Mark holidays, override Upavas/Biyashna schedule
- **System Settings**: Branding, payment gateway, app behavior

### Web Admin Interface
- **Data Import**: Bulk import members, events, donations (CSV/Excel)
- **Data Export**: Export data with filters, pre-built reports
- **Reports Dashboard**: Member growth, financial reports, attendance analytics
- **Audit Logs**: Comprehensive activity tracking

---

## 🔐 Credentials

### Super Admin
- **Email**: rahulsuranat@gmail.com
- **Password**: 9480413653
- **Note**: Must change password on first login

### Database
- **URL**: https://juvrytwhtivezeqrmtpq.supabase.co
- **PostgreSQL**: postgresql://postgres:s3GVV2zOmFjT2aH4@db.juvrytwhtivezeqrmtpq.supabase.co:5432/postgres
- **Access Token**: sbp_b16cc13c16084523a56e907883f63c1acb355216

### APIs
- **OpenRouter** (AI): Configured in Supabase edge functions
- **Razorpay** (Payments): To be configured in system settings

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)
- CocoaPods (for iOS)

### Setup Android Member App

```bash
cd android/member
npm install
npx react-native run-android
```

### Setup Android Admin App

```bash
cd android/admin
npm install
npx react-native run-android
```

### Environment Variables

Create `.env` files in each app folder:

```env
SUPABASE_URL=https://juvrytwhtivezeqrmtpq.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## 📦 Dependencies

### Core
- React Native 0.73.2
- @supabase/supabase-js
- @react-navigation/native
- NativeWind (Tailwind CSS for RN)

### UI & Media
- react-native-vector-icons
- react-native-image-picker
- react-native-image-crop-picker
- react-native-fast-image
- react-native-vision-camera

### Communication
- @videosdk.live/react-native-sdk (VoIP)
- react-native-audio-waveform
- @react-native-firebase/messaging

### Utilities
- react-native-pdf-lib
- react-native-view-shot
- react-native-qrcode-svg
- react-native-razorpay
- react-i18next

See `IMPLEMENTATION_GUIDE.md` for complete dependency list.

---

## 📖 Documentation

- **IMPLEMENTATION_GUIDE.md**: Comprehensive guide for all 7 phases
- **planning.md**: Detailed planning document (2910 lines)
- **research.md**: Codebase research findings

---

## 🗄️ Database Schema

### Core Tables
- `members` (TEXT id) - Member profiles
- `user_profiles` (UUID auth_id) - Auth profiles with roles
- `user_roles` - Role definitions with permissions
- `events` - Events and trips
- `event_registrations` - Event signups
- `trip_assignments` - Logistics (room, seat, PNR)
- `gallery_posts` - Gallery items
- `messages` - Chat messages
- `notifications` - Push notifications
- `donations` - Donation records
- `ai_conversations` - AI chat history
- `item_distributions` - Item tracking
- `calendar_holidays` - Marked holidays
- `system_settings` - Global configuration
- `audit_logs` - Activity tracking

See database schema in `shared/src/types/supabase-types.ts`.

---

## 🎨 Design System

### Colors
```javascript
Primary: '#0F766E'         // Teal 700
PrimaryLight: '#14B8A6'    // Teal 500
Background: '#0A0A0A'      // Pure dark
BackgroundElevated: '#1A1A1A'  // Cards
TextPrimary: '#FFFFFF'
TextSecondary: '#A0A0A0'
```

### Typography
- **iOS**: SF Pro
- **Android**: Roboto
- **Sizes**: 12, 14, 16, 20, 24, 28, 34

### Spacing (8px base)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

---

## 🔧 Development Workflow

### 1. Complete Navigation Setup
```bash
# Install navigation dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
```

### 2. Implement Screens (Priority Order)
1. Registration Flow
2. Dashboard & ID Card
3. Events & Registration
4. Gallery & Messaging
5. Admin Dashboard & Members
6. Admin Events & Scanner
7. Web Admin Interface

### 3. Integrate Cross-Cutting Features
- Push notifications (FCM)
- Offline support
- Payment processing (Razorpay)
- Localization (i18next)
- Error tracking (Sentry)

### 4. Testing & Deployment
- Manual testing checklist
- Build APK/IPA
- Deploy web admin
- Configure production env

---

## 📊 Implementation Progress

| Phase | Status | Completion |
|-------|--------|------------|
| 1. Foundation | 🟡 In Progress | 40% |
| 2. Member App | ⚪ Not Started | 0% |
| 3. Social & Communication | ⚪ Not Started | 0% |
| 4. Admin App | ⚪ Not Started | 0% |
| 5. Web Admin | ⚪ Not Started | 0% |
| 6. Cross-Cutting | ⚪ Not Started | 0% |
| 7. Testing & Deployment | ⚪ Not Started | 0% |

**Overall Progress**: 6% (1 of 7 phases at 40%)

**Estimated Time to Complete**: 15-20 weeks

---

## 🤝 Contributing

This is a private project for Sree Mahaveer Seva community. For implementation questions, refer to `IMPLEMENTATION_GUIDE.md`.

---

## 📝 License

Proprietary - All rights reserved.

---

## 📞 Contact

**Administrator**: Rahul Suranat
- Email: rahulsuranat@gmail.com

**Technical Support**: Refer to `IMPLEMENTATION_GUIDE.md` for detailed technical documentation.

---

## 🙏 Acknowledgments

- Built with React Native & Supabase
- AI-powered by OpenRouter (Claude 3.5 Sonnet)
- Payments by Razorpay
- VoIP by VideoSDK

---

**Last Updated**: October 25, 2025
**Version**: 0.1.0-alpha
**Status**: Foundation Phase
