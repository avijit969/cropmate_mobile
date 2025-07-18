import { theme } from '@/constants/theme'
import { wp } from '@/helpers/common'
import { useColorScheme } from '@/hooks/useColorScheme.web'
import { RootState } from '@/store/store'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

const HomeHeader = () => {
    const router = useRouter()
    const user = useSelector((state: RootState) => state.user.user)
    const themeColor = useColorScheme()
    return (
        <ThemedView style={styles.header}>
            <View>
                <ThemedText type="subtitle">Hey {user.full_name} 👋</ThemedText>
                <ThemedText>Welcome to CropMate</ThemedText>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')}>
                {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                    <Ionicons name="person-circle" size={40} color={themeColor === 'dark' ? '#fff' : '#000'} />
                )}
            </TouchableOpacity>
        </ThemedView>
    )
}

export default HomeHeader

const styles = StyleSheet.create({
    header: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: wp(2),
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
})