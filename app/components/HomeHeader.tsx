import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store'; // ajuste o caminho se necessário
import { logout } from '../store/slices/authSlice';

interface HomeHeaderProps {
  displayAddress: string;
}

export default function HomeHeader({ displayAddress }: HomeHeaderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const cliente = useSelector((state: RootState) => state.auth.cliente);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = () => {
    setMenuVisible(false);
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            router.replace('/(auth)/login' as any);
          },
        },
      ]
    );
  };

  const firstName = cliente?.nome?.split(' ')[0] ?? 'Olá';

  return (
    <View style={styles.header}>
      {/* Localização */}
      <View style={styles.locationContainer}>
        <Text style={styles.addressLabel}>Sua Localização</Text>
        <View style={styles.addressRow}>
          <Ionicons name="location" size={16} color="#6b21a8" />
          <Text style={styles.addressText} numberOfLines={1}>
            {displayAddress}
          </Text>
        </View>
      </View>

      {/* Avatar + Menu */}
      <TouchableOpacity
        style={styles.profileBtn}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.8}
      >
        {cliente?.foto ? (
          <Image source={{ uri: cliente.foto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {/* Indicador online */}
        <View style={styles.onlineDot} />
      </TouchableOpacity>

      {/* Dropdown Menu */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menu}>
                {/* Info do usuário */}
                <View style={styles.menuHeader}>
                  {cliente?.foto ? (
                    <Image source={{ uri: cliente.foto }} style={styles.menuAvatar} />
                  ) : (
                    <View style={styles.menuAvatarFallback}>
                      <Text style={styles.menuAvatarInitial}>
                        {firstName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.menuName} numberOfLines={1}>
                      {cliente?.nome ?? ''}
                    </Text>
                    <Text style={styles.menuEmail} numberOfLines={1}>
                      {cliente?.email ?? ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Opção: Meu perfil */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/(tabs)/perfil' as any);
                  }}
                >
                  <Ionicons name="person-outline" size={18} color="#1a0a2e" />
                  <Text style={styles.menuItemText}>Meu perfil</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Opção: Logout */}
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={18} color="#dc2626" />
                  <Text style={[styles.menuItemText, styles.menuItemLogout]}>
                    Sair da conta
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#1a0a2e',
  },

  // Localização
  locationContainer: { flex: 1, marginRight: 12 },
  addressLabel: {
    fontSize: 10,
    color: '#c4b8d8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  addressText: { fontSize: 14, fontWeight: '600', marginLeft: 6, color: '#FFF', flex: 1 },

  // Avatar
  profileBtn: { position: 'relative' },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: '#6b21a8' },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6b21a8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9333ea',
  },
  avatarInitial: { color: '#FFF', fontWeight: '800', fontSize: 18 },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#1a0a2e',
  },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90,
    paddingRight: 16,
  },

  // Menu dropdown
  menu: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    width: 240,
    paddingVertical: 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuAvatar: { width: 44, height: 44, borderRadius: 22 },
  menuAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6b21a8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuAvatarInitial: { color: '#FFF', fontWeight: '800', fontSize: 20 },
  menuName: { fontSize: 15, fontWeight: '700', color: '#1a0a2e' },
  menuEmail: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 12 },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemText: { fontSize: 14, fontWeight: '600', color: '#1a0a2e' },
  menuItemLogout: { color: '#dc2626' },
});
