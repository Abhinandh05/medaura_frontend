import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserOrders } from '../../redux/slices/orderSlice';

const OrdersScreen = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { userOrders, isLoading } = useSelector(s => s.orders);
  const s = makeStyles(colors);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchUserOrders());
      const interval = setInterval(() => {
        dispatch(fetchUserOrders());
      }, 5000); // short-polling for real-time order UI updates
      return () => clearInterval(interval);
    }, [dispatch])
  );

  const activeOrders = userOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const pastOrders = userOrders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');

  const allSteps = ['Placed', 'Confirmed', 'Packed', 'On Way', 'Delivered'];

  const renderStep = (order, label, index) => {
    const currentStepIndex = allSteps.indexOf(order.status);
    const completed = index <= currentStepIndex;
    const active = index === currentStepIndex;
    const isLast = index === allSteps.length - 1;

    return (
      <View key={index} style={s.stepItem}>
        <View style={s.stepDotRow}>
          <View style={[
            s.stepDot,
            completed && s.stepDotCompleted,
            active && s.stepDotActive,
            !completed && !active && { borderColor: colors.border },
          ]}>
            {completed && !active && <Text style={s.stepCheck}>✓</Text>}
            {active && <View style={s.stepPulse} />}
          </View>
          {!isLast && (
            <View style={[s.stepLine, { backgroundColor: completed ? colors.accent : colors.border }]} />
          )}
        </View>
        <Text style={[
          s.stepLabel,
          {
            color: completed ? colors.accent : colors.textMuted,
            fontFamily: active ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
          },
        ]}>
          {label}
        </Text>
      </View>
    );
  };

  const statusColor = (status) => {
    if (status === 'Delivered') return colors.accent;
    if (status === 'Cancelled') return colors.danger;
    return colors.amber;
  };

  const statusBg = (status) => {
    if (status === 'Delivered') return colors.accentPaleBg;
    if (status === 'Cancelled') return colors.dangerPale;
    return colors.amberPale;
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={s.header}>
          <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Orders</Text>
        </View>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Active Orders</Text>
          </View>
        )}
        {activeOrders.map(order => (
          <View key={order._id} style={[s.activeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={s.activeCardTop}>
              <View style={[s.iconBox, { backgroundColor: colors.accentPaleBg, borderColor: colors.accentSoftBorder }]}>
                <Text style={{ fontSize: 20 }}>🏥</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.activeName, { color: colors.textPrimary }]}>{order.pharmacyId?.pharmacyName}</Text>
                <Text style={[s.activeOrderId, { color: colors.textSecondary }]}>
                  {order._id.slice(-6).toUpperCase()} · {order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0} items · ₹{order.totalAmount}
                </Text>
              </View>
            </View>

            {/* Step Tracker */}
            <View style={s.stepTracker}>
              {allSteps.map((step, i) => renderStep(order, step, i))}
            </View>
          </View>
        ))}

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Past Orders</Text>
          </View>
        )}
        {pastOrders.length > 0 && (
          <View style={[s.groupedList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {pastOrders.map((order, i) => (
              <TouchableOpacity
                key={order._id}
                style={[s.orderRow, i < pastOrders.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                activeOpacity={0.7}
              >
                <View style={[s.iconBox, { backgroundColor: colors.surfaceInput, borderColor: colors.border }]}>
                  <Text style={{ fontSize: 20 }}>🏥</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.orderName, { color: colors.textPrimary }]}>{order.pharmacyId?.pharmacyName}</Text>
                  <Text style={[s.orderDate, { color: colors.textSecondary }]}>{formatDate(order.createdAt)} · ₹{order.totalAmount}</Text>
                </View>
                <View style={[s.orderStatus, { backgroundColor: statusBg(order.status) }]}>
                  <Text style={[s.orderStatusText, { color: statusColor(order.status) }]}>{order.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrdersScreen;

const makeStyles = (c) => StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.8 },

  sectionHeader: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
  sectionTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.2 },

  activeCard: { marginHorizontal: 24, borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 24 },
  activeCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  iconBox: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  activeName: { fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold' },
  activeOrderId: { fontSize: 11, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 2 },

  stepTracker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDotRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center', position: 'relative' },
  stepDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#2EBD8F', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', zIndex: 2 },
  stepDotCompleted: { backgroundColor: '#2EBD8F', borderColor: '#2EBD8F' },
  stepDotActive: { backgroundColor: '#2EBD8F', borderColor: '#2EBD8F' },
  stepCheck: { color: '#FFF', fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold' },
  stepPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
  stepLine: { position: 'absolute', height: 2, width: '100%', left: '50%', zIndex: 1 },
  stepLabel: { fontSize: 9, marginTop: 6, textAlign: 'center' },

  groupedList: { marginHorizontal: 24, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  orderRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, gap: 12 },
  orderName: { fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold' },
  orderDate: { fontSize: 11, fontFamily: 'PlusJakartaSans_500Medium', marginTop: 2 },
  orderStatus: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  orderStatusText: { fontSize: 10, fontFamily: 'PlusJakartaSans_700Bold' },
});
