import Button from '@/components/Button'
import Header from '@/components/Header'
import InputContainer from '@/components/InputContainer'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { wp } from '@/helpers/common'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'

const Collection = () => {
    const router = useRouter()
    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1 }}>
                <Header name="Collection" />
                <ThemedView style={{ flex: 1, paddingHorizontal: wp(1) }}>

                    <Button title="View Collection Data" onPress={() => router.push('/view-collection')} />
                    {/* ✅ Intro Message */}
                    <ThemedText style={styles.message}>
                        Please fill in the collection details below to record farmer and crop information.
                    </ThemedText>

                    <InputContainer />

                </ThemedView>
            </ThemedView>
        </ScreenWrapper>
    )
}

export default Collection

const styles = StyleSheet.create({
    message: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: wp(4),
        color: '#444',
    },
})
