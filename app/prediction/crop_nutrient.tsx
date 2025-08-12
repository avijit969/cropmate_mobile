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
import axios from 'axios'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

const CropNutrient = () => {
    const sensorData = useSelector((state: RootState) => state.sensorData)
    const user = useSelector((state: RootState) => state.user.user)
    const [form, setForm] = useState({
        N: '', P: '', K: '', ph: '',
        Humidity: '', Temperature: '', Rainfall: ''
    })

    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setForm({
            Temperature: sensorData.temp?.toString() ?? '',
            Humidity: sensorData.hum?.toString() ?? '',
            Rainfall: sensorData.water?.toString() ?? '',
            N: sensorData.N?.toString() ?? '',
            P: sensorData.P?.toString() ?? '',
            K: sensorData.K?.toString() ?? '',
            ph: sensorData.pH?.toString() ?? ''
        })
    }, [sensorData])

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const savePredictionWithSensorData = async (predictedCrop: string) => {
        const { data: sensorResponse, error: sensorDataError } = await supabase
            .from("sensor_data")
            .insert([{
                n: form.N,
                p: form.P,
                k: form.K,
                pH: form.ph,
                humidity: form.Humidity,
                temperature: form.Temperature,
                rainfall: form.Rainfall,
                created_by: user?.id
            }])
            .select()

        if (sensorDataError) {
            console.error('Error saving sensor data:', sensorDataError)
            return
        }

        if (!sensorResponse) return

        const { data, error } = await supabase
            .from('prediction')
            .insert([
                {
                    created_by: user?.id,
                    result: result,
                    type: 'crop recommendation',
                    sensor_data: sensorResponse[0].id
                }
            ])
            .select()

        if (error) {
            console.error('Error saving prediction:', error)
        }
    }

    const handlePrediction = async () => {
        setLoading(true)
        setResult(null)

        try {


            const { data } = await axios.post(
                `${process.env.EXPO_PUBLIC_ML_API_URL}/predict-crop`,
                form,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            const predictedCrop = data?.predicted_crop

            if (predictedCrop) {
                const message = `🌾 Recommended Crop: ${predictedCrop.charAt(0).toUpperCase() + predictedCrop.slice(1)}`
                setResult(message)
                await savePredictionWithSensorData(predictedCrop)
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

    const fields = Object.entries(form)

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1, paddingHorizontal: wp(2) }}>
                <Header
                    name="Crop Recommendation"
                    right={<Ionicons name="ellipsis-vertical-outline" size={24} />}
                />
                <ScrollView contentContainerStyle={styles.form}>
                    {fields.map(([key, val], index) => {
                        if (index % 3 === 0) {
                            const second = fields[index + 1]
                            const third = fields[index + 2]
                            return (
                                <View key={key} style={styles.row}>
                                    <View style={styles.inputWrapper}>
                                        <ThemedText type="defaultSemiBold" style={styles.label}>{key}</ThemedText>
                                        <InputField
                                            placeholder={`Enter ${key}`}
                                            value={val}
                                            onChange={value => handleChange(key as keyof typeof form, value)}
                                        />
                                    </View>
                                    {second && (
                                        <View style={styles.inputWrapper}>
                                            <ThemedText type="defaultSemiBold" style={styles.label}>{second[0]}</ThemedText>
                                            <InputField
                                                placeholder={`Enter ${second[0]}`}
                                                value={second[1]}
                                                onChange={value => handleChange(second[0] as keyof typeof form, value)}
                                            />
                                        </View>
                                    )}
                                    {third && (
                                        <View style={styles.inputWrapper}>
                                            <ThemedText type="defaultSemiBold" style={styles.label}>{third[0]}</ThemedText>
                                            <InputField
                                                placeholder={`Enter ${third[0]}`}
                                                value={third[1]}
                                                onChange={value => handleChange(third[0] as keyof typeof form, value)}
                                            />
                                        </View>
                                    )}
                                </View>
                            )
                        }
                        return null
                    })}

                    {result && (
                        <ThemedView>
                            <ThemedText style={styles.result} type="subtitle">Result</ThemedText>
                            <ThemedText style={styles.result}>{result}</ThemedText>
                        </ThemedView>
                    )}

                    <ThemedView style={styles.buttonContainer}>
                        <Button title={loading ? 'Predicting...' : 'Recommend Crop'} onPress={handlePrediction} />
                        <ThemedText style={styles.or}>OR</ThemedText>
                        <Button title='View History' onPress={() => router.push(`/prediction/history/${"crop recommendation"}` as "/prediction/history/[type]")} />
                    </ThemedView>
                </ScrollView>
            </ThemedView>
        </ScreenWrapper>
    )
}

export default CropNutrient

const styles = StyleSheet.create({
    form: {
        paddingBottom: 40,
        gap: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    inputWrapper: {
        flex: 1,
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
