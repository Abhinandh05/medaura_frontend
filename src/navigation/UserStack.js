import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

import HomeScreen from '../screens/user/HomeScreen';
import SearchScreen from '../screens/user/SearchScreen';
import MapScreen from '../screens/user/MapScreen';
import OrdersScreen from '../screens/user/OrdersScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import EditProfileScreen from '../screens/user/EditProfileScreen';
import NotificationsScreen from '../screens/user/NotificationsScreen';
import PaymentMethodsScreen from '../screens/user/PaymentMethodsScreen';
import SavedAddressesScreen from '../screens/user/SavedAddressesScreen';
import LanguageScreen from '../screens/user/LanguageScreen';
import HelpSupportScreen from '../screens/user/HelpSupportScreen';
import AboutScreen from '../screens/user/AboutScreen';
import PharmacyDetailsScreen from '../screens/user/PharmacyDetailsScreen';
import CartScreen from '../screens/user/CartScreen';
import MedicineSearchScreen from '../screens/user/MedicineSearchScreen';
import NearbyPharmaciesScreen from '../screens/user/NearbyPharmaciesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabs = [
  { name: 'Home', icon: '⌂', label: 'Home', component: HomeScreen },
  { name: 'Search', icon: '⊙', label: 'Search', component: SearchScreen },
  { name: 'Nearby', icon: '◎', label: 'Nearby', component: MapScreen },
  { name: 'Orders', icon: '▦', label: 'Orders', component: OrdersScreen },
  { name: 'Profile', icon: '⊛', label: 'Profile', component: ProfileScreen },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarOuter, {
      borderTopColor: colors.border,
      backgroundColor: colors.navBg,
      paddingBottom: Platform.OS === 'ios' ? Math.max(20, insets.bottom) : Math.max(8, insets.bottom + 4),
    }]}>
      {Platform.OS === 'ios' && (
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      )}
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = tabs[index];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {isFocused && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />
              )}
              <Text style={[
                styles.tabIcon,
                { color: isFocused ? colors.accent : colors.textMuted },
              ]}>
                {tab.icon}
              </Text>
              <Text style={[
                styles.tabLabel,
                {
                  color: isFocused ? colors.accent : colors.textMuted,
                  fontFamily: isFocused ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                },
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {tabs.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

const UserStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={TabNavigator} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="PharmacyDetails" component={PharmacyDetailsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="MedicineSearch" component={MedicineSearchScreen} />
      <Stack.Screen name="NearbyPharmacies" component={NearbyPharmaciesScreen} />
    </Stack.Navigator>
  );
};

export default UserStack;

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'relative',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 6,
  },
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -10,
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
