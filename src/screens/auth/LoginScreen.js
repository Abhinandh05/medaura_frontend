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

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError('');
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    dispatch(signInStart());
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...user } = response.data.data;
      
      // Save token to storage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      // Dispatch success (root navigator will handle redirect based on role)
      dispatch(signInSuccess({
        token,
        user,
        role: user.role,
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to MEDAURA</Text>
          </View>

          <View style={styles.formContainer}>
            {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <PrimaryButton 
              title="Login" 
              onPress={handleLogin} 
              loading={isLoading} 
              style={styles.loginButton} 
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>{"Don't have an account? "}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>Register Now</Text>
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
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
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
  loginButton: {
    marginTop: spacing.m,
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
  registerText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
