import Button from '@/components/Button'
import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { theme } from '@/constants/theme'
import { hp, wp } from '@/helpers/common'
import { RootState } from '@/store/store'
import { useRouter } from 'expo-router'
import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'

const Prediction = () => {
    const sensorData = useSelector((state: RootState) => state.sensorData)
    const router = useRouter()
    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1 }}>
                <Header name="Prediction" />
                <ScrollView style={{ paddingHorizontal: wp(1) }}>
                    <ThemedView style={styles.section}>
                        <ThemedText type="subtitle">Soil Fertility Analysis</ThemedText>
                        <ThemedText>
                            Analyze your soil's nutrient composition based on recent sensor data.
                        </ThemedText>
                        <Button title="Analyze Soil Fertility" onPress={() => {
                            router.push('/prediction/soil_fertility')
                        }} />
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText type="subtitle">Crop Recommendation (Nutrient-Based)</ThemedText>
                        <ThemedText>
                            Get crop suggestions suitable for your field based on nutrient levels like N, P, K, pH, etc.
                        </ThemedText>
                        <Button title="Get Nutrient-Based Crop Prediction" onPress={() => {
                            router.push('/prediction/crop_nutrient')
                        }} />
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText type="subtitle">Crop Recommendation (Location-Based)</ThemedText>
                        <ThemedText>
                            Get crop suggestions based on your current GPS location and regional farming data.
                        </ThemedText>
                        <Button title="Get Location-Based Crop Prediction" onPress={() => {
                            router.push('/prediction/crop_location')
                        }} />
                    </ThemedView>
                </ScrollView>
            </ThemedView>
        </ScreenWrapper>
    )
}

export default Prediction

const styles = StyleSheet.create({
    section: {
        marginTop: hp(2),
        padding: wp(4),
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: theme.radius.md,
        gap: 10,
    },
})
