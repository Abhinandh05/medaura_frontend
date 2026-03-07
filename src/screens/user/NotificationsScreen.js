import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../redux/slices/authSlice';
import { useTheme } from '../../theme/ThemeContext';

const NotificationsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const settings = user?.notificationSettings || {
    orderUpdates: true,
    promotions: false,
    deliveryStatus: true,
    newPharmacies: true,
  };

  const toggleSwitch = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    dispatch(updateProfile({ notificationSettings: newSettings }));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { key: 'orderUpdates', label: 'Order Updates', sub: 'Receive updates on your current orders' },
            { key: 'promotions', label: 'Promotions', sub: 'Get notified about discounts and offers' },
            { key: 'deliveryStatus', label: 'Delivery Status', sub: 'Live updates on your medicine delivery' },
            { key: 'newPharmacies', label: 'New Pharmacies', sub: 'Know when new pharmacies open near you' },
          ].map((item, i, arr) => (
            <View key={item.key} style={[styles.row, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={styles.textCol}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.sub, { color: colors.textSecondary }]}>{item.sub}</Text>
              </View>
              <Switch
                value={settings[item.key]}
                onValueChange={() => toggleSwitch(item.key)}
                trackColor={{ false: '#D1D5DB', true: colors.accent + '80' }}
                thumbColor={settings[item.key] ? colors.accent : '#F4F3F4'}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold' },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 24 },
  section: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 20, justifyContent: 'space-between' },
  textCol: { flex: 1, marginRight: 16 },
  label: { fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold', marginBottom: 4 },
  sub: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium' },
});

export default NotificationsScreen;
