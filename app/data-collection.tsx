import Button from '@/components/Button'
import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { wp } from '@/helpers/common'
import { RootState } from '@/store/store'
import React from 'react'
import { Image, ScrollView, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'

const DataCollection = () => {
    const sensorData = useSelector((state: RootState) => state.sensorData)
    const collectionData = useSelector((state: RootState) => state.collectionData)

    const handleSubmit = () => {
        console.log('Submitted Data:', { sensorData, collectionData })
        // 👉 save to Redux or API here
    }

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1 }}>
                <Header name="Data Collection" />

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <ThemedText style={styles.sectionTitle}>Farmer & Location Details</ThemedText>

                    {/* ✅ Area Image */}
                    {collectionData.areaImage ? (
                        <Image
                            source={{ uri: collectionData.areaImage }}
                            style={styles.areaImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <ThemedView style={styles.imagePlaceholder}>
                            <ThemedText style={{ color: '#777' }}>No Area Image</ThemedText>
                        </ThemedView>
                    )}

                    {/* ✅ Other Farmer/Location details */}
                    <ThemedView style={styles.infoCard}>
                        {Object.entries(collectionData).map(([key, value]) => {
                            if (key === 'areaImage' || key === 'sensorData') return null // skip these two
                            return (
                                <ThemedView key={key} style={styles.infoRow}>
                                    <ThemedText style={styles.infoKey}>{key}</ThemedText>
                                    <ThemedText style={styles.infoValue}>
                                        {value === null || value === '' ? '-' : String(value)}
                                    </ThemedText>
                                </ThemedView>
                            )
                        })}
                    </ThemedView>

                    <ThemedText style={styles.sectionTitle}>Sensor Data</ThemedText>

                    <ThemedView style={styles.grid}>
                        {Object.entries(sensorData).map(([key, value]) => (
                            <ThemedView key={key} style={styles.card}>
                                <ThemedText style={styles.key}>{key}</ThemedText>
                                <ThemedText style={styles.value}>{String(value)}</ThemedText>
                            </ThemedView>
                        ))}
                    </ThemedView>

                    <Button title="Submit" onPress={handleSubmit} />
                </ScrollView>
            </ThemedView>
        </ScreenWrapper>
    )
}

export default DataCollection

const styles = StyleSheet.create({
    scrollContainer: {
        padding: wp(4),
        paddingBottom: wp(10),
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: wp(3),
    },
    areaImage: {
        width: '100%',
        height: wp(50),
        borderRadius: 12,
        marginBottom: wp(4),
    },
    imagePlaceholder: {
        width: '100%',
        height: wp(50),
        borderRadius: 12,
        marginBottom: wp(4),
        backgroundColor: '#eaeaea',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: wp(3),
        marginBottom: wp(5),
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: wp(2),
        borderBottomWidth: 0.5,
        borderBottomColor: '#ddd',
        padding: wp(2),
        borderRadius: 12,
    },
    infoKey: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        textTransform: 'capitalize',
    },
    infoValue: {
        fontSize: 14,
        color: '#222',
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: wp(5),
    },
    card: {
        width: '30%', // 3 per row
        backgroundColor: '#f0f4f8',
        marginBottom: wp(3),
        paddingVertical: wp(1),
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    key: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4,
        color: '#222',
    },
})
