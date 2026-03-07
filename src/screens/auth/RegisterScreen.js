import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Input from '../../components/Input';
import PrimaryButton from '../../components/PrimaryButton';
import { signInStart, signInSuccess, signInFailure } from '../../redux/slices/authSlice';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    setLocalError('');
    if (!name || !email || !phone || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    dispatch(signInStart());
    try {
      // Assuming backend has a /auth/register endpoint
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        phone, 
        password,
        role 
      });
      
      const { token, ...user } = response.data.data;
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      dispatch(signInSuccess({
        token,
        user,
        role: user.role,
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setLocalError(errorMessage);
      dispatch(signInFailure(errorMessage));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/images/icon.png')} 
                style={styles.logoImage} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MEDAURA today</Text>
          </View>

          <View style={styles.formContainer}>
            {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Register As</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'user' && styles.roleButtonActive]} 
                  onPress={() => setRole('user')}
                >
                  <Text style={[styles.roleButtonText, role === 'user' && styles.roleButtonTextActive]}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'pharmacy_owner' && styles.roleButtonActive]} 
                  onPress={() => setRole('pharmacy_owner')}
                >
                  <Text style={[styles.roleButtonText, role === 'pharmacy_owner' && styles.roleButtonTextActive]}>Pharmacy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]} 
                  onPress={() => setRole('admin')}
                >
                  <Text style={[styles.roleButtonText, role === 'admin' && styles.roleButtonTextActive]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            <PrimaryButton 
              title="Register" 
              onPress={handleRegister} 
              loading={isLoading} 
              style={styles.registerButton} 
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
    overflow: 'hidden',
  },
  logoImage: {
    width: '70%',
    height: '70%',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textLight,
  },
  formContainer: {
    width: '100%',
  },
  roleContainer: {
    marginBottom: spacing.m,
  },
  roleLabel: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  roleButton: {
    flex: 1,
    paddingVertical: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    ...typography.caption,
    color: colors.text,
  },
  roleButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: spacing.xl,
  },
  errorText: {
    color: colors.red,
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textLight,
  },
  loginText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
