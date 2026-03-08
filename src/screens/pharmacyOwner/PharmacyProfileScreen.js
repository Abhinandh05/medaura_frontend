import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../redux/slices/authSlice';
import { fetchMyPharmacy, updateMyPharmacy } from '../../redux/slices/pharmacySlice';
import * as Location from 'expo-location';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Input from '../../components/Input';
import PrimaryButton from '../../components/PrimaryButton';

const PharmacyProfileScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { myPharmacy } = useSelector((state) => state.pharmacy);
  const dispatch = useDispatch();
  
  const [name, setName] = useState(user?.name || '');
  const [pharmacyName, setPharmacyName] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Fetch pharmacy details on mount
  React.useEffect(() => {
    dispatch(fetchMyPharmacy());
  }, [dispatch]);

  // Sync state if user or pharmacy updates
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
    if (myPharmacy) {
      setPharmacyName(myPharmacy.pharmacyName || '');
      setAddress(myPharmacy.address || '');
      if (myPharmacy.location && myPharmacy.location.coordinates) {
        setCoordinates({
          latitude: myPharmacy.location.coordinates[1],
          longitude: myPharmacy.location.coordinates[0],
        });
      }
    }
  }, [user, myPharmacy]);

  const handleSetLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to set your pharmacy coordinates.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      Alert.alert('Success', 'Location coordinates captured! Please update profile to save.');
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Error', 'Failed to get current location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim() || !pharmacyName.trim() || !address.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // 1. Update User Profile (Owner Name & Phone)
      const userRes = await dispatch(updateProfile({ name, phone }));
      
      // 2. Update Pharmacy Profile if it exists
      let pharmRes = { meta: { requestStatus: 'fulfilled' } };
      if (myPharmacy?._id) {
        const pharmacyData = { 
          pharmacyName, 
          address, 
          phone 
        };
        
        if (coordinates) {
          pharmacyData.latitude = coordinates.latitude;
          pharmacyData.longitude = coordinates.longitude;
        }

        pharmRes = await dispatch(updateMyPharmacy({
          id: myPharmacy._id,
          pharmacyData
        }));
      }

      const userSuccess = updateProfile.fulfilled.match(userRes);
      const pharmSuccess = updateMyPharmacy.fulfilled.match(pharmRes);

      if (userSuccess && pharmSuccess) {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        const errorMsg = userRes.payload || (pharmRes.payload ? pharmRes.payload : 'Failed to update profile');
        Alert.alert('Error', errorMsg);
      }
    } catch (_err) {
      Alert.alert('Error', 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacy Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
             <Ionicons name="business" size={50} color={colors.primary} />
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input
            label="Owner Name"
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
            icon="person-outline"
          />
          <Input
            label="Pharmacy Name"
            placeholder="Pharmacy Name"
            value={pharmacyName}
            onChangeText={setPharmacyName}
            icon="business-outline"
          />
          <Input
            label="Address"
            placeholder="Pharmacy Full Address"
            value={address}
            onChangeText={setAddress}
            multiline
            icon="location-outline"
          />
          <Input
            label="Contact Phone"
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            icon="call-outline"
          />

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textLight} />
            <Text style={styles.infoText}>
              Updates to your pharmacy profile will be reflected on the user search results nearby.
            </Text>
          </View>

          <View style={[styles.locationContainer, { borderColor: colors.border }]}>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color={coordinates ? colors.accent : colors.textMuted} />
              <View style={styles.coordinatesWrapper}>
                <Text style={styles.locationLabel}>Map Coordinates</Text>
                {coordinates ? (
                  <Text style={styles.coordinatesText}>
                    {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                  </Text>
                ) : (
                  <Text style={[styles.coordinatesText, { color: colors.textMuted }]}>
                    Not set
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.setLocationBtn, { backgroundColor: colors.accentPaleBg }]}
              onPress={handleSetLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Text style={[styles.setLocationBtnText, { color: colors.accent }]}>
                  Set GPS
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <PrimaryButton 
            title="Update Profile" 
            onPress={handleUpdate} 
            loading={loading}
            style={styles.btn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.m,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.m,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: spacing.l,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  changePhotoBtn: {
    marginTop: spacing.s,
  },
  changePhotoText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: 'bold',
  },
  form: {
    marginTop: spacing.m,
  },
  infoBox: {
    flexDirection: 'row',
    padding: spacing.m,
    backgroundColor: '#F7FAFC',
    borderRadius: spacing.s,
    marginTop: spacing.s,
    marginBottom: spacing.l,
  },
  infoText: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: spacing.s,
    flex: 1,
  },
  btn: {
    marginTop: spacing.m,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    backgroundColor: '#F8FAFC',
    borderRadius: spacing.s,
    borderWidth: 1,
    marginBottom: spacing.m,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coordinatesWrapper: {
    marginLeft: spacing.s,
  },
  locationLabel: {
    ...typography.caption,
    color: colors.textLight,
  },
  coordinatesText: {
    ...typography.bodySmall,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: colors.text,
  },
  setLocationBtn: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
  },
  setLocationBtnText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
});

export default PharmacyProfileScreen;
