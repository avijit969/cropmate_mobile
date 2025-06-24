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
import { KeyboardAvoidingView, Platform, StyleSheet, ToastAndroid, useColorScheme } from 'react-native';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const theme = useColorScheme()
    const signInWithEmail = async () => {
        if (!email || !password) {
            ToastAndroid.show('Please fill in all fields', ToastAndroid.SHORT);
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        } else {
            ToastAndroid.show('Login Successful', ToastAndroid.SHORT);
            router.replace("/home")
        }

        setLoading(false);
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ThemedView style={styles.container}>
                    <ThemedView>
                        <ThemedText style={styles.loginText}>Login To CropMate</ThemedText>
                        <Image source={require('@/assets/images/auth.svg')} style={{ width: 340, height: 300, alignSelf: 'center', borderRadius: 20 }}
                            contentFit="contain"
                            transition={1000}
                        />
                        <InputField
                            placeholder="Email"
                            onChange={setEmail}
                            value={email}
                            icon={<Ionicons name="mail-outline" size={24} color={theme == 'dark' ? '#fff' : '#000'} />}
                        />
                        <InputField
                            placeholder="Password"
                            onChange={setPassword}
                            value={password}
                            secureTextEntry
                            icon={<Ionicons name="lock-closed-outline" size={24} color={theme == 'dark' ? '#fff' : '#000'} />}
                        />
                    </ThemedView>

                    <Button
                        title={loading ? 'Logging in...' : 'Login'}
                        onPress={signInWithEmail}
                        style={{ width: '100%' }}
                    />
                    <ThemedText style={{ textAlign: 'center', marginTop: 10 }} lightColor="#000" darkColor="#fff">
                        Don't have an account?{' '}
                        <ThemedText
                            onPress={() => router.replace('/signup')}
                            style={{ fontWeight: 'bold' }}
                            lightColor="#000"
                            darkColor="#fff"
                        >
                            Sign Up
                        </ThemedText>
                    </ThemedText>
                </ThemedView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: hp(3),
        paddingHorizontal: wp(5),
        justifyContent: 'center',
    },
    loginText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
});
