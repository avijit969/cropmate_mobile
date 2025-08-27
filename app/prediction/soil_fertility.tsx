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


const SoilFertility = () => {
    const sensorData = useSelector((state: RootState) => state.sensorData)
    const { user } = useSelector((state: RootState) => state.user)
    const [form, setForm] = useState({
        N: '', P: '', K: '', pH: '', EC: '', OC: '',
        S: '', Zn: '', Fe: '', Cu: '', Mn: '', B: '',
        Humidity: '', Temperature: '', Water: ''
    })

    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setForm({
            Temperature: sensorData.temp?.toString() ?? '',
            Humidity: sensorData.hum?.toString() ?? '',
            Water: sensorData.water?.toString() ?? '',
            N: sensorData.N?.toString() ?? '',
            P: sensorData.P?.toString() ?? '',
            K: sensorData.K?.toString() ?? '',
            pH: sensorData.pH?.toString() ?? '',
            EC: sensorData.EC?.toString() ?? '',
            OC: sensorData.OC?.toString() ?? '',
            S: sensorData.S?.toString() ?? '',
            Zn: sensorData.Zn?.toString() ?? '',
            Fe: sensorData.Fe?.toString() ?? '',
            Cu: sensorData.Cu?.toString() ?? '',
            Mn: sensorData.Mn?.toString() ?? '',
            B: sensorData.B?.toString() ?? '',
        })
    }, [sensorData])

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const savePreditionWithSensorData = async () => {
        const { data: response, error: sensorDataError } = await supabase.from("sensor_data").insert([{
            n: form.N,
            p: form.P,
            k: form.K,
            pH: form.pH,
            s: form.S,
            zn: form.Zn,
            fe: form.Fe,
            cu: form.Cu,
            mn: form.Mn,
            b: form.B,
            humidity: sensorData.hum,
            temperature: sensorData.temp,
            water: sensorData.water,
            created_by: user?.id
        }]).select()
        console.log(response, sensorDataError)
        if (sensorDataError) {
            console.error('Error saving sensor data:', sensorDataError)
        }
        if (!response) return
        const { data, error } = await supabase
            .from('prediction')
            .insert([
                { created_by: user?.id, result, type: 'soil fertility', sensor_data: response[0].id },
            ])
            .select()

        if (error) {
            console.error('Error saving prediction:', error)
        }
        if (!data) return
    }

    const handlePrediction = async () => {
        setLoading(true)
        setResult(null)
        try {
            const { data } = await axios.post(
                `${process.env.EXPO_PUBLIC_ML_API_URL}/predict-soil-fertility`,
                form,
                { headers: { 'Content-Type': 'application/json' } }
            )
            console.log('Prediction Response:', data)

            if (data.message === 'Fertile') {
                setResult('✅ The soil is Fertile and suitable for cultivation.')
                await savePreditionWithSensorData()
            } else if (data.message === 'Not Fertile') {
                setResult('⚠️ The soil is Not Fertile. Consider adding compost, organic fertilizers, or crop rotation.')
                await savePreditionWithSensorData()
            } else {
                setResult('❓ Unknown prediction result.')
            }
        } catch (err) {
            console.log('Prediction Error:', err)
            setResult('❌ Prediction failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // ✅ Hide these fields in UI
    const hiddenFields = ['S', 'Zn', 'Fe', 'Cu', 'Mn', 'B']

    // ✅ Only show non-hidden fields
    const visibleFields = Object.entries(form).filter(([key]) => !hiddenFields.includes(key))

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1, paddingHorizontal: wp(2) }}>
                <Header name="Check Soil Fertility" right={<Ionicons name="ellipsis-vertical-outline" size={24} color="black" />} />
                <ScrollView contentContainerStyle={styles.form}>
                    {visibleFields.map(([key, val], index) => {
                        if (index % 3 === 0) {
                            const second = visibleFields[index + 1]
                            const third = visibleFields[index + 2]
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
                        <Button title={loading ? 'Predicting...' : 'Check Soil Fertility'} onPress={handlePrediction} />
                        <ThemedText style={styles.or}>OR</ThemedText>
                        <Button title='View History' onPress={() => router.push(`/prediction/history/${"soil fertility"}` as "/prediction/history/[type]")} />
                    </ThemedView>
                </ScrollView>
            </ThemedView>
        </ScreenWrapper>
    )
}

export default SoilFertility

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

