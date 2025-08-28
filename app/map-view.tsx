import ScreenWrapper from '@/components/ScreenWrapper'
import { GoogleMaps } from 'expo-maps'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
const MapView = () => {
    const { latitude, longitude, area } = useLocalSearchParams()
    return (
        <ScreenWrapper bg="#fff">
            {/* <Header name="Map View" /> */}
            <GoogleMaps.View style={{ flex: 1 }}
                cameraPosition={{
                    zoom: 15,
                    coordinates: {
                        latitude: Number(latitude),
                        longitude: Number(longitude),
                    }
                }}
                markers={[
                    {
                        coordinates: {
                            latitude: Number(latitude),
                            longitude: Number(longitude),
                        },
                        title: 'Location',
                        snippet: area as string,
                    },
                ]}
            />;
        </ScreenWrapper>
    )
}

export default MapView