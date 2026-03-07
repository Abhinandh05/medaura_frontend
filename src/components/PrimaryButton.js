import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const PrimaryButton = ({ title, onPress, loading, style, textStyle, disabled }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button, 
        (disabled || loading) && styles.disabled, 
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: spacing.s,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.white,
  },
  disabled: {
    backgroundColor: colors.accent,
    opacity: 0.7,
  },
});

export default PrimaryButton;
