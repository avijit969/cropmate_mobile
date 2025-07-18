import { Buffer } from 'buffer'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  ToastAndroid
} from 'react-native'
import { BleManager, Device } from 'react-native-ble-plx'
import { useDispatch } from 'react-redux'

import Loading from '@/components/Loading'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedView } from '@/components/ThemedView'
import { setUser } from '@/features/user/userSclice'
import { supabase } from '@/lib/supabase'
import { SensorData } from '@/types'

import ConnectedDeviceInfo from '@/components/ConnectedDeviceInfo'
import DeviceScanner from '@/components/DeviceScanner'
import HomeHeader from '@/components/HomeHeader'
import SensorChart from '@/components/SensorChart'
import { addSensorData } from '@/features/sensordata/sensorDataSclice'
import { BLEService } from '@/helpers/BLManager'
import { ScrollView } from 'react-native-gesture-handler'
const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab'
const CHARACTERISTIC_UUID = 'abcdefab-1234-1234-1234-abcdefabcdef'

const bleManager = new BleManager()

const Home = () => {
  const [loading, setLoading] = useState(true)
  const [sensorData, setSensorData] = useState<SensorData>({})
  const [connected, setConnected] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [allDevices, setAllDevices] = useState<Device[]>([])
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null)

  type HistoryType = {
    temp: number[], hum: number[], N: number[], P: number[], K: number[],
    water: number[], pH: number[], EC: number[], OC: number[],
    S: number[], Zn: number[], Fe: number[], Cu: number[], Mn: number[], B: number[]
  }

  const [history, setHistory] = useState<HistoryType>({
    temp: [], hum: [], N: [], P: [], K: [],
    water: [], pH: [], EC: [], OC: [],
    S: [], Zn: [], Fe: [], Cu: [], Mn: [], B: []
  })

  const [visibleSensors, setVisibleSensors] = useState({
    temp: true, hum: true, N: true, P: true, K: true,
    water: true, pH: true, EC: true, OC: true,
    S: true, Zn: true, Fe: true, Cu: true, Mn: true, B: true
  })

  const dispatch = useDispatch()
  const pollingRef = useRef<number | null>(null)

  const toggleSensor = (key: keyof typeof visibleSensors) => {
    setVisibleSensors(prev => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      const session = await supabase.auth.getSession()
      const authUser = session.data.session?.user
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        if (data) dispatch(setUser(data))
      }
      setLoading(false)
    }

    fetchUserDetails()

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      bleManager.destroy()
    }
  }, [])

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => device.id === nextDevice.id) > -1

  const scanForPeripherals = async () => {
    const permission = await BLEService.requestBluetoothPermission()
    if (!permission) return
    setAllDevices([])
    setScanning(true)
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        ToastAndroid.show("Please Turn on bluetooth", ToastAndroid.SHORT)
        console.error(error)
        setScanning(false)
        return
      }

      if (device) {
        setAllDevices(prev => {
          if (!isDuplicateDevice(prev, device)) {
            return [...prev, device]
          }
          return prev
        })
      }
    })

    setTimeout(() => {
      bleManager.stopDeviceScan()
      setScanning(false)
    }, 10000)
  }

  const connectToDevice = async (device: Device) => {
    setLoading(true)
    bleManager.stopDeviceScan()
    try {
      const connected = await device.connect()
      await connected.discoverAllServicesAndCharacteristics()
      setConnectedDevice(connected)
      setConnected(true)

      pollingRef.current = setInterval(async () => {
        const char = await connected.readCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID)
        if (char?.value) {
          const decoded = Buffer.from(char.value, 'base64').toString('utf8')
          const json = JSON.parse(decoded)
          setSensorData(json)
          dispatch(addSensorData(json))
          setHistory(prev => ({
            temp: [...prev.temp.slice(-9), json.temp ?? 0],
            hum: [...prev.hum.slice(-9), json.hum ?? 0],
            N: [...prev.N.slice(-9), json.N ?? 0],
            P: [...prev.P.slice(-9), json.P ?? 0],
            K: [...prev.K.slice(-9), json.K ?? 0],
            water: [...prev.water.slice(-9), json.water ?? 0],
            pH: [...prev.pH.slice(-9), json.pH ?? 0],
            EC: [...prev.EC.slice(-9), json.EC ?? 0],
            OC: [...prev.OC.slice(-9), json.OC ?? 0],
            S: [...prev.S.slice(-9), json.S ?? 0],
            Zn: [...prev.Zn.slice(-9), json.Zn ?? 0],
            Fe: [...prev.Fe.slice(-9), json.Fe ?? 0],
            Cu: [...prev.Cu.slice(-9), json.Cu ?? 0],
            Mn: [...prev.Mn.slice(-9), json.Mn ?? 0],
            B: [...prev.B.slice(-9), json.B ?? 0],
          }))
        }
      }, 4000)
    } catch (e: any) {
      Alert.alert('Connection Failed', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenWrapper>
      <ThemedView style={{ flex: 1 }}>
        <HomeHeader />
        <ScrollView>

          {loading ? (
            <Loading />
          ) : connected && connectedDevice ? (
            <ConnectedDeviceInfo name={connectedDevice.name ?? 'Unknown'} />
          ) : (
            <DeviceScanner
              scanning={scanning}
              devices={allDevices}
              onScan={scanForPeripherals}
              onConnect={connectToDevice}
            />
          )}

          {history.temp.length > 0 && (
            <SensorChart
              history={history}
              visibleSensors={visibleSensors}
              toggleSensor={toggleSensor}
            />
          )}
        </ScrollView>
      </ThemedView>
    </ScreenWrapper>
  )
}

export default Home
