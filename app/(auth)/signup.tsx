import Button from '@/components/Button';
import InputField from '@/components/InputField';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { hp, wp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ToastAndroid, useColorScheme } from 'react-native';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const theme = useColorScheme()

    const signInWithEmail = async () => {
        if (!email || !password) {
            ToastAndroid.show('Please fill in all fields', ToastAndroid.SHORT);
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email, password, options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        } else {
            ToastAndroid.show('Signup Successful', ToastAndroid.SHORT);
            router.replace("/login")
        }

        setLoading(false);
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <ThemedView style={styles.container}>
                        <ThemedView>
                            <ThemedText style={styles.loginText}>Signup to CropMate</ThemedText>
                            <Image
                                source={require('@/assets/images/auth.svg')}
                                style={{
                                    width: 340,
                                    height: 280,
                                    borderRadius: 20,
                                    alignSelf: 'center',
                                }}
                                contentFit="contain"
                                transition={1000}
                            />
                            <InputField
                                placeholder="Email"
                                onChange={setEmail}
                                value={email}
                                icon={
                                    <Ionicons
                                        name="mail-outline"
                                        size={24}
                                        color={theme == 'dark' ? '#fff' : '#000'}
                                    />
                                }
                            />
                            <InputField
                                placeholder="Full Name"
                                onChange={setFullName}
                                value={fullName}
                                icon={
                                    <Ionicons
                                        name="person-circle"
                                        size={24}
                                        color={theme == 'dark' ? '#fff' : '#000'}
                                    />
                                }
                            />
                            <InputField
                                placeholder="Password"
                                onChange={setPassword}
                                value={password}
                                secureTextEntry
                                icon={
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={24}
                                        color={theme == 'dark' ? '#fff' : '#000'}
                                    />
                                }
                            />
                        </ThemedView>

                        <Button
                            title={loading ? 'Logging in...' : 'Signup'}
                            onPress={signInWithEmail}
                            style={{ width: '100%' }}
                        />
                        <ThemedText
                            style={{ textAlign: 'center' }}
                            lightColor="#000"
                            darkColor="#fff"
                        >
                            Already have an account?{' '}
                            <ThemedText
                                onPress={() => router.push('/login')}
                                style={{ fontWeight: 'bold' }}
                                lightColor="#000"
                                darkColor="#fff"
                            >
                                Login
                            </ThemedText>
                        </ThemedText>
                    </ThemedView>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>

    );
};

export default Signup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: hp(1),
        paddingHorizontal: wp(5),
        justifyContent: 'center',
    },
    loginText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
