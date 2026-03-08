import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Input from '../../components/Input';
import { createPharmacyAdmin } from '../../redux/slices/adminSlice';

const AddPharmacyScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.admin);

  const [form, setForm] = useState({
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    pharmacyName: '',
    address: '',
    pharmacyPhone: '',
    latitude: '',
    longitude: '',
  });

  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState(null);

  // Receive coordinates from MapPickerScreen
  useEffect(() => {
    if (route.params?.pickedLatitude && route.params?.pickedLongitude) {
      setForm((prev) => ({
        ...prev,
        latitude: route.params.pickedLatitude,
        longitude: route.params.pickedLongitude,
      }));
      setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
      setResolvedLocation(
        route.params.pickedLocationName ||
        `${route.params.pickedLatitude}, ${route.params.pickedLongitude}`
      );
    }
  }, [route.params?.pickedLatitude, route.params?.pickedLongitude]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Reverse geocode coordinates to get a readable name
  const reverseGeocode = async (lat, lng) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (results.length > 0) {
        const r = results[0];
        const parts = [r.name, r.street, r.city, r.region].filter(Boolean);
        return parts.join(', ');
      }
    } catch (e) {
      console.log('Reverse geocode failed:', e);
    }
    return null;
  };

  // Use device GPS to get current location
  const handleUseMyLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permission in settings.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;

      setForm((prev) => ({
        ...prev,
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
      }));
      setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));

      const name = await reverseGeocode(latitude, longitude);
      setResolvedLocation(name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Convert the typed address into coordinates
  const handleGetFromAddress = async () => {
    const addr = form.address.trim();
    if (!addr) {
      Alert.alert('No Address', 'Please type the pharmacy address first, then tap this button.');
      return;
    }

    setLocationLoading(true);
    try {
      const results = await Location.geocodeAsync(addr);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setForm((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));

        const name = await reverseGeocode(latitude, longitude);
        setResolvedLocation(name || addr);
      } else {
        Alert.alert(
          'Not Found',
          'Could not find coordinates for this address. Try a more specific address like "MG Road, Bangalore".'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Geocoding failed. Please check the address and try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.password.trim()) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
    if (!form.pharmacyName.trim()) newErrors.pharmacyName = 'Pharmacy name is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.latitude.trim()) newErrors.latitude = 'Location is required — use a button below';
    if (!form.longitude.trim()) newErrors.longitude = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const result = await dispatch(createPharmacyAdmin(form)).unwrap();
      Alert.alert(
        'Success',
        `Pharmacy "${result.pharmacyName}" created successfully!\n\nOwner can login with:\nEmail: ${form.email}\nPassword: (as set)`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err || 'Failed to create pharmacy');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Pharmacy</Text>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Owner Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Owner Account</Text>
            </View>
            <Text style={styles.sectionHint}>
              A new pharmacy owner account will be created with these credentials.
            </Text>

            <Input
              label="Owner Name"
              placeholder="e.g. John Doe"
              value={form.ownerName}
              onChangeText={(v) => updateField('ownerName', v)}
              error={errors.ownerName}
            />
            <Input
              label="Email"
              placeholder="e.g. john@pharmacy.com"
              value={form.email}
              onChangeText={(v) => updateField('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <Input
              label="Password"
              placeholder="Min 6 characters"
              value={form.password}
              onChangeText={(v) => updateField('password', v)}
              secureTextEntry
              error={errors.password}
            />
            <Input
              label="Phone (optional)"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChangeText={(v) => updateField('phone', v)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Pharmacy Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Pharmacy Details</Text>
            </View>

            <Input
              label="Pharmacy Name"
              placeholder="e.g. City Central Pharmacy"
              value={form.pharmacyName}
              onChangeText={(v) => updateField('pharmacyName', v)}
              error={errors.pharmacyName}
            />
            <Input
              label="Address"
              placeholder="e.g. 123 Main St, Bangalore"
              value={form.address}
              onChangeText={(v) => updateField('address', v)}
              error={errors.address}
            />
            <Input
              label="Pharmacy Phone (optional)"
              placeholder="e.g. 080-12345678"
              value={form.pharmacyPhone}
              onChangeText={(v) => updateField('pharmacyPhone', v)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Text style={styles.sectionHint}>
              Pick the pharmacy location using one of the options below.
            </Text>

            {/* Pick on Map — full width */}
            <TouchableOpacity
              style={styles.mapPickerBtn}
              onPress={() =>
                navigation.navigate('MapPicker', {
                  latitude: form.latitude || null,
                  longitude: form.longitude || null,
                })
              }
              activeOpacity={0.7}
            >
              <Ionicons name="map" size={20} color={colors.white} />
              <Text style={styles.mapPickerBtnText}>Pick on Map</Text>
            </TouchableOpacity>

            {/* Other location buttons */}
            <View style={styles.locationBtnsRow}>
              <TouchableOpacity
                style={styles.locationBtn}
                onPress={handleUseMyLocation}
                disabled={locationLoading}
                activeOpacity={0.7}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="navigate" size={16} color={colors.primary} />
                )}
                <Text style={styles.locationBtnText}>My Location</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.locationBtn}
                onPress={handleGetFromAddress}
                disabled={locationLoading}
                activeOpacity={0.7}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="search" size={16} color={colors.primary} />
                )}
                <Text style={styles.locationBtnText}>From Address</Text>
              </TouchableOpacity>
            </View>

            {/* Resolved Location Preview */}
            {resolvedLocation && (
              <View style={styles.locationPreview}>
                <Ionicons name="checkmark-circle" size={16} color="#31C48D" />
                <Text style={styles.locationPreviewText} numberOfLines={2}>
                  {resolvedLocation}
                </Text>
              </View>
            )}

            {/* Coordinates Display (read-only feel but still editable as fallback) */}
            {(form.latitude || form.longitude) ? (
              <View style={styles.coordsCard}>
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Lat</Text>
                  <Text style={styles.coordValue}>{form.latitude}</Text>
                </View>
                <View style={styles.coordDivider} />
                <View style={styles.coordItem}>
                  <Text style={styles.coordLabel}>Lng</Text>
                  <Text style={styles.coordValue}>{form.longitude}</Text>
                </View>
                <TouchableOpacity
                  style={styles.coordClear}
                  onPress={() => {
                    setForm((prev) => ({ ...prev, latitude: '', longitude: '' }));
                    setResolvedLocation(null);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textLight} />
                </TouchableOpacity>
              </View>
            ) : (
              errors.latitude && (
                <Text style={styles.locationError}>{errors.latitude}</Text>
              )
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={20} color={colors.white} />
            <Text style={styles.submitBtnText}>
              {isLoading ? 'Creating...' : 'Create Pharmacy'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.m,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  halfInput: {
    flex: 1,
  },
  mapPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    paddingVertical: 14,
    borderRadius: spacing.s,
    backgroundColor: colors.primary,
    marginBottom: spacing.s,
  },
  mapPickerBtnText: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.white,
  },
  locationBtnsRow: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  locationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 12,
    borderRadius: spacing.s,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#F0FDF9',
  },
  locationBtnText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.primary,
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#DEF7EC',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.s,
    marginBottom: spacing.m,
  },
  locationPreviewText: {
    ...typography.caption,
    color: '#03543F',
    flex: 1,
  },
  coordsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  coordItem: {
    flex: 1,
    alignItems: 'center',
  },
  coordLabel: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  coordValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: 'bold',
  },
  coordDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  coordClear: {
    padding: spacing.xs,
    marginLeft: spacing.s,
  },
  locationError: {
    ...typography.caption,
    color: colors.red,
    marginTop: spacing.xs,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginTop: spacing.s,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default AddPharmacyScreen;
