import { theme } from '@/constants/theme'
import { addAreaImage, addBasicInformation, addLocationInformation } from '@/features/collectiondata/collectionDataSclice'
import { wp } from '@/helpers/common'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import InputField from './InputField'
import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

const InputContainer: React.FC = () => {
    // 🔹 Form states
    const [stateName, setStateName] = useState('')
    const [districtName, setDistrictName] = useState('')
    const [villageName, setVillageName] = useState('')
    const [cropName, setCropName] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [farmerName, setFarmerName] = useState('')
    const [image, setImage] = useState<string | null>(null)
    const [location, setLocation] = useState<Location.LocationObject | null>(null)
    const dispatch = useDispatch()
    const router = useRouter()
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("Permission to access location denied");
                return;
            }

            // Live updates when location changes
            const subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 5, // update when user moves 10 meters
                },
                (loc) => {
                    setLatitude(loc.coords.latitude.toString());
                    setLongitude(loc.coords.longitude.toString());
                }
            );

            return () => {
                subscription.remove(); // cleanup on unmount
            };
        })();
    }, []);

    // 🔹 Pick Image
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please allow access to photo library.')
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.7,
            allowsEditing: true,
            aspect: [4, 3],
        })

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri)
        }
    }

    // 🔹 Submit
    const handleSubmit = () => {
        dispatch(addBasicInformation({
            cropName,
            stateName,
            districtName,
            villageName,
            farmerName,
        }))
        dispatch(addLocationInformation({
            latitude,
            longitude,
        }))
        dispatch(addAreaImage({
            areaImage: image!,
        }))
        router.push('/data-collection')
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: wp(20), gap: wp(4) }}
            >
                {/* General Info */}
                <View style={styles.card}>
                    <ThemedText type="title" style={styles.sectionTitle}>
                        Farm Details
                    </ThemedText>
                    <InputField placeholder="Enter Farmer Name" onChange={setFarmerName} value={farmerName} />
                    <InputField placeholder="Enter State Name" onChange={setStateName} value={stateName} />
                    <InputField placeholder="Enter District Name" onChange={setDistrictName} value={districtName} />
                    <InputField placeholder="Enter Village Name" onChange={setVillageName} value={villageName} />
                    <InputField placeholder="Enter Crop Name" onChange={setCropName} value={cropName} />
                </View>

                {/* Location Info */}
                <View style={styles.card}>
                    <ThemedText type="title" style={styles.sectionTitle}>
                        Location Information
                    </ThemedText>
                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <InputField placeholder="Enter Latitude" onChange={setLatitude} value={latitude} />
                        </View>
                        <View style={styles.halfInput}>
                            <InputField placeholder="Enter Longitude" onChange={setLongitude} value={longitude} />
                        </View>
                    </View>
                </View>

                {/* Upload Image */}
                <View style={styles.card}>
                    <ThemedText type="title" style={styles.sectionTitle}>
                        Upload Area Image
                    </ThemedText>
                    <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.previewImage} />
                        ) : (
                            <>
                                <Ionicons name="image-outline" size={40} color={theme.colors.primary} />
                                <ThemedText type="defaultSemiBold" style={styles.uploadText}>
                                    Choose Image
                                </ThemedText>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Continue Button */}
                <TouchableOpacity style={styles.continueBtn} onPress={handleSubmit}>
                    <ThemedText style={styles.continueText}>Continue</ThemedText>
                    <Ionicons name="chevron-forward" size={22} color="white" />
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    )
}

export default InputContainer

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: wp(4),
        padding: wp(1),
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    sectionTitle: {
        fontSize: wp(4),
        fontWeight: '600',
        marginBottom: wp(2),
        color: theme.colors.text,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp(3),
    },
    halfInput: {
        flex: 1,
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        borderRadius: wp(3),
        height: wp(35),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    uploadText: {
        marginTop: wp(2),
        color: theme.colors.primary,
        fontSize: wp(3.5),
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: wp(3),
        resizeMode: 'cover',
    },
    continueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: wp(4),
        borderRadius: wp(5),
        marginTop: wp(4),
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    continueText: {
        fontSize: wp(4),
        fontWeight: 'bold',
        color: 'white',
        marginRight: wp(2)
    },
})
