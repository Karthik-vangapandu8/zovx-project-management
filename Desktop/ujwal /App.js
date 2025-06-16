import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import BluetoothService from './BluetoothService';

const { width, height } = Dimensions.get('window');

// Pulsing Bluetooth Icon Component
const PulsingBluetoothIcon = ({ isConnected, rssi }) => {
  const color = isConnected ? '#4CAF50' : BluetoothService.getSignalColor(rssi);
  
  return (
    <Animatable.View
      animation="pulse"
      iterationCount="infinite"
      duration={2000}
      style={styles.bluetoothIconContainer}
    >
      <Ionicons
        name="bluetooth"
        size={24}
        color={color}
      />
    </Animatable.View>
  );
};

// Demo Mode Banner Component
const DemoModeBanner = () => {
  const isExpoGo = BluetoothService.getIsExpoGo();
  
  if (!isExpoGo) return null;
  
  return (
    <View style={styles.demoModeBanner}>
      <Ionicons name="information-circle" size={16} color="#FF9800" />
      <Text style={styles.demoModeText}>
        Demo Mode: Showing mock devices in Expo Go
      </Text>
    </View>
  );
};

// Device Card Component
const DeviceCard = ({ device, onPress, index }) => {
  const cardAnimation = {
    from: { opacity: 0, translateY: 50 },
    to: { opacity: 1, translateY: 0 }
  };

  const isDemo = BluetoothService.getIsExpoGo();

  return (
    <Animatable.View
      animation={cardAnimation}
      duration={600}
      delay={index * 100}
      style={[
        styles.deviceCard,
        device.isConnected && styles.connectedCard
      ]}
    >
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => onPress(device)}
        activeOpacity={0.7}
      >
        {/* Demo Badge */}
        {isDemo && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>DEMO</Text>
          </View>
        )}

        {/* Status Badge */}
        {device.isConnected && (
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        )}

        {/* Device Icon */}
        <View style={styles.deviceIconContainer}>
          <PulsingBluetoothIcon 
            isConnected={device.isConnected} 
            rssi={device.rssi}
          />
        </View>

        {/* Device Info */}
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName} numberOfLines={2}>
            {device.name}
          </Text>
          
          <Text style={styles.deviceId} numberOfLines={1}>
            {device.id.substring(0, 12)}...
          </Text>
          
          {device.rssi && (
            <View style={styles.rssiContainer}>
              <Ionicons 
                name="cellular" 
                size={12} 
                color={BluetoothService.getSignalColor(device.rssi)} 
              />
              <Text style={[
                styles.rssiText,
                { color: BluetoothService.getSignalColor(device.rssi) }
              ]}>
                {device.rssi} dBm
              </Text>
            </View>
          )}
        </View>

        {/* Connect Button */}
        <View style={styles.connectButtonContainer}>
          <Ionicons
            name={device.isConnected ? "checkmark-circle" : "add-circle-outline"}
            size={20}
            color={device.isConnected ? "#4CAF50" : "#2196F3"}
          />
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

// Main App Component
export default function App() {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sound, setSound] = useState();
  const animationRef = useRef(null);

  // Initialize app
  useEffect(() => {
    initializeApp();
    return () => {
      cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize Bluetooth service
      await BluetoothService.initialize();
      
      // Load beep sound
      await loadBeepSound();
      
      setIsInitialized(true);
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert(
        'Initialization Error',
        `Failed to initialize: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  const loadBeepSound = async () => {
    try {
      // Create a simple beep using Web Audio API for better compatibility
      setSound({ replayAsync: () => createBeepSound() });
    } catch (error) {
      console.log('Failed to load beep sound:', error);
    }
  };

  const createBeepSound = () => {
    // Simple beep sound simulation
    console.log('🔊 Beep! Device connected successfully');
  };

  const playBeepSound = async () => {
    try {
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.log('Failed to play beep sound:', error);
    }
  };

  const cleanup = async () => {
    if (sound) {
      // No cleanup needed for our simple sound implementation
    }
    BluetoothService.destroy();
  };

  // Start scanning for devices
  const startScan = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'App is not initialized yet');
      return;
    }

    try {
      await BluetoothService.startScan(
        (foundDevices) => {
          setDevices(foundDevices);
        },
        () => {
          setIsScanning(true);
          setDevices([]);
        },
        () => {
          setIsScanning(false);
        }
      );
    } catch (error) {
      console.error('Failed to start scan:', error);
      Alert.alert('Scan Error', error.message);
      setIsScanning(false);
    }
  };

  // Stop scanning
  const stopScan = () => {
    BluetoothService.stopScan(() => {
      setIsScanning(false);
    });
  };

  // Handle device tap
  const handleDeviceTap = async (device) => {
    const isDemo = BluetoothService.getIsExpoGo();
    
    if (device.isConnected) {
      // Disconnect if already connected
      try {
        await BluetoothService.disconnectFromDevice(device.id);
        setDevices(BluetoothService.getDevices());
        Alert.alert('Disconnected', `Disconnected from ${device.name}`);
      } catch (error) {
        Alert.alert('Disconnection Error', error.message);
      }
      return;
    }

    // Try to connect
    try {
      await BluetoothService.connectToDevice(
        device.id,
        async (connectedDevice) => {
          // Play beep sound on successful connection
          await playBeepSound();
          
          // Update devices list
          setDevices(BluetoothService.getDevices());
          
          const message = isDemo 
            ? `Demo connection to ${connectedDevice.name || 'device'} successful!\n\nNote: This is a simulated connection for Expo Go. For real Bluetooth functionality, use a development build.`
            : `Successfully connected to ${connectedDevice.name || 'device'}`;
          
          Alert.alert(
            'Connected!',
            message,
            [{ text: 'OK' }]
          );
        },
        (error) => {
          Alert.alert('Connection Error', error.message);
        }
      );
    } catch (error) {
      console.error('Connection failed:', error);
      Alert.alert('Connection Failed', error.message);
    }
  };

  // Render device item
  const renderDeviceItem = ({ item, index }) => (
    <DeviceCard
      device={item}
      index={index}
      onPress={handleDeviceTap}
    />
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LottieView
        ref={animationRef}
        style={styles.lottieAnimation}
        source={require('./assets/no-devices-animation.json')}
        autoPlay
        loop
      />
      <Text style={styles.emptyTitle}>No Devices Nearby</Text>
      <Text style={styles.emptySubtitle}>
        {BluetoothService.getIsExpoGo() 
          ? "Tap 'Start Scan' to see demo devices"
          : "Start scanning to discover Bluetooth devices"
        }
      </Text>
    </View>
  );

  const isDemo = BluetoothService.getIsExpoGo();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Demo Mode Banner */}
      <DemoModeBanner />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Bluetooth Scanner {isDemo && '(Demo)'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {devices.length} device{devices.length !== 1 ? 's' : ''} found
        </Text>
        {isDemo && (
          <Text style={styles.demoSubtitle}>
            Showing simulated devices • Real devices require development build
          </Text>
        )}
      </View>

      {/* Scan Button */}
      <View style={styles.scanButtonContainer}>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonActive]}
          onPress={isScanning ? stopScan : startScan}
          disabled={!isInitialized}
        >
          {isScanning ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="scan" size={20} color="#fff" />
          )}
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Stop Scanning' : (isDemo ? 'Start Demo Scan' : 'Start Scan')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Device List */}
      <View style={styles.deviceListContainer}>
        {devices.length === 0 && !isScanning ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={devices}
            renderItem={renderDeviceItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.deviceList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Scanning Indicator */}
      {isScanning && (
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          style={styles.scanningIndicator}
        >
          <Text style={styles.scanningText}>
            {isDemo ? 'Demo scanning...' : 'Scanning...'}
          </Text>
        </Animatable.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  demoModeBanner: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoModeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  demoSubtitle: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 5,
    textAlign: 'center',
  },
  scanButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#2196F3',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanButtonActive: {
    backgroundColor: '#f44336',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  deviceListContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  deviceList: {
    paddingBottom: 20,
  },
  deviceCard: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    margin: 5,
    padding: 15,
    width: (width - 30) / 2,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    shadowColor: '#000',
  },
  connectedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#1e3a1e',
  },
  cardTouchable: {
    alignItems: 'center',
  },
  demoBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    zIndex: 1,
  },
  demoBadgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
  },
  connectedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 1,
  },
  connectedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deviceIconContainer: {
    marginBottom: 10,
  },
  bluetoothIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  deviceName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  deviceId: {
    color: '#a0a0a0',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 5,
  },
  rssiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rssiText: {
    fontSize: 10,
    marginLeft: 3,
    fontWeight: 'bold',
  },
  connectButtonContainer: {
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#a0a0a0',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  scanningIndicator: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  scanningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 