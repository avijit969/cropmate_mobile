import { Ionicons } from '@expo/vector-icons'
import LottieView from 'lottie-react-native'
import React from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Device } from 'react-native-ble-plx'

import Button from '@/components/Button'
import { ThemedText } from '@/components/ThemedText'
import { wp } from '@/helpers/common'
import { ThemedView } from './ThemedView'

type DeviceScannerProps = {
    scanning: boolean
    devices: Device[]
    onScan: () => void
    onConnect: (device: Device) => void
}

const DeviceScanner: React.FC<DeviceScannerProps> = ({
    scanning,
    devices,
    onScan,
    onConnect,
}) => {
    return (
        <View style={styles.container}>
            <ThemedView style={styles.lottieWrapper}>
                <View style={styles.lottieContainer}>
                    <LottieView
                        source={
                            scanning
                                ? require('@/assets/lottie/bluetooth-scan.json')
                                : require('@/assets/lottie/disconnected.json')
                        }
                        autoPlay
                        loop
                        style={styles.lottie}
                        resizeMode="cover"
                    />
                </View>
            </ThemedView>
            {!scanning && (
                <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
                    {devices.length > 0
                        ? 'Select a device to connect'
                        : 'No devices found, please scan'}
                </ThemedText>
            )}
            <Button
                title={scanning ? 'Scanning...' : 'Scan Devices'}
                onPress={onScan}
                style={styles.scanButton}
            />

            <FlatList
                data={devices}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.flatListContent}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={({ item }) => {
                    // Show only 'SoilSensor' in the UI regardless of actual device name
                    const displayName = item.name?.includes('SoilSensor') ? 'SoilSensor' : item.name || 'Unknown';
                    return (
                        <TouchableOpacity
                            onPress={() => onConnect(item)}
                            style={styles.deviceCard}
                        >
                            <Ionicons name="bluetooth" size={28} color="#4F46E5" />
                            <ThemedText style={styles.deviceName}>
                                {displayName}
                            </ThemedText>
                        </TouchableOpacity>
                    )
                }}
            />
        </View>
    )
}

export default DeviceScanner

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 20,
    },
    lottieWrapper: {
        alignItems: 'center',
        padding: 20,
    },
    lottieContainer: {
        width: 200,
        height: 200,
        borderRadius: 20,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
    scanButton: {
        marginBottom: 10,
    },
    flatListContent: {
        paddingHorizontal: 10,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    deviceCard: {
        width: wp(40),
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginLeft: 10,
        marginRight: 10,
    },
    deviceName: {
        marginTop: 6,
        textAlign: 'center',
    },
})
