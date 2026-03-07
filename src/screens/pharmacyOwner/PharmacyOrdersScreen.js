import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { fetchPharmacyOrders, updateOrderStatus } from '../../redux/slices/orderSlice';

const PharmacyOrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { pharmacyOrders, isLoading } = useSelector(state => state.orders);
  
  const [filter, setFilter] = useState('Active'); // 'Active' or 'Past'

  useEffect(() => {
    dispatch(fetchPharmacyOrders());
  }, [dispatch]);

  const activeOrders = pharmacyOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const pastOrders = pharmacyOrders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');
  
  const displayOrders = filter === 'Active' ? activeOrders : pastOrders;

  const handleUpdateStatus = (orderId, currentStatus) => {
    const allSteps = ['Placed', 'Confirmed', 'Packed', 'On Way', 'Delivered'];
    const idx = allSteps.indexOf(currentStatus);
    
    if (idx < allSteps.length - 1) {
      const nextStatus = allSteps[idx + 1];
      Alert.alert(
        "Update Order",
        `Move this order to "${nextStatus}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Update", 
            onPress: () => {
              dispatch(updateOrderStatus({ orderId, status: nextStatus }));
            }
          }
        ]
      );
    }
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          onPress: () => {
            dispatch(updateOrderStatus({ orderId, status: 'Cancelled' }));
          },
          style: 'destructive'
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Orders</Text>
        <TouchableOpacity onPress={() => dispatch(fetchPharmacyOrders())}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'Active' && styles.filterBtnActive]}
          onPress={() => setFilter('Active')}
        >
          <Text style={[styles.filterText, filter === 'Active' && styles.filterTextActive]}>Active ({activeOrders.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'Past' && styles.filterBtnActive]}
          onPress={() => setFilter('Past')}
        >
          <Text style={[styles.filterText, filter === 'Past' && styles.filterTextActive]}>Past ({pastOrders.length})</Text>
        </TouchableOpacity>
      </View>

      {isLoading && pharmacyOrders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {displayOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color={colors.textLight} />
              <Text style={styles.emptyText}>No {filter.toLowerCase()} orders found.</Text>
            </View>
          ) : (
            displayOrders.map(order => (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: order.status === 'Cancelled' ? '#FEE2E2' : order.status === 'Delivered' ? '#D1FAE5' : '#FEF3C7' }]}>
                    <Text style={[styles.statusText, { color: order.status === 'Cancelled' ? '#DC2626' : order.status === 'Delivered' ? '#059669' : '#D97706' }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.customerInfo}>
                  <Ionicons name="person-circle-outline" size={20} color={colors.textLight} />
                  <Text style={styles.customerName}>{order.userId?.name || 'Customer'}</Text>
                  <Text style={styles.customerPhone}> · {order.userId?.phone || 'N/A'}</Text>
                </View>

                <View style={styles.itemsContainer}>
                  {order.items?.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.quantity}x {item.medicineName}</Text>
                      <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                    </View>
                  ))}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
                  </View>
                </View>

                {filter === 'Active' && (
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.cancelBtn]} 
                      onPress={() => handleCancelOrder(order._id)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.updateBtn]} 
                      onPress={() => handleUpdateStatus(order._id, order.status)}
                    >
                      <Text style={styles.updateBtnText}>Advance Status</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.m,
    backgroundColor: colors.white,
    gap: spacing.m,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: spacing.s,
    alignItems: 'center',
    borderRadius: spacing.xs,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.body,
    color: colors.textLight,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.m,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.s,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.s,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  orderId: {
    ...typography.h4,
    color: colors.text,
  },
  orderDate: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  customerName: {
    ...typography.bodySmall,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  customerPhone: {
    ...typography.caption,
    color: colors.textLight,
  },
  itemsContainer: {
    backgroundColor: colors.background,
    padding: spacing.s,
    borderRadius: spacing.xs,
    marginBottom: spacing.m,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  itemName: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  itemPrice: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.s,
    paddingTop: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalAmount: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.s,
    borderRadius: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCCCA7',
  },
  cancelBtnText: {
    ...typography.body,
    color: colors.red,
    fontWeight: 'bold',
  },
  updateBtn: {
    backgroundColor: colors.primary,
    gap: spacing.xs,
  },
  updateBtnText: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default PharmacyOrdersScreen;
