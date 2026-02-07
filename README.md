# DailySync Mobile App

React Native mobile application for DailySync built with Expo.

## Features

✅ Complete Authentication System:

- User Registration
- Email Login
- Email Verification with OTP
- Resend OTP
- Forgot Password
- Reset Password
- Change Password
- Get Current User (Me)
- Logout

## Tech Stack

- **React Native** with **Expo**
- **TypeScript**
- **React Navigation** for routing
- **Axios** for API calls
- **AsyncStorage** for local storage

## Prerequisites

- Node.js 18+ installed
- Expo Go app on your phone (from Play Store or App Store)
- Backend server running

## Installation

```bash
# Install dependencies
npm install

# Start the app
npm start
```

## Development

### Run on Device

1. Install Expo Go on your phone
2. Scan QR code with Expo Go (Android) or Camera (iOS)
3. App loads on your device

### Run on Emulator

```bash
# Android Emulator
npm run android

# iOS Simulator (macOS only)
npm run ios
```

## Configuration

Update the API URL in `src/services/api.ts`:

```typescript
const API_URL = "http://YOUR_IP:5000/api";
```

- **Android Emulator**: `http://10.0.2.2:5000/api`
- **iOS Simulator**: `http://localhost:5000/api`
- **Physical Device**: `http://YOUR_COMPUTER_IP:5000/api`

## Project Structure

```
src/
├── contexts/
│   └── AuthContext.tsx       # Authentication state management
├── navigation/
│   ├── AuthNavigator.tsx     # Auth screens navigation
│   └── AppNavigator.tsx      # Main app navigation
├── screens/
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── VerifyEmailScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── ChangePasswordScreen.tsx
│   └── HomeScreen.tsx
└── services/
    └── api.ts                # API service layer
```

## Testing

See [MOBILE_TESTING_GUIDE.md](../../MOBILE_TESTING_GUIDE.md) for complete testing instructions.

## Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run on web browser
```

## Build

```bash
# Build for production
expo build:android
expo build:ios
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
