import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../services/api';
import { Salon } from '../../store/slices/salonSlice';
import HomeHeader from '../../components/HomeHeader'; // ajuste o caminho se necessário

export default function Home() {
  const router = useRouter();
  const [saloes, setSaloes] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [displayAddress, setDisplayAddress] = useState<string>('Buscando localização...');

  const loadSaloes = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada');
        setLoading(false);
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          { headers: { 'User-Agent': 'BarbeariaApp/1.0' } }
        );
        const dataAddr = await response.json();

        if (dataAddr?.address) {
          const { road, suburb, city, town, village } = dataAddr.address;
          const streetName = road || suburb || '';
          const cityName = city || town || village || '';
          setDisplayAddress(`${streetName}${streetName && cityName ? ', ' : ''}${cityName}`);
        } else {
          setDisplayAddress('Localização identificada');
        }
      } catch {
        setDisplayAddress('Localização Atual (GPS)');
      }

      const { data } = await api.get(`/salao?lat=${latitude}&lon=${longitude}`);
      if (!data.error) setSaloes(data.saloes);
    } catch {
      setErrorMsg('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadSaloes(); }, []);

  if (loading) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#6b21a8" />
      <Text style={styles.loadingText}>Buscando barbearias próximas...</Text>
    </View>
  );

  if (errorMsg) return (
    <View style={styles.centerContainer}>
      <MaterialIcons name="error-outline" size={48} color="#ff4444" />
      <Text style={styles.errorText}>{errorMsg}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); loadSaloes(); }}>
        <Text style={styles.retryBtnText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0a2e" />

      {/* ✅ Header agora é um componente separado */}
      <HomeHeader displayAddress={displayAddress} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadSaloes(); }}
            tintColor="#6b21a8"
          />
        }
      >
        {/* Destaque: O Mais Próximo */}
        {saloes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>O Mais Próximo de Você</Text>
              <MaterialIcons name="stars" size={20} color="#6b21a8" />
            </View>

            <TouchableOpacity
              style={styles.cardDestaque}
              activeOpacity={0.9}
              onPress={() => router.push(`/(tabs)/salao/${saloes[0]._id}` as any)}
            >
              <Image
                source={{ uri: saloes[0].capa || 'https://via.placeholder.com/400x200' }}
                style={styles.fotoDestaque}
              />
              <View style={styles.infoDestaque}>
                <View style={styles.nomeRow}>
                  <Text style={styles.nomeDestaque}>{saloes[0].nome}</Text>
                  <View style={styles.notaBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.notaText}>4.9</Text>
                  </View>
                </View>
                <View style={styles.badgeDistancia}>
                  <MaterialIcons name="directions-walk" size={14} color="#6b21a8" />
                  <Text style={styles.distanciaText}>Destaque por proximidade</Text>
                </View>
                <Text style={styles.enderecoText}>
                  {saloes[0].endereco?.logradouro}, {saloes[0].endereco?.numero}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista Completa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explorar Barbearias</Text>
          {saloes.map((item, index) => (
            <TouchableOpacity
              key={item._id}
              style={styles.cardComum}
              activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/salao/${item._id}` as any)}
            >
              <Image
                source={{ uri: item.foto || 'https://via.placeholder.com/100' }}
                style={styles.fotoComum}
              />
              <View style={styles.infoComum}>
                <Text style={styles.nomeComum}>{item.nome}</Text>
                <Text style={styles.subText}>
                  {item.endereco?.cidade} • {item.endereco?.uf}
                </Text>
                <View style={styles.distanciaRow}>
                  <Ionicons name="navigate-circle" size={14} color="#6b21a8" />
                  <Text style={styles.distanciaSubText}>
                    {index === 0 ? 'Mais próximo de você' : 'Disponível para agendamento'}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#E0E0E0" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a0a2e' },
  container: { flex: 1, backgroundColor: '#F8F9FD', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FD' },
  loadingText: { marginTop: 12, color: '#6b21a8', fontWeight: '600', fontSize: 14 },
  errorText: { marginTop: 10, color: '#ff4444', textAlign: 'center', fontSize: 16, fontWeight: '500' },
  retryBtn: { marginTop: 20, backgroundColor: '#6b21a8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, elevation: 4 },
  retryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1a0a2e', marginRight: 8 },

  cardDestaque: {
    backgroundColor: '#FFF', borderRadius: 24, elevation: 10,
    shadowColor: '#6b21a8', shadowOpacity: 0.15, shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  fotoDestaque: { width: '100%', height: 190 },
  infoDestaque: { padding: 20 },
  nomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nomeDestaque: { fontSize: 22, fontWeight: '800', color: '#1a0a2e', flex: 1 },
  notaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  notaText: { fontSize: 12, fontWeight: '700', color: '#FFB800', marginLeft: 4 },
  badgeDistancia: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3e8ff', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 12 },
  distanciaText: { color: '#6b21a8', fontWeight: '700', fontSize: 12, marginLeft: 6 },
  enderecoText: { color: '#7D7D7D', fontSize: 13, marginTop: 12, lineHeight: 18 },

  cardComum: {
    flexDirection: 'row', padding: 16, backgroundColor: '#FFF', borderRadius: 20,
    marginBottom: 16, alignItems: 'center', elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, borderWidth: 1, borderColor: '#F5F5F5',
  },
  fotoComum: { width: 70, height: 70, borderRadius: 16, backgroundColor: '#F0F0F0' },
  infoComum: { flex: 1, marginLeft: 16 },
  nomeComum: { fontSize: 17, fontWeight: '700', color: '#1a0a2e' },
  subText: { color: '#9E9E9E', fontSize: 13, marginTop: 4 },
  distanciaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  distanciaSubText: { color: '#6b21a8', fontSize: 12, fontWeight: '700', marginLeft: 4 },
});