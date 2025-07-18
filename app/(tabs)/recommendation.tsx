import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

import React from 'react'
import { StyleSheet } from 'react-native'

const Recommendation = () => {
    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1 }}>
                <Header name="Recommendation" />
                <ThemedText>
                    As per the latest data and analysis, we recommend the following actions to optimize your crop yield and health:
                </ThemedText>
                <ThemedText>
                    1. Fertilization: Based on the nutrient levels, consider applying a balanced fertilizer with a ratio of N-P-K (Nitrogen-Phosphorus-Potassium) of 10-10-10 to enhance soil fertility.
                </ThemedText>
                <ThemedText>
                    2. Irrigation: Ensure consistent moisture levels by irrigating the crops every 3-4 days, especially during dry spells.
                </ThemedText>
                <ThemedText>
                    3. Pest Management: Monitor for pests regularly and apply organic pesticides if necessary, focusing on integrated pest management practices.
                </ThemedText>
                <ThemedText>
                    4. Crop Rotation: Consider rotating with legumes next season to improve soil nitrogen levels and break pest cycles.
                </ThemedText>
                <ThemedText>
                    5. Soil Testing: Conduct a soil test every 6 months to monitor nutrient levels and adjust fertilization practices accordingly.
                </ThemedText>
                <ThemedText>
                    6. Weather Monitoring: Keep an eye on weather forecasts to prepare for any extreme conditions that may affect crop health.
                </ThemedText>
            </ThemedView>
        </ScreenWrapper>
    )
}

export default Recommendation

const styles = StyleSheet.create({})