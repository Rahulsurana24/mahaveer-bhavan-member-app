# iOS Setup Guide - Mahaveer Bhavan Member App

This guide helps you set up and run the iOS version of the Mahaveer Bhavan Member app.

## Prerequisites

### Required Software
- **macOS** (version 10.15 Catalina or later)
- **Xcode** (version 14.0 or later)
  - Download from Mac App Store
  - Command Line Tools installed: `xcode-select --install`
- **CocoaPods** (version 1.11.0 or later)
  - Install: `sudo gem install cocoapods`
- **Node.js** (version 18 or later)
- **Watchman** (recommended)
  - Install: `brew install watchman`

### Check Installations
```bash
# Check Xcode version
xcodebuild -version

# Check CocoaPods
pod --version

# Check Node
node --version

# Check Watchman
watchman --version
```

## Initial Setup

### Step 1: Navigate to Member App Directory
```bash
cd /path/to/mahaveer-bhavan/android/member
```

### Step 2: Install JavaScript Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Initialize iOS Project (First Time Only)

The iOS project needs to be initialized using React Native CLI. This creates the Xcode workspace and project files.

```bash
# From android/member directory
npx react-native init MahaveerBhavanMember --directory ../../ios/member --skip-install
```

**Important:** This command will:
- Create the Xcode project files
- Set up the project structure
- Generate launch screens
- Create the main app delegate files

### Step 4: Copy Configuration Files

The `Info.plist` and `Podfile` have already been created with the correct permissions and dependencies. They are located in:
- `/ios/member/Info.plist` - App permissions and configuration
- `/ios/member/Podfile` - Native dependency management

**You may need to move these files to the correct location after initialization:**

```bash
# After running react-native init, the structure will be:
# ios/member/MahaveerBhavanMember/Info.plist (generated)
# ios/member/Podfile (generated)

# Replace them with our pre-configured versions
cp Info.plist MahaveerBhavanMember/Info.plist
cp Podfile Podfile
```

### Step 5: Update Bundle Identifier

Open `ios/member/MahaveerBhavanMember.xcworkspace` in Xcode and:

1. Select the project in the left sidebar
2. Select the "MahaveerBhavanMember" target
3. Go to "Signing & Capabilities" tab
4. Update the Bundle Identifier to: `com.mahaverbhavan.member`
5. Select your development team for code signing

### Step 6: Install iOS Dependencies (CocoaPods)

```bash
cd ios/member
pod install
```

This will:
- Install React Native native modules
- Install all required permissions modules
- Install image picker, camera, and other native dependencies
- Create the `.xcworkspace` file

**Always use the `.xcworkspace` file to open the project, NOT the `.xcodeproj` file!**

## Running the App

### Development Build

#### Option 1: Using React Native CLI (Recommended)
```bash
# From android/member directory
npm run ios
# or
npx react-native run-ios
```

#### Option 2: From Xcode
1. Open `ios/member/MahaveerBhavanMember.xcworkspace` in Xcode
2. Select a simulator or connected device
3. Click the "Play" button (▶️) or press `Cmd + R`

#### Option 3: Specific Simulator
```bash
# List available simulators
xcrun simctl list devices

# Run on specific simulator (e.g., iPhone 15 Pro)
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Metro Bundler

The Metro bundler should start automatically. If not, start it manually:

```bash
# From android/member directory
npm start
# or
npx react-native start
```

## Required Permissions

The app requires the following iOS permissions (already configured in Info.plist):

- **Camera** - For QR code scanning and photo capture
- **Photo Library** - To save ID cards and select gallery images
- **Microphone** - For voice and video calls
- **Location (When In Use)** - For location-based events
- **Contacts** - To find community members

## Troubleshooting

### Issue: CocoaPods Installation Fails

**Solution:**
```bash
cd ios/member
pod deintegrate
pod cache clean --all
pod install --repo-update
```

### Issue: "Command PhaseScriptExecution failed"

**Solution:**
1. Clean build folder: `Product > Clean Build Folder` (Shift + Cmd + K)
2. Delete derived data: `~/Library/Developer/Xcode/DerivedData`
3. Reinstall pods:
   ```bash
   cd ios/member
   pod deintegrate
   pod install
   ```

### Issue: "The sandbox is not in sync with the Podfile.lock"

**Solution:**
```bash
cd ios/member
pod install
```

### Issue: Metro Bundler Connection Issues

**Solution:**
```bash
# Reset Metro cache
npx react-native start --reset-cache
```

### Issue: Build Fails with "Framework not found"

**Solution:**
- Ensure you opened `.xcworkspace` and NOT `.xcodeproj`
- Clean and rebuild: `Product > Clean Build Folder`

### Issue: Simulator Not Found

**Solution:**
```bash
# Open Xcode
# Go to Xcode > Preferences > Components
# Download the desired iOS simulator version
```

## Building for Release

### Prerequisites for Release Build
- Apple Developer Account ($99/year)
- Provisioning Profile configured
- Distribution Certificate

### Create Release Build

1. Open Xcode
2. Select "Any iOS Device (arm64)" as the target
3. Go to `Product > Archive`
4. Wait for archive to complete
5. In Organizer window, click "Distribute App"
6. Follow the wizard to upload to App Store or create IPA

### Configure App Icons and Launch Screen

1. **App Icon:**
   - Create icon set at 1024x1024px
   - Use Xcode Asset Catalog: `MahaveerBhavanMember/Images.xcassets/AppIcon.appiconset`
   - Xcode will generate all required sizes

2. **Launch Screen:**
   - Edit `LaunchScreen.storyboard` in Xcode
   - Add Mahaveer Bhavan branding/logo
   - Use teal theme colors (#0F766E)

## Environment Configuration

### Connecting to Supabase

The app uses environment variables for configuration. Create/update:

**File:** `ios/member/MahaveerBhavanMember/Info.plist`

Add Supabase configuration:
```xml
<key>SUPABASE_URL</key>
<string>$(SUPABASE_URL)</string>
<key>SUPABASE_ANON_KEY</key>
<string>$(SUPABASE_ANON_KEY)</string>
```

Then in Xcode:
1. Select project > Info tab
2. Add configuration keys
3. Or use `react-native-config` for .env file support

## Testing

### Run Unit Tests
```bash
# From android/member directory
npm test
```

### Run on Physical Device

1. Connect iPhone/iPad via USB
2. Trust computer on device
3. In Xcode:
   - Select your device from the device list
   - Ensure correct Bundle Identifier and Team are set
   - Click "Build and Run"
4. On device, trust the developer profile:
   - Settings > General > Device Management > Trust

## Performance Optimization

### Enable Hermes (Already Enabled)

Hermes JavaScript engine is enabled by default for better performance.

Verify in `Podfile`:
```ruby
:hermes_enabled => true
```

### Reduce Bundle Size

1. Enable bitcode (if needed)
2. Remove unused assets
3. Optimize images before including

## Project Structure

```
ios/member/
├── MahaveerBhavanMember/          # Main app folder
│   ├── AppDelegate.h              # App delegate header
│   ├── AppDelegate.mm             # App delegate implementation
│   ├── Info.plist                 # App configuration & permissions
│   ├── Images.xcassets/           # App icons and images
│   ├── LaunchScreen.storyboard    # Launch screen
│   └── main.m                     # App entry point
├── MahaveerBhavanMember.xcodeproj # Xcode project (don't open directly)
├── MahaveerBhavanMember.xcworkspace # Xcode workspace (OPEN THIS)
├── Podfile                        # CocoaPods dependencies
├── Podfile.lock                   # Locked versions
└── Pods/                          # Installed pods (gitignored)
```

## Next Steps

After successful iOS setup:

1. ✅ Test all features on iOS simulator
2. ✅ Test on physical iPhone device
3. ✅ Verify camera/photo permissions work
4. ✅ Test VoIP calling functionality
5. ✅ Ensure push notifications are configured
6. ✅ Test theme switching (Light/Dark mode)
7. ✅ Submit to App Store (when ready)

## Support

For iOS-specific issues:
- Check React Native iOS documentation
- Review Xcode console logs
- Check CocoaPods documentation
- Join React Native community forums

For app-specific issues:
- Review app logs in Xcode console
- Check Supabase connection
- Verify environment variables
- Review app documentation

## Important Notes

- **Always use `.xcworkspace`** after running `pod install`
- **Clean build** if experiencing strange errors
- **Update CocoaPods** regularly: `sudo gem install cocoapods`
- **Keep Xcode updated** for latest iOS SDK
- **Test on multiple iOS versions** for compatibility

---

**Status:** iOS support files created and ready for initialization
**Last Updated:** October 26, 2025
**React Native Version:** 0.73.2
**Minimum iOS Version:** 13.0
