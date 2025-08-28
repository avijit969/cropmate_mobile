import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { wp } from '@/helpers/common'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native'

const ViewCollection = () => {
    const router = useRouter()
    const [collectionData, setCollectionData] = useState([])

    useEffect(() => {
        const fetchCollectionData = async () => {
            let { data: collection_data, error } = await supabase
                .from('collection_data')
                .select('*')
            if (error) {
                console.log(error)
            } else {
                setCollectionData(collection_data as any)
                console.log(JSON.stringify(collection_data, null, 2))
            }
        }
        fetchCollectionData()
    }, [])

    const renderItem = ({ item }: any) => (
        <ThemedView style={styles.card}>
            <Image
                source={{ uri: item.area_image }}
                style={styles.image}
                resizeMode="cover"
            />
            <ThemedView style={styles.info}>
                <ThemedText style={styles.title}>{item.crop_name}</ThemedText>
                <ThemedText style={styles.subtitle}>
                    Farmer: {item.farmer_name}
                </ThemedText>
                <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ThemedText style={styles.details}>
                        📍 {item.village}, {item.district}, {item.state}
                    </ThemedText>
                    <TouchableOpacity
                        onPress={() => router.push(`/map-view?latitude=${item.latitude}&longitude=${item.longitude}&area=${item.village}, ${item.district}, ${item.state}` as any)}
                    >
                        <ThemedText style={styles.viewInMap}>View In Map</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
                <ThemedText style={styles.details}>
                    🌡️ {item.temperature}°C | 💧 {item.humidity}%
                </ThemedText>
                <ThemedText style={styles.details}>
                    pH: {item.ph} | EC: {item.ec} | OC: {item.oc}
                </ThemedText>
                <ThemedText style={styles.details}>
                    N: {item.n} | P: {item.p} | K: {item.k}
                </ThemedText>

            </ThemedView>
        </ThemedView>
    )

    return (
        <ScreenWrapper bg="#fff">
            <Header name="View Collection" />
            <FlatList
                data={collectionData}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 10 }}
            />
        </ScreenWrapper>
    )
}

export default ViewCollection

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        flexDirection: 'row',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(2),
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    info: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 4,
    },
    details: {
        fontSize: 12,
    },
    viewInMap: {
        fontSize: 12,
        color: '#007AFF'
    },
})
