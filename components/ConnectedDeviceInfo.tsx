import { ThemedText } from '@/components/ThemedText';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';

const ConnectedDeviceInfo = ({ name }: { name: string }) => {
    const [visible, setVisible] = useState(true);

    return (
        <View style={{ alignItems: 'center' }}>
            {visible && (
                <LottieView
                    source={require('@/assets/lottie/connected.json')}
                    style={{ width: 180, height: 180 }}
                    autoPlay
                    loop={false}
                    onAnimationFinish={() => setVisible(false)}
                />
            )}
            {visible && (
                <ThemedText type="subtitle">
                    {name} Connected successfully
                </ThemedText>
            )}
        </View>
    );
};

export default ConnectedDeviceInfo;
