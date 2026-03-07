import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthStack from './AuthStack';
import UserStack from './UserStack';
import PharmacyOwnerStack from './PharmacyOwnerStack';
import AdminStack from './AdminStack';
import Splash from '../screens/Splash';
import { restoreToken } from '../redux/slices/authSlice';

const RootNavigator = () => {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      let userData;

      try {
        userToken = await AsyncStorage.getItem('userToken');
        userData = await AsyncStorage.getItem('userData');
        
        if (userToken && userData) {
          const parsedUser = JSON.parse(userData);
          dispatch(restoreToken({
            token: userToken,
            user: parsedUser,
            role: parsedUser.role,
          }));
        } else {
          dispatch(restoreToken({ token: null, user: null, role: null }));
        }
      } catch (e) {
        console.error('Failed to restore token', e);
      } finally {
        // Set a small delay for splash screen visibility
        setTimeout(() => {
          setAppIsReady(true);
        }, 2000);
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  if (!appIsReady) {
    return <Splash />;
  }

  return (
    <NavigationContainer>
      {!token ? (
        <AuthStack />
      ) : (
        <>
          {role === 'user' && <UserStack />}
          {role === 'pharmacy_owner' && <PharmacyOwnerStack />}
          {role === 'admin' && <AdminStack />}
        </>
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
