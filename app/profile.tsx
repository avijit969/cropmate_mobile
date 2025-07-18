import ActionModal from '@/components/ActionModal'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { updateUser } from '@/features/user/userSclice'
import { wp } from '@/helpers/common'
import { useColorScheme } from '@/hooks/useColorScheme.web'
import { supabase } from '@/lib/supabase'
import { RootState } from '@/store/store'
import { User } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
    TextInput,
    ToastAndroid,
    View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'


const Profile = () => {
    const user = useSelector((state: RootState) => state.user.user)
    const [userInput, setUserInput] = useState<User>(user)
    const [updating, setUpdating] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isShwownLogoutModal, setIsShownLogoutModal] = useState(false)
    const Theme = useColorScheme()
    const dispatch = useDispatch()
    const router = useRouter()

    const updateProfile = async () => {
        setUpdating(true)
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    full_name: userInput.full_name,
                    username: userInput.username,
                    avatar: userInput.avatar,
                    email: userInput.email,
                })
                .eq('id', userInput.id)
                .select()

            if (error) throw error
            ToastAndroid.show('Profile updated', ToastAndroid.SHORT)
            dispatch(updateUser(data[0]))
        } catch (error: any) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT)
        } finally {
            setUpdating(false)
        }
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
            allowsEditing: true,
            aspect: [1, 1],
            base64: true,
        })

        if (!result.canceled && result.assets?.[0]) {
            const img = result.assets[0]
            const extension = img.uri.split('.').pop() || 'jpg'
            const filePath = `avatar/${Date.now()}.${extension}`
            const contentType = `image/${extension}`

            try {
                setUploading(true)

                const base64 = await FileSystem.readAsStringAsync(img.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                })

                const { data, error: uploadError } = await supabase.storage
                    .from('users')
                    .upload(filePath, decode(base64), {
                        contentType,
                        upsert: true,
                    })

                if (uploadError) throw uploadError

                const { publicUrl } = supabase.storage
                    .from('users')
                    .getPublicUrl(data.path).data

                if (!publicUrl) throw new Error('Unable to get public URL')

                const updatedUser = { ...userInput, avatar: publicUrl }
                setUserInput(updatedUser)
                dispatch(updateUser(updatedUser))

                // Save avatar in database
                await supabase.from('users')
                    .update({ avatar: publicUrl })
                    .eq('id', userInput.id)

                ToastAndroid.show('Avatar updated!', ToastAndroid.SHORT)
            } catch (err: any) {
                Alert.alert('Upload Error', err.message || 'Unexpected error')
            } finally {
                setUploading(false)
            }
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.dismissAll()
        ToastAndroid.show('Logout successful', ToastAndroid.SHORT)
    }

    return (
        <ScreenWrapper>
            <ThemedView style={styles.container}>
                <Header name="Profile" right={<Ionicons name="log-out-outline" size={24} color={Theme === 'light' ? '#000' : '#fff'} onPress={() => setIsShownLogoutModal(true)} />} />
                <Pressable onPress={pickImage}>
                    <View style={styles.avatarBox}>
                        {uploading ? (
                            <ActivityIndicator size="large" />
                        ) : userInput.avatar ? (
                            <Image source={{ uri: userInput.avatar }} style={styles.avatar} />
                        ) : (
                            <ThemedText>No Avatar</ThemedText>
                        )}
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera-outline" size={20} color={Theme === 'light' ? '#000' : '#fff'} />
                        </View>
                    </View>
                </Pressable>


                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                    value={userInput.email}
                    editable
                    style={[styles.input, { color: Theme === 'light' ? '#000' : '#fff' }]}
                    onChangeText={(text) =>
                        setUserInput((prev) => ({ ...prev, email: text }))
                    }
                />

                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                    value={userInput.full_name}
                    onChangeText={(text) =>
                        setUserInput((prev) => ({ ...prev, full_name: text }))
                    }
                    style={[styles.input, { color: Theme === 'light' ? '#000' : '#fff' }]}
                />
                <Button
                    title={updating ? 'Updating...' : 'Update Profile'}
                    onPress={updateProfile}
                    style={{ marginTop: 10 }}
                />

            </ThemedView>
            <ActionModal visible={isShwownLogoutModal} title="Logout" message="Are you sure you want to logout?" onConfirm={handleLogout} onCancel={() => setIsShownLogoutModal(false)} />
            <StatusBar style="dark" />
        </ScreenWrapper >
    )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(2),
    },
    avatarBox: {
        alignSelf: 'center',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
        backgroundColor: '#f1f1f1',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: wp(1),
        alignItems: 'center',
        width: wp(30),
    },

    label: {
        marginTop: 10,
        fontWeight: 'bold',
    },
    input: {
        color: 'white',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginTop: 5,
    },
})
