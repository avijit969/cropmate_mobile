import Button from '@/components/Button'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { theme } from '@/constants/theme'
import { hp, wp } from '@/helpers/common'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'

const welcome = () => {
    const router = useRouter()

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1 }}>
                <ThemedView style={styles.header}>
                    <ThemedText type='title' lightColor={theme.colors.primary}>Wlcome to CropMate</ThemedText>
                    <ThemedText type='defaultSemiBold'>
                        Your Compainon For Choosing The Right Crop
                    </ThemedText>
                </ThemedView>
                <ThemedView style={{ justifyContent: 'center', alignItems: 'center', gap: hp(5), marginTop: hp(5) }}>
                    <Image source={require('@/assets/images/welcome.png')} style={{ width: 350, height: 350, resizeMode: 'contain', borderRadius: 20 }}
                        contentFit="contain"
                        transition={1000} />
                    <Button
                        title='Get Started'
                        backgroundColor={theme.colors.primary}
                        onPress={() => {
                            router.push('/signup')
                        }}
                        style={{ width: wp(80) }}
                    />
                </ThemedView>
            </ThemedView>
        </ScreenWrapper>
    )
}

export default welcome

const styles = StyleSheet.create({
    header: {
        paddingTop: hp(8),
        paddingHorizontal: wp(5),
        gap: hp(1)
    }
})