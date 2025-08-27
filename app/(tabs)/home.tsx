import { Buffer } from "buffer";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, ToastAndroid } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { useDispatch } from "react-redux";

import Loading from "@/components/Loading";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedView } from "@/components/ThemedView";
import { setUser } from "@/features/user/userSclice";
import { supabase } from "@/lib/supabase";
import { SensorData } from "@/types";

import ConnectedDeviceInfo from "@/components/ConnectedDeviceInfo";
import DeviceScanner from "@/components/DeviceScanner";
import HomeHeader from "@/components/HomeHeader";
import SensorChart from "@/components/SensorChart";
import { updateSensorData } from "@/features/sensordata/sensorDataSclice";
import { BLEService } from "@/helpers/BLManager";

const bleManager = new BleManager();

// Constants
const SCAN_DURATION = 10000; // 10 seconds
const MAX_HISTORY_ITEMS = 10;

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState<SensorData>({
    temp: 0,
    hum: 0,
    N: 0,
    P: 0,
    K: 0,
    water: 0,
    pH: 0,
    EC: 0,
    OC: 0,
    S: 0,
    Zn: 0,
    Fe: 0,
    Cu: 0,
    Mn: 0,
    B: 0,
  });
  const [connected, setConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const [thData, setThData] = useState<{
    temp: number;
    hum: number;
    water: number;
    pH: number;
    EC: number;
    OC: number;
  } | null>(null);

  const [npkData, setNpkData] = useState<{ N: number; P: number; K: number } | null>(null);

  // Initialize history with arrays containing a single 0 for each sensor data type
  const initialHistory: Record<keyof SensorData, number[]> = {
    temp: [0],
    hum: [0],
    N: [0],
    P: [0],
    K: [0],
    water: [0],
    pH: [0],
    EC: [0],
    OC: [0],
    S: [0],
    Zn: [0],
    Fe: [0],
    Cu: [0],
    Mn: [0],
    B: [0]
  };

  const [history, setHistory] = useState(initialHistory);

  const [visibleSensors, setVisibleSensors] = useState({
    temp: true, hum: true, N: true, P: true, K: true,
    water: true, pH: true, EC: true, OC: true,
    S: true, Zn: false, Fe: false, Cu: false, Mn: false, B: false
  })

  const dispatch = useDispatch();
  const pollingRef = useRef<number | null>(null);

  const toggleSensor = (key: keyof typeof visibleSensors) => {
    setVisibleSensors((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch user from Supabase
  useEffect(() => {
    const fetchUserDetails = async () => {
      console.log("🔍 Fetching user details...");
      const session = await supabase.auth.getSession();
      const authUser = session.data.session?.user;
      if (authUser) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();
        if (data) {
          console.log("✅ User data loaded:", data);
          dispatch(setUser(data));
        }
      }
      setLoading(false);
    };

    fetchUserDetails();

    return () => {
      console.log("🛑 Cleaning up BLE + intervals...");
      if (pollingRef.current) clearInterval(pollingRef.current);
      bleManager.destroy();
    };
  }, []);

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.some((device) => device.id === nextDevice.id);

  // Scan for devices
  const scanForPeripherals = async () => {
    console.log("🔍 Requesting Bluetooth permission...");
    const permission = await BLEService.requestBluetoothPermission();
    if (!permission) {
      console.warn("❌ Bluetooth permission denied");
      return;
    }

    console.log("🔍 Starting scan...");
    setAllDevices([]);
    setScanning(true);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        ToastAndroid.show("Please Turn on bluetooth", ToastAndroid.SHORT);
        console.error("❌ Scan error:", error);
        setScanning(false);
        return;
      }

      if (device) {
        setAllDevices((prev) => {
          if (!isDuplicateDevice(prev, device)) {
            console.log("➕ Adding device:", device.name || "Unknown");
            return [...prev, device];
          }
          return prev;
        });
      }
    });

    setTimeout(() => {
      console.log("🛑 Stopping scan after 10s");
      bleManager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  // Watch TH & NPK data updates (so we don’t log stale null values)
  useEffect(() => {
    if (!thData) return;

    setSensorData(prev => ({
      ...prev,
      temp: thData.temp,
      hum: thData.hum,
      water: thData.water,
      pH: thData.pH,
      EC: thData.EC,
      OC: thData.OC
    }));
    dispatch(updateSensorData(thData))
    setHistory(prev => ({
      ...prev,
      temp: [...prev.temp.slice(-9), thData.temp],
      hum: [...prev.hum.slice(-9), thData.hum],
      water: [...prev.water.slice(-9), thData.water],
      pH: [...prev.pH.slice(-9), thData.pH],
      EC: [...prev.EC.slice(-9), thData.EC],
      OC: [...prev.OC.slice(-9), thData.OC]
    }));
  }, [thData]);

  useEffect(() => {
    if (!npkData) return;

    setSensorData(prev => ({
      ...prev,
      N: npkData.N,
      P: npkData.P,
      K: npkData.K
    }));
    dispatch(updateSensorData(npkData))
    setHistory(prev => ({
      ...prev,
      N: [...prev.N.slice(-9), npkData.N],
      P: [...prev.P.slice(-9), npkData.P],
      K: [...prev.K.slice(-9), npkData.K]
    }));
  }, [npkData]);

  // Connect to devices
  const connectToDevice = async () => {
    console.log("🔌 Attempting to connect...");
    setLoading(true);
    bleManager.stopDeviceScan();

    let thConnected = false;
    let npkConnected = false;

    const handleConnection = async (device: Device, deviceName: string) => {
      try {
        const connectedDevice = await device.connect();
        await connectedDevice.discoverAllServicesAndCharacteristics();

        console.log(`✅ Connected to ${deviceName}`);
        setConnected(true);
        setConnectedDevice(connectedDevice);
        await device.requestMTU(256);

        const services = await connectedDevice.services();
        for (const service of services) {
          const characteristics = await service.characteristics();
          for (const char of characteristics) {
            if (char.isNotifiable) {
              char.monitor((err, charData) => {
                if (err) {
                  console.error(`❌ Monitor error on ${deviceName}:`, err);
                  return;
                }
                if (charData?.value) {
                  try {
                    const value = Buffer.from(charData.value, "base64").toString("utf8");
                    const json = JSON.parse(value);

                    if (deviceName === "SoilSensor1") {
                      setThData({
                        temp: json.temp,
                        hum: json.hum,
                        water: json.water,
                        pH: json.pH,
                        EC: json.EC,
                        OC: json.OC,
                      });
                    } else if (deviceName === "SoilSensor2") {
                      setNpkData({
                        N: json.N,
                        P: json.P,
                        K: json.K,
                      });
                    }
                  } catch (e) {
                    console.error(`❌ JSON parse error from ${deviceName}:`, e);
                  }
                }
              });
            }
          }
        }
      } catch (e) {
        console.error(`❌ Connection error with ${deviceName}:`, e);
      }
    };

    for (const device of allDevices) {
      if (device.name === "SoilSensor1") {
        thConnected = true;
        await handleConnection(device, "SoilSensor1");
      }
      if (device.name === "SoilSensor2") {
        npkConnected = true;
        await handleConnection(device, "SoilSensor2");
      }
    }

    setLoading(false);
  };

  return (
    <ScreenWrapper>
      <ThemedView style={{ flex: 1 }}>
        <HomeHeader />
        <ScrollView>
          {loading ? (
            <Loading />
          ) : connected && connectedDevice ? (
            <ConnectedDeviceInfo name={connectedDevice.name ?? "Unknown"} />
          ) : (
            <DeviceScanner
              scanning={scanning}
              devices={allDevices}
              onScan={scanForPeripherals}
              onConnect={connectToDevice}
            />
          )}

          {history.temp.length > 1 && (
            <SensorChart
              history={history}
              visibleSensors={visibleSensors}
              toggleSensor={toggleSensor}
            />
          )}
        </ScrollView>
      </ThemedView>
    </ScreenWrapper>
  );
};

export default Home;
