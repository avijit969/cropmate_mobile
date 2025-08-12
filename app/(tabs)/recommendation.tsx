import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedView } from '@/components/ThemedView'
import { supabase } from '@/lib/supabase'
import { RootState } from '@/store/store'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'

import React, { useEffect, useState } from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native'
import { useSelector } from 'react-redux'

const Recommendation = () => {
    const { user } = useSelector((state: RootState) => state.user)
    const [previousPrediction, setPreviousPrediction] = useState([])
    const [soilNutrientPrivios, setSoilNutrientPrivios] = useState([])
    const [steps, setSteps] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const getPreviousPrediction = async () => {
        const { data, error } = await supabase.from('prediction')
            .select('id , sensor_data(*) , type ,result')
            .eq('created_by', user.id)
            .eq('type', 'crop recommendation')
            .order('created_at', { ascending: false })
            .limit(2)

        if (error) {
            console.log(error)
            return
        }
        setPreviousPrediction(data as any)
    }

    const getsoilNutrientPrivios = async () => {
        const { data, error } = await supabase.from('prediction')
            .select('id , sensor_data(*) , type ,result')
            .eq('created_by', user.id)
            .eq('type', 'soil fertility')
            .order('created_at', { ascending: false })
            .limit(2)

        if (error) {
            console.log(error)
            return
        }
        setSoilNutrientPrivios(data as any)
    }

    const fetchSteps = async () => {
        try {
            const res = await axios.post('https://cropmate-ai-instructor.onrender.com/crop-instructor', {
                previousCropPredictions: previousPrediction,
                soilNutrientData: soilNutrientPrivios
            })
            setSteps(res.data)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getPreviousPrediction()
        getsoilNutrientPrivios()
    }, [])

    useEffect(() => {
        if (previousPrediction.length && soilNutrientPrivios.length) {
            fetchSteps()
        }
    }, [previousPrediction, soilNutrientPrivios])

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1 }}>
                <Header name="Recommendation" />
                {
                    loading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Generating recommendations...</Text>
                        </View>
                    ) : steps ? (
                        <ScrollView contentContainerStyle={styles.cardContainer}>
                            {
                                Object.entries(steps).map(([key, value]: any) => (
                                    <View key={key} style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <Ionicons name="leaf" size={20} color="#4CAF50" />
                                            <Text style={styles.cardTitle}>{key.replace('step', 'Step ')}</Text>
                                        </View>
                                        <Text style={styles.cardContent}>{value}</Text>
                                    </View>
                                ))
                            }
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No recommendations found.</Text>
                        </View>
                    )
                }
            </ThemedView>
        </ScreenWrapper>
    )
}

export default Recommendation

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#555',
    },
    cardContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        marginLeft: 8,
        fontSize: 18,
        fontWeight: '600',
        color: '#2E7D32',
    },
    cardContent: {
        fontSize: 15,
        color: '#333',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    }
})
