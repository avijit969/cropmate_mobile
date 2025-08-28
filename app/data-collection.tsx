import Button from '@/components/Button'
import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { wp } from '@/helpers/common'
import uploadImage from '@/helpers/imageUpload'
import { supabase } from '@/lib/supabase'
import { RootState } from '@/store/store'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Image, ScrollView, StyleSheet, ToastAndroid } from 'react-native'
import { useSelector } from 'react-redux'

const DataCollection = () => {
    const sensorData = useSelector((state: RootState) => state.sensorData)
    const collectionData = useSelector((state: RootState) => state.collectionData)
    const [success, setSuccess] = useState(false)
    const handleSubmit = async () => {
        let areaImage = ''
        if (collectionData.areaImage) {
            areaImage = await uploadImage(collectionData.areaImage, 'area_image')
        }
        let soilImage = ''
        if (collectionData.soilImage) {
            soilImage = await uploadImage(collectionData.soilImage, 'soil_image')
        }
        const { data, error } = await supabase
            .from('collection_data')
            .insert([
                {
                    farmer_name: collectionData.farmerName,
                    crop_name: collectionData.cropName,
                    state: collectionData.stateName,
                    district: collectionData.districtName,
                    village: collectionData.villageName,
                    latitude: collectionData.latitude,
                    longitude: collectionData.longitude,
                    area_image: areaImage,
                    seasonal_crop_type: collectionData.seasonalCropType,
                    soil_image: soilImage,
                    temperature: sensorData.temp,
                    humidity: sensorData.hum,
                    water: sensorData.water,
                    ph: sensorData.pH,
                    oc: sensorData.OC,
                    ec: sensorData.EC,
                    n: sensorData.N,
                    p: sensorData.P,
                    k: sensorData.K,
                },
            ])
            .select()
        if (error) {
            console.log(error)
        }
        else {
            ToastAndroid.show('Data saved successfully', ToastAndroid.SHORT)
            setSuccess(true)
        }
    }

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1 }}>
                <Header name="Data Collection" />

                {success ? (
                    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ThemedText style={styles.sectionTitle}>Data saved successfully</ThemedText>
                        <Button title="View Uploaded Data" onPress={() => router.push('/view-collection')} />
                    </ThemedView>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <ThemedText style={styles.sectionTitle}>Farmer & Location Details</ThemedText>

                        {/* ✅ Area Image */}
                        <ThemedText style={{ textAlign: 'center', marginBottom: wp(1) }}>Area Image</ThemedText>
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
                        {/* ✅ Soil Image */}
                        <ThemedText style={{ textAlign: 'center', marginBottom: wp(1) }}>Soil Image</ThemedText>
                        {collectionData.soilImage ? (
                            <Image
                                source={{ uri: collectionData.soilImage }}
                                style={styles.areaImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <ThemedView style={styles.imagePlaceholder}>
                                <ThemedText style={{ color: '#777' }}>No Soil Image</ThemedText>
                            </ThemedView>
                        )}

                        {/* ✅ Other Farmer/Location details */}
                        <ThemedView style={styles.infoCard}>
                            {Object.entries(collectionData).map(([key, value]) => {
                                if (key === 'areaImage' || key === 'sensorData' || key === 'soilImage') return null // skip these two
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
                )}
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
