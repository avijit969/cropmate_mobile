import Button from '@/components/Button'
import Header from '@/components/Header'
import InputField from '@/components/InputField'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { wp } from '@/helpers/common'
import { RootState } from '@/store/store'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

const SoilFertility = () => {
    const sensorData = useSelector((state: RootState) => state.sensorData)

    const [form, setForm] = useState({
        N: '', P: '', K: '', pH: '', EC: '', OC: '',
        S: '', Zn: '', Fe: '', Cu: '', Mn: '', B: ''
    })

    const [result, setResult] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // ✅ Sync form with sensorData changes
    useEffect(() => {
        setForm({
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

    const handlePrediction = async () => {
        setLoading(true)
        setResult(null)
        try {
            const cleanedForm = Object.fromEntries(
                Object.entries(form).map(([key, val]) => [key, parseFloat(val)])
            )

            const response = await fetch(
                'https://cropmate-ml-backend.onrender.com/predict-soil-fertility',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cleanedForm),
                }
            )

            const data = await response.json()
            const message = data.message?.toLowerCase()

            if (message === 'fertile') {
                setResult('✅ The soil is Fertile and suitable for cultivation.')
            } else if (message === 'not fertile') {
                setResult('⚠️ The soil is Not Fertile. Consider adding compost, organic fertilizers, or crop rotation.')
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
                <Header name="Check Soil Fertility" />
                <ScrollView contentContainerStyle={styles.form}>
                    {fields.map(([key, val], index) => {
                        // Group into rows of 3
                        if (index % 3 === 0) {
                            const second = fields[index + 1]
                            const third = fields[index + 2]
                            return (
                                <View key={key} style={styles.row}>
                                    <View style={styles.inputWrapper}>
                                        <ThemedText type="default" style={styles.label}>{key}</ThemedText>
                                        <InputField
                                            placeholder={`Enter ${key}`}
                                            value={val}
                                            onChange={value => handleChange(key as keyof typeof form, value)}
                                        />
                                    </View>
                                    {second && (
                                        <View style={styles.inputWrapper}>
                                            <ThemedText type="default" style={styles.label}>{second[0]}</ThemedText>
                                            <InputField
                                                placeholder={`Enter ${second[0]}`}
                                                value={second[1]}
                                                onChange={value => handleChange(second[0] as keyof typeof form, value)}
                                            />
                                        </View>
                                    )}
                                    {third && (
                                        <View style={styles.inputWrapper}>
                                            <ThemedText type="default" style={styles.label}>{third[0]}</ThemedText>
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

                    <Button title={loading ? 'Predicting...' : 'Check Soil Fertility'} onPress={handlePrediction} />

                    {result && (
                        <ThemedView>
                            <ThemedText style={styles.result} type="subtitle">
                                Result</ThemedText>
                            <ThemedText style={styles.result}>{result}</ThemedText>
                        </ThemedView>

                    )}
                </ScrollView>
            </ThemedView>
        </ScreenWrapper>
    )
}

export default SoilFertility

const styles = StyleSheet.create({
    form: {
        paddingBottom: 40,
        gap: 8,
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
    result: {
        marginTop: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 20,
    },
})
