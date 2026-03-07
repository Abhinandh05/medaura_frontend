import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../redux/slices/authSlice';
import { useTheme } from '../../theme/ThemeContext';
import Input from '../../components/Input';
import PrimaryButton from '../../components/PrimaryButton';

const EditProfileScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleUpdate = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const resultAction = await dispatch(updateProfile({ name, phone }));
      if (updateProfile.fulfilled.match(resultAction)) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', resultAction.payload || 'Failed to update profile');
      }
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.textPrimary }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
              <Text style={{ fontSize: 40 }}>🧑</Text>
            </View>
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Text style={[styles.changePhotoText, { color: colors.accent }]}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Your Name"
              value={name}
              onChangeText={setName}
              icon="👤"
            />
            <Input
              label="Phone Number"
              placeholder="Your Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon="📞"
            />
            
            <View style={styles.spacer} />

            <PrimaryButton
              title="Save Changes"
              onPress={handleUpdate}
              loading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  changePhotoBtn: {},
  changePhotoText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  form: {
    gap: 16,
  },
  spacer: {
    height: 20,
  },
});

export default EditProfileScreen;
