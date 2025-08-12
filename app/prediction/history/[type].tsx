import Header from '@/components/Header'
import Loading from '@/components/Loading'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { wp } from '@/helpers/common'
import { supabase } from '@/lib/supabase'
import { RootState } from '@/store/store'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'

interface HistoryItem {
    id: string
    result: string
    type: string
    sensor_data: {
        n: number
        p: number
        k: number
        pH: number
        water: number
        humidity: string
        temperature: string
        created_at: string
        rainfall?: string
    },
    loaction?: {
        latitude: number
        longitude: number
        district: string
        area: string
        season: string
    }
}

const History = () => {
    const { type } = useLocalSearchParams()
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(false)
    const user = useSelector((state: RootState) => state.user.user)
    if (type === 'crop recommendation location') {
        (async () => {
            const { data, error } = await supabase
                .from('location_prediction')
                .select('*')
                .eq('created_by', user?.id)
                .order('created_at', { ascending: false })
            if (data) {
                setHistory(data.map((item: any) => ({
                    ...item,
                    result: `Predicted crop is ${item.prediction}`,
                    sensor_data: {
                        n: item.n,
                        p: item.p,
                        k: item.k,
                        pH: item.pH,
                        water: item.Water_Level,
                        humidity: item.humidity,
                        temperature: item.Temperature,
                        created_at: item.created_at,
                        rainfall: item.rainfall
                    }
                    ,
                    loaction: {
                        latitude: item.Latitude,
                        longitude: item.Longitude,
                        district: item.District,
                        area: item.Area,
                        season: item.Season
                    }
                })))
            }
        })()
    }
    const getHistory = async () => {
        if (type === 'crop recommendation location') {
            return
        }
        setLoading(true)
        const { data, error } = await supabase
            .from('prediction')
            .select('id, result, type, sensor_data(*)')
            .eq('type', type).eq('created_by', user?.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching history:', error)
            setLoading(false)
        } else {
            setHistory(
                (data || []).map((item: any) => ({
                    ...item,
                    sensor_data: Array.isArray(item.sensor_data) && item.sensor_data.length > 0
                        ? item.sensor_data[0]
                        : item.sensor_data
                }))
            )
            setLoading(false)
        }
    }

    useEffect(() => {
        getHistory()
    }, [type])

    const renderItem = ({ item }: { item: HistoryItem }) => (
        <ThemedView style={styles.card}>
            <ThemedText type="subtitle" style={styles.resultText}>
                {item.result}
            </ThemedText>
            <ThemedText type="default" style={styles.timestamp}>
                {new Date(item.sensor_data.created_at).toLocaleString()}
            </ThemedText>

            {item.sensor_data.n && <ThemedView style={styles.dataRow}>
                <ThemedText>N: {item.sensor_data.n}</ThemedText>
                <ThemedText>P: {item.sensor_data.p}</ThemedText>
                <ThemedText>K: {item.sensor_data.k}</ThemedText>
            </ThemedView>}
            {item.loaction && <ThemedView style={styles.dataRow}>
                <ThemedText>Location: {item.loaction.district}, {item.loaction.area}</ThemedText>
            </ThemedView>}

            <ThemedView style={styles.dataRow}>
                <ThemedText>pH: {item.sensor_data.pH}</ThemedText>
                {item.sensor_data.water ? <ThemedText>Water: {item.sensor_data.water}</ThemedText> : <ThemedText>Rainfail: {item.sensor_data.rainfall}</ThemedText>}
                <ThemedText>Temp: {item.sensor_data.temperature}°C</ThemedText>
            </ThemedView>

            {item.sensor_data.humidity && <ThemedView style={styles.dataRow}>
                <ThemedText>Humidity: {item.sensor_data.humidity}%</ThemedText>
            </ThemedView>}
        </ThemedView>
    )

    return (
        <ScreenWrapper>
            <ThemedView style={styles.container}>
                <Header name={`${type?.toString().toUpperCase()} History`} />
                {loading ?
                    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Loading />
                    </ThemedView> :
                    history.length === 0 ? (
                        <ThemedText type="default" style={styles.emptyText}>
                            No history found.
                        </ThemedText>
                    ) : (
                        <FlatList
                            data={history}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        />
                    )}
            </ThemedView>
        </ScreenWrapper>
    )
}

export default History

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(2),
        gap: 10
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    card: {
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 3,
    },
    resultText: {
        fontSize: 16,
        marginBottom: 4,
    },
    timestamp: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 8,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        borderRadius: 5,
        padding: 5,
        backgroundColor: '#f1f1f1',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
        opacity: 0.6,
    },
})
