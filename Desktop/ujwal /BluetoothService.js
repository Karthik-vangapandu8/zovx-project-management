import * as Location from 'expo-location';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Constants from 'expo-constants';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Conditionally import BLE library
let BleManager, Device;
if (!isExpoGo) {
  try {
    const ble = require('react-native-ble-plx');
    BleManager = ble.BleManager;
    Device = ble.Device;
  } catch (error) {
    console.log('BLE library not available, using mock implementation');
  }
}

// Mock device data for Expo Go testing
const MOCK_DEVICES = [
  {
    id: 'mock-device-1',
    name: 'iPhone 15 Pro',
    localName: 'iPhone',
    rssi: -45,
    isConnectable: true,
    serviceUUIDs: [],
    timestamp: Date.now(),
    isConnected: false
  },
  {
    id: 'mock-device-2',
    name: 'AirPods Pro',
    localName: 'AirPods',
    rssi: -62,
    isConnectable: true,
    serviceUUIDs: [],
    timestamp: Date.now(),
    isConnected: false
  },
  {
    id: 'mock-device-3',
    name: 'Samsung Galaxy S24',
    localName: 'Galaxy',
    rssi: -78,
    isConnectable: true,
    serviceUUIDs: [],
    timestamp: Date.now(),
    isConnected: false
  },
  {
    id: 'mock-device-4',
    name: 'MacBook Pro',
    localName: 'MacBook',
    rssi: -55,
    isConnectable: true,
    serviceUUIDs: [],
    timestamp: Date.now(),
    isConnected: false
  }
];

class BluetoothService {
  constructor() {
    this.manager = null;
    this.devices = new Map();
    this.isScanning = false;
    this.connectedDevices = new Set();
    this.isExpoGo = isExpoGo;
    
    if (!this.isExpoGo && BleManager) {
      this.manager = new BleManager();
    }
  }

  // Initialize Bluetooth service
  async initialize() {
    try {
      if (this.isExpoGo) {
        console.log('Running in Expo Go - using mock Bluetooth implementation');
        return true;
      }

      if (!this.manager) {
        throw new Error('Bluetooth library not available. Please use a development build.');
      }

      await this.requestPermissions();
      const state = await this.manager.state();
      
      if (state !== 'PoweredOn') {
        throw new Error('Bluetooth is not powered on');
      }
      
      console.log('Bluetooth service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Bluetooth service:', error);
      throw error;
    }
  }

  // Request necessary permissions
  async requestPermissions() {
    if (Platform.OS === 'android') {
      // Request location permission (required for Bluetooth scanning on Android)
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (locationPermission.status !== 'granted') {
        throw new Error('Location permission is required for Bluetooth scanning');
      }

      // Request Bluetooth permissions for Android 12+
      if (Platform.Version >= 31) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        const allGranted = Object.values(granted).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          throw new Error('Bluetooth permissions are required');
        }
      }
    }
  }

  // Start scanning for devices
  async startScan(onDeviceFound, onScanStart, onScanStop) {
    if (this.isScanning) {
      console.log('Already scanning');
      return;
    }

    try {
      this.devices.clear();
      this.isScanning = true;
      onScanStart?.();

      if (this.isExpoGo) {
        // Mock implementation for Expo Go
        console.log('Starting mock Bluetooth scan...');
        
        // Simulate discovering devices over time
        MOCK_DEVICES.forEach((deviceData, index) => {
          setTimeout(() => {
            if (this.isScanning) {
              const deviceInfo = {
                ...deviceData,
                timestamp: Date.now(),
                isConnected: this.connectedDevices.has(deviceData.id)
              };
              
              this.devices.set(deviceData.id, deviceInfo);
              onDeviceFound?.(Array.from(this.devices.values()));
            }
          }, (index + 1) * 1500); // Stagger device discovery
        });

        // Auto-stop scan after 8 seconds
        setTimeout(() => {
          if (this.isScanning) {
            this.stopScan(onScanStop);
          }
        }, 8000);

        return;
      }

      // Real implementation for development builds
      console.log('Starting Bluetooth scan...');
      
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          this.stopScan(onScanStop);
          return;
        }

        if (device && !this.devices.has(device.id)) {
          const deviceInfo = {
            id: device.id,
            name: device.name || 'Unknown Device',
            localName: device.localName,
            rssi: device.rssi,
            isConnectable: device.isConnectable,
            serviceUUIDs: device.serviceUUIDs,
            timestamp: Date.now(),
            isConnected: this.connectedDevices.has(device.id)
          };

          this.devices.set(device.id, deviceInfo);
          onDeviceFound?.(Array.from(this.devices.values()));
        }
      });

      // Auto-stop scan after 30 seconds
      setTimeout(() => {
        if (this.isScanning) {
          this.stopScan(onScanStop);
        }
      }, 30000);

    } catch (error) {
      console.error('Failed to start scan:', error);
      this.isScanning = false;
      onScanStop?.();
      throw error;
    }
  }

  // Stop scanning
  stopScan(onScanStop) {
    if (this.isScanning) {
      if (!this.isExpoGo && this.manager) {
        this.manager.stopDeviceScan();
      }
      this.isScanning = false;
      onScanStop?.();
      console.log('Bluetooth scan stopped');
    }
  }

  // Connect to a device
  async connectToDevice(deviceId, onConnectionSuccess, onConnectionError) {
    try {
      console.log(`Attempting to connect to device: ${deviceId}`);
      
      // Stop scanning before connecting
      this.stopScan();

      if (this.isExpoGo) {
        // Mock connection for Expo Go
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection delay
        
        this.connectedDevices.add(deviceId);
        
        // Update device list to reflect connection status
        if (this.devices.has(deviceId)) {
          const deviceInfo = this.devices.get(deviceId);
          deviceInfo.isConnected = true;
          this.devices.set(deviceId, deviceInfo);
        }

        const mockDevice = { name: this.devices.get(deviceId)?.name || 'Mock Device', id: deviceId };
        console.log(`Successfully connected to mock device: ${mockDevice.name}`);
        onConnectionSuccess?.(mockDevice);
        
        return mockDevice;
      }

      // Real implementation for development builds
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevices.add(deviceId);
      
      // Update device list to reflect connection status
      if (this.devices.has(deviceId)) {
        const deviceInfo = this.devices.get(deviceId);
        deviceInfo.isConnected = true;
        this.devices.set(deviceId, deviceInfo);
      }

      console.log(`Successfully connected to device: ${device.name || deviceId}`);
      onConnectionSuccess?.(device);
      
      return device;
    } catch (error) {
      console.error(`Failed to connect to device ${deviceId}:`, error);
      onConnectionError?.(error);
      throw error;
    }
  }

  // Disconnect from a device
  async disconnectFromDevice(deviceId) {
    try {
      if (!this.isExpoGo && this.manager) {
        await this.manager.cancelDeviceConnection(deviceId);
      }
      
      this.connectedDevices.delete(deviceId);
      
      // Update device list to reflect disconnection
      if (this.devices.has(deviceId)) {
        const deviceInfo = this.devices.get(deviceId);
        deviceInfo.isConnected = false;
        this.devices.set(deviceId, deviceInfo);
      }
      
      console.log(`Disconnected from device: ${deviceId}`);
    } catch (error) {
      console.error(`Failed to disconnect from device ${deviceId}:`, error);
      throw error;
    }
  }

  // Get RSSI signal strength level
  getSignalStrength(rssi) {
    if (!rssi) return 'unknown';
    if (rssi > -50) return 'excellent';
    if (rssi > -60) return 'good';
    if (rssi > -70) return 'fair';
    return 'poor';
  }

  // Get signal strength color
  getSignalColor(rssi) {
    const strength = this.getSignalStrength(rssi);
    switch (strength) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FF9800';
      case 'poor': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  // Cleanup
  destroy() {
    this.stopScan();
    if (!this.isExpoGo && this.manager) {
      this.manager.destroy();
    }
    this.devices.clear();
    this.connectedDevices.clear();
  }

  // Check if device is connected
  isDeviceConnected(deviceId) {
    return this.connectedDevices.has(deviceId);
  }

  // Get all discovered devices
  getDevices() {
    return Array.from(this.devices.values());
  }

  // Get scanning status
  getScanningStatus() {
    return this.isScanning;
  }

  // Check if running in Expo Go
  getIsExpoGo() {
    return this.isExpoGo;
  }
}

export default new BluetoothService(); 