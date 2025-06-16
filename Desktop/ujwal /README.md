# 🚀 Bluetooth Scanner App

A beautiful React Native Expo app that scans for nearby Bluetooth devices and displays them in an interactive card-style grid layout.

## ✨ Features

### 🔍 **Core Functionality**
- **Bluetooth Device Scanning** - Discover nearby Bluetooth devices
- **Grid Layout Display** - Modern 2-column card layout (not boring lists!)
- **Real-time Device Info** - Name, MAC address, and RSSI signal strength
- **Tap to Connect** - Connect/disconnect devices with a simple tap
- **Audio Feedback** - Beep sound on successful connections
- **Visual Feedback** - Green highlight and "Connected" badge for connected devices

### 🎨 **Beautiful UI/UX**
- **Animated Bluetooth Icons** - Pulsing animations based on signal strength
- **Color-coded Signal Strength** - Visual RSSI indicators
  - 🟢 Excellent (-50 dBm and above)
  - 🟡 Good (-50 to -60 dBm)
  - 🟠 Fair (-60 to -70 dBm)
  - 🔴 Poor (below -70 dBm)
- **Card Animations** - Smooth fade-in animations for discovered devices
- **Dark Theme** - Modern dark UI with blue accents
- **Lottie Animations** - Beautiful "No devices found" state
- **Mobile Responsive** - Optimized for all screen sizes

### 🔐 **Permissions & Compatibility**
- **Android 10-14 Compatible** - Supports latest Android versions
- **Runtime Permissions** - Automatic Bluetooth and location permission requests
- **Expo Go Compatible** - Ready to run in Expo Go for testing

## 🛠️ **Tech Stack**

- **React Native** with **Expo**
- **react-native-ble-plx** - Bluetooth Low Energy library
- **expo-av** - Audio playback for beep sounds
- **lottie-react-native** - Beautiful animations
- **react-native-animatable** - UI animations
- **@expo/vector-icons** - Icon library

## 📱 **Installation & Setup**

### Prerequisites
- Node.js (v14 or higher)
- Expo CLI (`npm install -g expo-cli`)
- Android device or emulator
- Bluetooth-enabled device for testing

### Quick Start

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Start the Expo development server:**
```bash
expo start
```

3. **Run on Android device:**
```bash
expo start --android
```

4. **Or scan QR code with Expo Go app**

### 🔧 **Development Build (Recommended)**

For full Bluetooth functionality, create a development build:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure and build
eas build:configure
eas build --platform android --profile development
```

## 📋 **Required Permissions**

The app automatically requests these permissions:

### Android
- `BLUETOOTH` - Basic Bluetooth access
- `BLUETOOTH_ADMIN` - Bluetooth management
- `BLUETOOTH_SCAN` - Device scanning (Android 12+)
- `BLUETOOTH_CONNECT` - Device connections (Android 12+)
- `ACCESS_FINE_LOCATION` - Required for Bluetooth scanning
- `ACCESS_COARSE_LOCATION` - Location access

## 🎯 **How to Use**

1. **Launch the app** - Opens with a beautiful dark interface
2. **Grant permissions** - Allow Bluetooth and location access when prompted
3. **Tap "Start Scan"** - Begin scanning for nearby Bluetooth devices
4. **View discovered devices** - See devices appear as animated cards
5. **Tap a device card** - Attempt to connect to the device
6. **Listen for beep** - Success sound plays on successful connection
7. **See connection status** - Connected devices show green badge

## 🔊 **Audio Features**

- **Connection Beep** - Pleasant beep sound on successful connections
- **Fallback Audio** - Programmatic audio generation if sound file fails
- **Volume Respects** - System volume settings

## 🎨 **UI Components**

### Device Cards
- **Pulsing Bluetooth Icon** - Animated based on connection status
- **Device Information** - Name, ID, and signal strength
- **Signal Strength Indicator** - Color-coded RSSI display
- **Connection Button** - Clear visual connection state

### Animations
- **Card Entrance** - Staggered fade-in animations
- **Pulse Effects** - Bluetooth icons and scanning indicators
- **Lottie Integration** - Smooth no-devices animation

## 🔬 **Testing**

### Bluetooth Testing Tips
1. **Enable Bluetooth** on your test device
2. **Use multiple devices** - Test with phones, headphones, etc.
3. **Test different distances** - Observe RSSI changes
4. **Try connection/disconnection** - Test full workflow

### Common Issues
- **Permissions denied** - Check app settings and grant manually
- **No devices found** - Ensure Bluetooth is enabled and devices are discoverable
- **Connection failures** - Some devices may not accept connections

## 📁 **Project Structure**

```
├── App.js                     # Main app component
├── BluetoothService.js        # Bluetooth logic and device management
├── package.json              # Dependencies and scripts
├── app.json                  # Expo configuration
├── assets/
│   ├── beep.mp3              # Connection sound effect
│   └── no-devices-animation.json  # Lottie animation
└── README.md                 # This file
```

## 🔧 **Key Components**

### `BluetoothService.js`
- Device scanning and management
- Connection handling
- Permission requests
- RSSI signal strength utilities

### `App.js`
- Main UI components
- Device card rendering
- Animation handling
- Sound management

## 🚨 **Important Notes**

### Expo Go Limitations
- **Limited Bluetooth access** in Expo Go
- **Development build recommended** for full functionality
- **HTTPS required** for web Bluetooth (not applicable here)

### Android Specifics
- **Location permission required** for Bluetooth scanning
- **Android 12+ permissions** automatically handled
- **Background limitations** - scanning stops when app backgrounds

### iOS Considerations
- **iOS support available** but requires additional configuration
- **App Store guidelines** may require additional permissions justification

## 🎉 **Features Demo**

1. **Beautiful Grid Layout** ✅
2. **Real-time Device Discovery** ✅
3. **Signal Strength Visualization** ✅
4. **Tap-to-Connect** ✅
5. **Audio Feedback** ✅
6. **Connection Status** ✅
7. **Smooth Animations** ✅
8. **Mobile Responsive** ✅
9. **Dark Theme** ✅
10. **No Devices Animation** ✅

## 🤝 **Contributing**

Feel free to contribute to this project! Areas for improvement:
- Additional device information display
- Connection history
- Device filtering and search
- Custom sound effects
- Bluetooth device icons based on type

## 📄 **License**

This project is open source and available under the MIT License.

---

**Ready to scan some Bluetooth devices? 🔵📱**

Run `expo start` and start discovering! 🚀 