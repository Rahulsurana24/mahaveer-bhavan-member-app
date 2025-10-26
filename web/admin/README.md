# Mahaveer Bhavan Web Admin Interface

A modern, responsive web administration portal for managing the Mahaveer Bhavan community platform.

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** (@tanstack/react-query) - Server state management
- **Supabase** - Backend and database
- **Lucide React** - Icon library
- **xlsx** - Excel import/export
- **Recharts** - Data visualization

## 📦 Project Structure

```
web/admin/
├── src/
│   ├── components/           # Reusable components
│   │   └── layout/
│   │       └── AdminLayout.tsx  # Main layout with sidebar
│   ├── lib/
│   │   └── supabase.ts       # Supabase client configuration
│   ├── pages/                # Page components
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── Members/
│   │   ├── Events/
│   │   ├── Gallery/
│   │   │   └── GalleryModerationPage.tsx
│   │   ├── DataImport/
│   │   ├── DataExport/
│   │   ├── Reports/
│   │   └── Settings/
│   ├── App.tsx               # Main app component with routing
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles and Tailwind imports
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind configuration (teal theme)
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
└── .env.example              # Environment variables template

## 🎨 Features

### Current Implementation (Foundation)

- ✅ **Authentication System**
  - Admin-only login with Supabase Auth
  - Role verification (admin vs member)
  - Session management
  - Protected routes

- ✅ **Modern UI/UX**
  - Dark mode design (matching mobile app)
  - Teal color theme (#0F766E)
  - Responsive layout (desktop, tablet, mobile)
  - Sidebar navigation
  - Mobile-friendly hamburger menu

- ✅ **Page Structure**
  - Dashboard - Overview and stats
  - Members - Member management
  - Events - Event management
  - Gallery - Media moderation
  - Data Import - Bulk data import
  - Data Export - Data export tools
  - Reports - Analytics and reports
  - Settings - System configuration

### To Be Implemented (Next Steps)

- ⏳ **Data Import/Export**
  - CSV/Excel file upload
  - Field mapping and validation
  - Bulk member/event import
  - Download templates
  - Error reporting

- ⏳ **Gallery Moderation**
  - Approve/reject pending media
  - Preview images and videos
  - Batch operations
  - Moderation history

- ⏳ **Reports & Analytics**
  - Financial reports
  - Attendance tracking
  - Member growth charts
  - Event participation analytics
  - Export reports as PDF/Excel

- ⏳ **Real-time Features**
  - Live dashboard updates
  - Supabase Realtime subscriptions
  - Notification system

## 🚦 Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Supabase project (same as mobile apps)

### Installation

1. **Navigate to the directory:**
   ```bash
   cd web/admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The app will open at `http://localhost:3001`

### Development

```bash
# Start dev server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔐 Authentication

The Web Admin interface uses the same Supabase authentication as the mobile apps.

**Login Requirements:**
- Valid email and password
- User must have `admin` role in the database
- Members trying to access will be denied

**Testing Login:**
```
Email: Use an admin account from your Supabase database
Password: The admin's password
```

## 🗂️ Database Integration

The Web Admin connects to the same Supabase database as the mobile apps. It accesses:

- `user_profiles` - User information
- `user_roles` - Role definitions
- `events` - Event management
- `gallery` - Media moderation
- `donations` - Financial tracking
- `event_registrations` - Event participants
- And all other tables...

## 🎨 Theme System

The Web Admin uses TailwindCSS with a custom theme matching the mobile apps:

**Colors:**
- Primary: `#0F766E` (Teal 700)
- Background: `#0A0A0A` (Dark)
- Elevated: `#1A1A1A` (Dark elevated)
- Membership colors: Tapasvi (#F59E0B), Karyakarta (#8B5CF6), etc.

**Customization:**
Edit `tailwind.config.js` to modify colors, spacing, fonts, etc.

## 📱 Responsive Design

The Web Admin is fully responsive:

- **Desktop (1024px+):** Full sidebar navigation
- **Tablet (768px-1023px):** Collapsible sidebar
- **Mobile (<768px):** Hamburger menu with slide-out drawer

## 🔧 Configuration

### Vite Configuration (`vite.config.ts`)

- Port: 3001
- Auto-open browser
- Path aliases: `@/` maps to `./src/`
- Build output: `dist/`

### TypeScript Configuration (`tsconfig.json`)

- Strict mode enabled
- Path mapping for `@/*`
- ES2020 target
- React JSX

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deploy to Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts and add environment variables in the Vercel dashboard.

### Deploy to Other Hosts

The `dist/` folder contains static files. Upload to any static hosting:
- AWS S3 + CloudFront
- Firebase Hosting
- GitHub Pages
- Any web server (Apache, Nginx, etc.)

**Important:** Configure server for client-side routing (redirect all requests to `index.html`)

## 📚 Code Structure

### Adding a New Page

1. Create page component:
   ```tsx
   // src/pages/MyFeature/MyFeaturePage.tsx
   export default function MyFeaturePage() {
     return (
       <div className="space-y-6">
         <h1 className="text-3xl font-bold text-white">My Feature</h1>
         {/* Your content */}
       </div>
     )
   }
   ```

2. Add route in `App.tsx`:
   ```tsx
   import MyFeaturePage from './pages/MyFeature/MyFeaturePage'

   // In Routes:
   <Route path="/my-feature" element={<MyFeaturePage />} />
   ```

3. Add navigation item in `AdminLayout.tsx`:
   ```tsx
   const navigation = [
     // ...
     { name: 'My Feature', href: '/my-feature', icon: YourIcon },
   ]
   ```

### Fetching Data from Supabase

```tsx
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export default function MyPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{/* Render data */}</div>
}
```

## 🐛 Troubleshooting

### Build Errors

**Issue:** `Module not found` errors
**Solution:** Check import paths use `@/` alias correctly

**Issue:** TypeScript errors
**Solution:** Run `npm run type-check` to see all type errors

### Runtime Errors

**Issue:** "Missing Supabase environment variables"
**Solution:** Ensure `.env` file exists with correct variables

**Issue:** Login fails even with correct credentials
**Solution:** Check user has `admin` role in database

### Development Server Issues

**Issue:** Port 3001 already in use
**Solution:** Change port in `vite.config.ts` or kill process using port

**Issue:** Hot reload not working
**Solution:** Restart dev server

## 📖 Next Steps

To complete the Web Admin interface:

1. **Implement Data Import** (Priority: High)
   - Excel/CSV file parsing with `xlsx`
   - Field validation
   - Bulk insert to Supabase
   - Progress tracking
   - Error reporting

2. **Implement Data Export** (Priority: High)
   - Query data from Supabase
   - Generate Excel/CSV with `xlsx`
   - Download functionality
   - Custom date ranges and filters

3. **Enhance Gallery Moderation** (Priority: High)
   - Fetch pending media from Supabase
   - Display thumbnails/previews
   - Approve/reject functionality
   - Batch operations

4. **Build Reports Dashboard** (Priority: Medium)
   - Charts with Recharts
   - Financial reports
   - Member growth analytics
   - Event participation stats

5. **Add Real-time Updates** (Priority: Medium)
   - Supabase Realtime subscriptions
   - Live dashboard stats
   - Notification system

6. **Implement Settings** (Priority: Low)
   - System configuration
   - Email templates
   - Branding customization
   - App parameters

## 🤝 Contributing

When adding new features:
1. Follow existing code structure
2. Use TypeScript for type safety
3. Follow TailwindCSS conventions
4. Test responsiveness on all screen sizes
5. Ensure admin role checks for sensitive operations

## 📄 License

Copyright © 2025 Mahaveer Bhavan. All rights reserved.

## 🆘 Support

For issues or questions:
- Check existing documentation
- Review Supabase logs
- Check browser console for errors
- Verify environment variables are correct

---

**Status:** Foundation complete, feature implementation in progress
**Last Updated:** October 26, 2025
**Version:** 1.0.0
