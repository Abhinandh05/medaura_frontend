import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import ManagePharmaciesScreen from '../screens/admin/ManagePharmaciesScreen';
import AddPharmacyScreen from '../screens/admin/AddPharmacyScreen';
import MapPickerScreen from '../screens/admin/MapPickerScreen';
import SystemAnalyticsScreen from '../screens/admin/SystemAnalyticsScreen';

const Stack = createNativeStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminDashboard} />
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
      <Stack.Screen name="ManagePharmacies" component={ManagePharmaciesScreen} />
      <Stack.Screen name="AddPharmacy" component={AddPharmacyScreen} />
      <Stack.Screen name="MapPicker" component={MapPickerScreen} />
      <Stack.Screen name="SystemAnalytics" component={SystemAnalyticsScreen} />
    </Stack.Navigator>
  );
};

export default AdminStack;
