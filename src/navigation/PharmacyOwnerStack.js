import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OwnerDashboard from '../screens/pharmacyOwner/OwnerDashboard';
import ManageMedicinesScreen from '../screens/pharmacyOwner/ManageMedicinesScreen';
import AddMedicineScreen from '../screens/pharmacyOwner/AddMedicineScreen';
import PharmacyProfileScreen from '../screens/pharmacyOwner/PharmacyProfileScreen';
import PharmacyOrdersScreen from '../screens/pharmacyOwner/PharmacyOrdersScreen';
import NotificationsScreen from '../screens/pharmacyOwner/NotificationsScreen';

const Stack = createNativeStackNavigator();

const PharmacyOwnerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerHome" component={OwnerDashboard} />
      <Stack.Screen name="ManageMedicines" component={ManageMedicinesScreen} />
      <Stack.Screen name="AddMedicine" component={AddMedicineScreen} />
      <Stack.Screen name="PharmacyProfile" component={PharmacyProfileScreen} />
      <Stack.Screen name="PharmacyOrders" component={PharmacyOrdersScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

export default PharmacyOwnerStack;
