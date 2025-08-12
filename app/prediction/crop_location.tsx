import Button from '@/components/Button'
import Header from '@/components/Header'
import InputField from '@/components/InputField'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { hp, wp } from '@/helpers/common'
import { supabase } from '@/lib/supabase'
import { RootState } from '@/store/store'
import { Ionicons } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import axios from 'axios'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

const districts = ['Gajapati', 'Rayagada', 'Koraput']
const areas = [
    'R.Udayagiri', 'Paralakhemundi', 'Mohana', 'Rayagada', 'Sunabeda', 'Gunupur',
    'Borigumma', 'Kasinagar', 'Koraput', 'Jeypore', 'Padmapur', 'Kashipur'
]
const seasons = ['Pre-Kharif', 'Rabi']


const CropLocation = () => {
    const sensorData = useSelector((state: RootState) => state.sensorData)
    const user = useSelector((state: RootState) => state.user.user)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [form, setForm] = useState({
        Latitude: '',
        Longitude: '',
        District: '',
        Area: '',
        Season: '',
        Temperature: '',
        Moisture: '',
        Water_Level: '',
        pH: '',
        Nitrogen: '',
        Phosphorous: '',
        Potassium: '',
        EC: '',
        OC: ''
    })

    const [result, setResult] = useState<string | null>(null)

    useEffect(() => {
        setForm(prev => ({
            ...prev,
            Temperature: sensorData.temp?.toString() ?? '',
            Moisture: sensorData.hum?.toString() ?? '',
            Water_Level: sensorData.water?.toString() ?? '',
            Nitrogen: sensorData.N?.toString() ?? '',
            Phosphorous: sensorData.P?.toString() ?? '',
            Potassium: sensorData.K?.toString() ?? '',
            pH: sensorData.pH?.toString() ?? ''
        }))
    }, [sensorData])

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const saveLocationPrediction = async (predictedCrop: string) => {
        const { error } = await supabase
            .from('location_prediction')
            .insert([
                {
                    ...form,
                    created_by: user?.id,
                    prediction: predictedCrop
                }
            ])

        if (error) {
            console.error('Save error:', error)
        }
    }

    const handlePrediction = async () => {
        setLoading(true)
        setResult(null)

        try {
            const { data } = await axios.post(
                `${process.env.EXPO_PUBLIC_ML_API_URL}/predict-crop-location`,
                {
                    Latitude: parseFloat(form.Latitude),
                    Longitude: parseFloat(form.Longitude),
                    District: form.District,
                    Area: form.Area,
                    Season: form.Season,
                    Temperature: parseFloat(form.Temperature),
                    Moisture: parseFloat(form.Moisture),
                    Water_Level: parseFloat(form.Water_Level),
                    pH: parseFloat(form.pH),
                    Nitrogen: parseFloat(form.Nitrogen),
                    Phosphorous: parseFloat(form.Phosphorous),
                    Potassium: parseFloat(form.Potassium),
                    EC: parseFloat(form.EC),
                    OC: parseFloat(form.OC),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            const predictedCrop = data?.predicted_crop

            if (predictedCrop) {
                const message = `🌾 Recommended Crop: ${predictedCrop.charAt(0).toUpperCase() + predictedCrop.slice(1)}`
                setResult(message)
                await saveLocationPrediction(predictedCrop)
            } else {
                setResult('❓ Unknown prediction result.')
            }
        } catch (err) {
            console.error('Prediction Error:', err)
            setResult('❌ Prediction failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }


    const renderInput = (label: keyof typeof form) => (
        <View style={styles.inputWrapper} key={label}>
            <ThemedText type="defaultSemiBold" style={styles.label}>{label}</ThemedText>
            <InputField
                placeholder={`Enter ${label}`}
                value={form[label]}
                onChange={(val) => handleChange(label, val)}
            />
        </View>
    )

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1, paddingHorizontal: wp(2) }}>
                <Header
                    name="Crop Recommendation"
                    right={<Ionicons name="leaf-outline" size={24} />}
                />
                <ScrollView contentContainerStyle={styles.form}>
                    {/* Dropdowns */}
                    <ThemedText style={styles.label}>District</ThemedText>
                    <Picker
                        selectedValue={form.District}
                        onValueChange={(val) => handleChange('District', val)}>
                        <Picker.Item label="Select District" value="" />
                        {districts.map(d => <Picker.Item key={d} label={d} value={d} />)}
                    </Picker>

                    <ThemedText style={styles.label}>Area</ThemedText>
                    <Picker
                        selectedValue={form.Area}
                        onValueChange={(val) => handleChange('Area', val)}>
                        <Picker.Item label="Select Area" value="" />
                        {areas.map(a => <Picker.Item key={a} label={a} value={a} />)}
                    </Picker>

                    <ThemedText style={styles.label}>Season</ThemedText>
                    <Picker
                        selectedValue={form.Season}
                        onValueChange={(val) => handleChange('Season', val)}>
                        <Picker.Item label="Select Season" value="" />
                        {seasons.map(s => <Picker.Item key={s} label={s} value={s} />)}
                    </Picker>

                    {/* Text Inputs */}
                    {[
                        'Latitude', 'Longitude', 'Temperature', 'Moisture', 'Water_Level',
                        'pH', 'Nitrogen', 'Phosphorous', 'Potassium', 'EC', 'OC'
                    ].map(field => renderInput(field as keyof typeof form))}

                    {result && (
                        <ThemedView>
                            <ThemedText style={styles.result} type="subtitle">Result</ThemedText>
                            <ThemedText style={styles.result}>{result}</ThemedText>
                        </ThemedView>
                    )}

                    <ThemedView style={styles.buttonContainer}>
                        <Button title={loading ? 'Predicting...' : 'Recommend Crop'} onPress={handlePrediction} />
                        <ThemedText style={styles.or}>OR</ThemedText>
                        <Button title='View History' onPress={() => router.push(`/prediction/history/${"crop recommendation location"}` as "/prediction/history/[type]")} />
                    </ThemedView>
                </ScrollView>
            </ThemedView>
        </ScreenWrapper>
    )
}

export default CropLocation

const styles = StyleSheet.create({
    form: {
        paddingBottom: 40,
        gap: 8,
    },
    inputWrapper: {
        marginBottom: 12,
    },
    label: {
        marginBottom: 4,
        marginLeft: 4,
        fontSize: 14,
    },
    buttonContainer: {
        padding: wp(2),
        gap: hp(1)
    },
    or: {
        textAlign: 'center',
    },
    result: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 20,
    },
})
