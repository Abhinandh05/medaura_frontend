import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeContext';
import { updateItemQty, clearCart } from '../../redux/slices/cartSlice';
import { createOrder } from '../../redux/slices/orderSlice';
import { useStripe } from '@stripe/stripe-react-native';
import api from '../../services/api';

const CartScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  
  const cartItems = useSelector(s => s?.cart?.items || []);
  const [isOrdering, setIsOrdering] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Group items by pharmacy since orders must belong to one pharmacy
  // For simplicity here, we assume user adds from same pharmacy
  // In a robust app, you would disable adding from multiple or split orders
  
  const firstPharmacyId = cartItems.length > 0 ? (cartItems[0].pharmacyId || cartItems[0].pharmacy?._id) : null;
  const firstPharmacyName = cartItems.length > 0 ? cartItems[0].pharmacyName : 'Pharmacy';

  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + ((item.price || 0) * (item.qty || 0)), 0);
  }, [cartItems]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    // Check if multiple pharmacies exist in cart (guard rail)
    const hasMultiplePharmacies = cartItems.some(
      item => (item.pharmacyId || item.pharmacy?._id) !== firstPharmacyId
    );

    if (hasMultiplePharmacies) {
      Alert.alert("Multiple Pharmacies", "Currently you can only order from one pharmacy at a time. Please clear your cart and add items from one pharmacy.");
      return;
    }

    if (!firstPharmacyId) {
      Alert.alert("Error", "Missing Pharmacy info in item.");
      return;
    }

    const orderData = {
      pharmacyId: firstPharmacyId,
      items: cartItems.map(item => ({
        medicineId: item._id || item.id,
        medicineName: item.medicineName || item.name,
        quantity: item.qty,
        price: item.price
      })),
      totalAmount
    };

    if (totalAmount < 50) {
      Alert.alert("Minimum Amount Required", "The minimum order amount for online payment is ₹50.00. Please add more items to your cart.");
      return;
    }

    try {
      setIsOrdering(true);

      // 1. Request client secret from backend
      const { data } = await api.post('/payment/create-payment-intent', { amount: totalAmount });
      const clientSecret = data.clientSecret;

      // 2. Initialize the Payment Sheet
      const initResponse = await initPaymentSheet({
        merchantDisplayName: 'Medical App',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: 'Guest User', // This would come from user profile ideally
        }
      });

      if (initResponse.error) {
        setIsOrdering(false);
        Alert.alert('Payment initialization failed', initResponse.error.message);
        return;
      }

      // 3. Present the Payment Sheet
      const paymentResponse = await presentPaymentSheet();

      if (paymentResponse.error) {
        setIsOrdering(false);
        if (paymentResponse.error.code !== 'Canceled') {
           Alert.alert('Payment failed', paymentResponse.error.message);
        }
        return;
      }

      // 4. Payment successful, submit the order
      await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      setIsOrdering(false);
      
      Alert.alert("Success", "Your order has been placed successfully!", [
        { text: "View Orders", onPress: () => navigation.navigate('UserTabs', { screen: 'Orders' }) }
      ]);
    } catch (err) {
      setIsOrdering(false);
      const errorMessage = err?.response?.data?.message || err?.message || 'Could not place order';
      Alert.alert("Checkout Failed", errorMessage);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Your Cart</Text>
        <TouchableOpacity onPress={() => dispatch(clearCart())}>
          <Text style={{ color: colors.danger, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 60, marginBottom: 16 }}>🛒</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Your cart is empty</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Add medicines from pharmacies to checkout</Text>
            <TouchableOpacity 
              style={[styles.shopBtn, { backgroundColor: colors.accent }]}
              onPress={() => navigation.navigate('UserTabs', { screen: 'Home' })}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[styles.pharmacyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.accentPaleBg, borderColor: colors.accentSoftBorder }]}>
                <Text style={{ fontSize: 20 }}>🏥</Text>
              </View>
              <View>
                <Text style={[styles.cartFromText, { color: colors.textSecondary }]}>Ordering from</Text>
                <Text style={[styles.pharmacyName, { color: colors.textPrimary }]}>{firstPharmacyName}</Text>
              </View>
            </View>

            <View style={styles.itemsList}>
              {cartItems.map((item, index) => (
                <View key={item.id || index} style={[styles.cartItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.medicineName || item.name}</Text>
                    <Text style={[styles.itemPrice, { color: colors.textPrimary }]}>₹{(item.price * item.qty).toFixed(2)}</Text>
                  </View>
                  <View style={[styles.qtyControl, { backgroundColor: colors.surfaceInput, borderColor: colors.border }]}>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => dispatch(updateItemQty({ id: item.id || item._id, qty: Math.max(0, item.qty - 1) }))}
                    >
                      <Text style={{ fontSize: 18, color: colors.textPrimary }}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.qty}</Text>
                    <TouchableOpacity 
                      style={styles.qtyBtn}
                      onPress={() => dispatch(updateItemQty({ id: item.id || item._id, qty: item.qty + 1 }))}
                    >
                      <Text style={{ fontSize: 18, color: colors.textPrimary }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.summaryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.summaryAmount, { color: colors.textPrimary }]}>₹{totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
                <Text style={[styles.summaryAmount, { color: colors.accent }]}>Free</Text>
              </View>
              <View style={[styles.summaryTotalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.summaryTotalLabel, { color: colors.textPrimary }]}>Total Amount</Text>
                <Text style={[styles.summaryTotalAmount, { color: colors.textPrimary }]}>₹{(totalAmount || 0).toFixed(2)}</Text>
              </View>
              {totalAmount < 50 && (
                <View style={styles.minAmountWarning}>
                  <Ionicons name="warning" size={16} color={colors.danger} />
                  <Text style={[styles.minAmountText, { color: colors.danger }]}>
                    Minimum order for online payment is ₹50.00
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.checkoutBtn, { backgroundColor: colors.accent }, isOrdering && { opacity: 0.7 }]}
            onPress={handleCheckout}
            disabled={isOrdering}
          >
            {isOrdering ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.checkoutBtnText}>Order Now (₹{totalAmount.toFixed(2)})</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold' },
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontFamily: 'PlusJakartaSans_700Bold', marginBottom: 8 },
  emptySub: { fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium', textAlign: 'center', marginBottom: 24 },
  shopBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 },

  pharmacyCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  iconBox: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cartFromText: { fontSize: 11, fontFamily: 'PlusJakartaSans_500Medium', marginBottom: 2 },
  pharmacyName: { fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold' },

  itemsList: { marginBottom: 24 },
  cartItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  itemInfo: { flex: 1, paddingRight: 16 },
  itemName: { fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold', marginBottom: 4 },
  itemPrice: { fontSize: 14, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold', paddingHorizontal: 4, minWidth: 20, textAlign: 'center' },

  summaryBox: { padding: 20, borderRadius: 16, borderWidth: 1 },
  summaryTitle: { fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium' },
  summaryAmount: { fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold' },
  summaryTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 16, borderTopWidth: 1 },
  summaryTotalLabel: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold' },
  summaryTotalAmount: { fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  minAmountWarning: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 12, 
    padding: 8, 
    backgroundColor: '#FEE2E2', 
    borderRadius: 8 
  },
  minAmountText: { 
    fontSize: 12, 
    fontFamily: 'PlusJakartaSans_600SemiBold', 
    marginLeft: 6 
  },

  footer: { padding: 20, borderTopWidth: 1 },
  checkoutBtn: { padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  checkoutBtnText: { color: '#FFF', fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold' }
});
