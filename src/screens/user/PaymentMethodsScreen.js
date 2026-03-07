import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

const PaymentMethodsScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const methods = [
    { id: '1', type: 'Visa', last4: '4242', expiry: '12/26', icon: '💳' },
    { id: '2', type: 'Mastercard', last4: '8888', expiry: '08/25', icon: '💳' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Payment Methods</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={{ color: colors.accent, fontSize: 24 }}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Saved Cards</Text>
        {methods.map(card => (
          <View key={card.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.accentPaleBg }]}>
              <Text style={{ fontSize: 20 }}>{card.icon}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { color: colors.textPrimary }]}>{card.type} •••• {card.last4}</Text>
              <Text style={[styles.cardExpiry, { color: colors.textSecondary }]}>Expires {card.expiry}</Text>
            </View>
            <TouchableOpacity>
              <Text style={{ color: colors.danger, fontSize: 12 }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={[styles.addNew, { borderColor: colors.accent, backgroundColor: colors.accentPaleBg }]}>
          <Text style={[styles.addNewText, { color: colors.accent }]}>+ Add New Payment Method</Text>
        </TouchableOpacity>
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
  addBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24 },
  sectionTitle: { fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold' },
  cardExpiry: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 2 },
  addNew: { marginTop: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center' },
  addNewText: { fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold' },
});

export default PaymentMethodsScreen;
