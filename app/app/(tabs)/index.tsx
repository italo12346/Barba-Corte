import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ActivityIndicator, 
  TouchableOpacity, ScrollView, RefreshControl, SafeAreaView 
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';

// ✅ 1. Definir a interface para o TypeScript entender o seu Schema
interface Salao {
  _id: string;
  nome: string;
  foto?: string;
  capa?: string;
  endereco: {
    logradouro: string;
    numero: string;
    cidade: string;
    uf: string;
  };
}

export default function Home() {
  const router = useRouter();
  
  // ✅ 2. Tipar o estado como um array de Salao
  const [saloes, setSaloes] = useState<Salao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // ✅ 3. Tipar o erro como string ou null
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

      const { data } = await api.get(`/salao?lat=${latitude}&lon=${longitude}`);

      if (!data.error) {
        setSaloes(data.saloes);
      }
    } catch (error) {
      console.error("Erro ao carregar salões:", error);
      setErrorMsg('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSaloes();
  }, []);

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
      <TouchableOpacity style={styles.retryBtn} onPress={() => {setLoading(true); loadSaloes();}}>
        <Text style={styles.retryBtnText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadSaloes();}} />}
      >
        <View style={styles.header}>
          <Text style={styles.addressLabel}>Sua Localização</Text>
          <View style={styles.addressRow}>
            <MaterialIcons name="location-on" size={18} color="#6b21a8" />
            <Text style={styles.addressText} numberOfLines={1}>📍 Localização Atual (GPS)</Text>
          </View>
        </View>

        {saloes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>O Mais Próximo de Você 📍</Text>
            <TouchableOpacity 
              style={styles.cardDestaque}
              // ✅ 4. Ajuste na navegação (usando 'as any' se o router reclamar da rota dinâmica)
              onPress={() => router.push(`/(tabs)/salao/${saloes[0]._id}` as any)}
            >
              <Image 
                source={{ uri: saloes[0].capa || 'https://via.placeholder.com/400x200' }} 
                style={styles.fotoDestaque} 
              />
              <View style={styles.infoDestaque}>
                <Text style={styles.nomeDestaque}>{saloes[0].nome}</Text>
                <View style={styles.badgeDistancia}>
                  <MaterialIcons name="directions-walk" size={14} color="#6b21a8" />
                  <Text style={styles.distanciaText}>Destaque por proximidade</Text>
                </View>
                <Text style={styles.enderecoText}>
                  {saloes[0].endereco.logradouro}, {saloes[0].endereco.numero}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
         )}

        <Text style={styles.sectionTitle}>Explorar Barbearias</Text>
        {saloes.map((item, index) => (
          <TouchableOpacity 
            key={item._id} 
            style={styles.cardComum}
            onPress={() => router.push(`/(tabs)/salao/${item._id}` as any)}
          >
            <Image 
              source={{ uri: item.foto || 'https://via.placeholder.com/100' }} 
              style={styles.fotoComum} 
            />
            <View style={styles.infoComum}>
              <Text style={styles.nomeComum}>{item.nome}</Text>
              <Text style={styles.subText}>
                {item.endereco.cidade} • {item.endereco.uf}
              </Text>
              <Text style={styles.distanciaSubText}>📍 {index === 0 ? 'Mais próximo' : 'Disponível para agendamento'}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
         ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#666', fontWeight: '500' },
  errorText: { marginTop: 10, color: '#ff4444', textAlign: 'center', fontSize: 16 },
  retryBtn: { marginTop: 20, backgroundColor: '#6b21a8', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontWeight: 'bold' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  addressLabel: { fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  addressText: { fontSize: 14, fontWeight: 'bold', marginLeft: 4, color: '#333' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 15, color: '#1a0a2e', marginTop: 10 },
  cardDestaque: { backgroundColor: '#FFF', borderRadius: 16, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, overflow: 'hidden' },
  fotoDestaque: { width: '100%', height: 180 },
  infoDestaque: { padding: 15 },
  nomeDestaque: { fontSize: 22, fontWeight: 'bold', color: '#1a0a2e' },
  badgeDistancia: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3e8ff', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 8 },
  distanciaText: { color: '#6b21a8', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  enderecoText: { color: '#777', fontSize: 13, marginTop: 10 },
  cardComum: { flexDirection: 'row', padding: 15, marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 14, marginBottom: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  fotoComum: { width: 65, height: 65, borderRadius: 12 },
  infoComum: { flex: 1, marginLeft: 15 },
  nomeComum: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  subText: { color: '#888', fontSize: 13, marginTop: 2 },
  distanciaSubText: { color: '#6b21a8', fontSize: 12, fontWeight: '600', marginTop: 4 }
});
