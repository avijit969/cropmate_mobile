import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import {
    Alert,
    Dimensions,
    Platform,
    StyleSheet,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native'
import { LineChart } from 'react-native-chart-kit'

import { ThemedText } from '@/components/ThemedText'
import { theme } from '@/constants/theme'
import { wp } from '@/helpers/common'
import Button from './Button'

type HistoryType = {
    temp: number[]
    hum: number[]
    N: number[]
    P: number[]
    K: number[]
    water: number[]
    pH: number[]
    EC: number[]
    OC: number[]
    S: number[]
    Zn: number[]
    Fe: number[]
    Cu: number[]
    Mn: number[]
    B: number[]
}

type Props = {
    history: HistoryType
    visibleSensors: Record<keyof HistoryType, boolean>
    toggleSensor: (key: keyof HistoryType) => void
}

const SensorChart: React.FC<Props> = ({ history, visibleSensors, toggleSensor }) => {
    const labels = history.temp.map((_, idx) => `${idx + 1}`)
    const router = useRouter()

    const sensorColors: Record<keyof HistoryType, string> = {
        temp: 'red',
        hum: 'blue',
        N: 'green',
        P: 'orange',
        K: 'purple',
        water: 'teal',
        pH: 'brown',
        EC: 'pink',
        OC: 'gray',
        S: 'black',
        Zn: 'lightgray',
        Fe: 'darkgray',
        Cu: 'lightblue',
        Mn: 'darkblue',
        B: 'darkgreen',
    }

    const sensorGroups: (keyof HistoryType)[][] = [
        ['temp', 'hum', 'water', 'pH', 'EC'],
        ['N', 'P', 'K', 'OC', 'S'],
        ['Zn', 'Fe', 'Cu', 'Mn', 'B'],
    ]

    return (
        <View style={{ padding: wp(3), marginTop: 10 }}>
            <ThemedText type='subtitle' style={{ fontWeight: 'bold', marginBottom: 10 }}>
                Live Sensor Data Chart
            </ThemedText>

            {sensorGroups.map((group, index) => {
                const groupVisible = group.filter((key) => visibleSensors[key])
                const hasVisible = groupVisible.length > 0

                return (
                    <View key={index} style={{ marginBottom: 24 }}>
                        {/* Checkboxes for this group */}
                        <View style={styles.checkboxContainer}>
                            {group.map((key) => (
                                <TouchableOpacity
                                    key={key}
                                    onPress={() => toggleSensor(key)}
                                    style={styles.checkbox}
                                >
                                    <Ionicons
                                        name={visibleSensors[key] ? 'checkbox' : 'square-outline'}
                                        size={18}
                                        color={visibleSensors[key] ? theme.colors.primary : '#999'}
                                    />
                                    <ThemedText type='defaultSemiBold' style={{ marginLeft: 6 }}>{key}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Chart for this group */}
                        {hasVisible && (
                            <LineChart
                                data={{
                                    labels,
                                    datasets: groupVisible.map((key) => ({
                                        data: history[key],
                                        color: () => sensorColors[key],
                                        strokeWidth: 2,
                                    })),
                                    legend: groupVisible,
                                }}
                                width={Dimensions.get('window').width - 30}
                                height={240}
                                chartConfig={{
                                    backgroundGradientFrom: '#000',
                                    backgroundGradientTo: '#222',
                                    decimalPlaces: 1,
                                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                    propsForDots: {
                                        r: '4',
                                        strokeWidth: '1',
                                        stroke: '#fff',
                                    },
                                }}
                                bezier
                                style={{ borderRadius: 12 }}
                                onDataPointClick={({ value, index, dataset }: any) => {
                                    const sensorKey = groupVisible[dataset?.datasetIndex || 0]
                                    const label = labels[index]
                                    const message = `${sensorKey} at ${label}: ${value}`

                                    if (Platform.OS === 'android') {
                                        ToastAndroid.show(message, ToastAndroid.SHORT)
                                    } else {
                                        Alert.alert('Sensor Value', message)
                                    }
                                }}
                            />
                        )}
                    </View>
                )
            })}

            <Button
                title='View Prediction'
                onPress={() => router.push('/prediction')}
                style={{ marginVertical: 10 }}
            />
        </View>
    )
}

export default SensorChart

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        marginBottom: 8,
    },
})
