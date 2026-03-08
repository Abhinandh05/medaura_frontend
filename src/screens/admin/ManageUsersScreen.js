import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchAllUsers, deleteUser } from '../../redux/slices/adminSlice';

const ManageUsersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.admin);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [search, setSearch] = useState('');

  const loadUsers = useCallback(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return { bg: '#E0E7FF', text: '#4F46E5' };
      case 'pharmacy_owner': return { bg: '#E6F4F1', text: colors.primary };
      default: return { bg: '#F3F4F6', text: colors.textLight };
    }
  };

  const handleDeleteUser = (user) => {
    if (user._id === currentUser?._id) {
      Alert.alert('Error', 'You cannot delete your own account.');
      return;
    }
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${user.name}"?${user.role === 'pharmacy_owner' ? ' This will also delete their pharmacy and medicines.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteUser(user._id)),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Users</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{users.length}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar 
            placeholder="Search users by name or email..." 
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {isLoading && users.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={loadUsers} colors={[colors.primary]} />
            }
            renderItem={({ item }) => {
              const badge = getRoleBadgeColor(item.role);
              const isCurrentUser = item._id === currentUser?._id;
              return (
                <View style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{item.name}</Text>
                      {isCurrentUser && (
                        <Text style={styles.youBadge}>YOU</Text>
                      )}
                    </View>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    {item.phone && <Text style={styles.userPhone}>{item.phone}</Text>}
                    <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.roleText, { color: badge.text }]}>
                        {item.role.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {!isCurrentUser && (
                    <TouchableOpacity 
                      style={styles.actionBtn}
                      onPress={() => handleDeleteUser(item)}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.red} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <EmptyState
                title="No Users Found"
                message={search ? 'No users match your search.' : 'No users found.'}
                iconName="people-outline"
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.m,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  headerBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  headerBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: spacing.m,
  },
  listContent: {
    padding: spacing.m,
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  userName: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  youBadge: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4F46E5',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  userEmail: {
    ...typography.caption,
    color: colors.textLight,
  },
  userPhone: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: spacing.s,
    marginTop: spacing.xs,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionBtn: {
    padding: spacing.s,
  },
});

export default ManageUsersScreen;
