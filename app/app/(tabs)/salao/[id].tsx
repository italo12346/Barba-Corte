import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect } from 'react';
import { 
  View, Text, Image, ScrollView, ActivityIndicator, 
  StyleSheet, SafeAreaView, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchSalonById, fetchSalonServicos } from '../../../store/slices/salonSlice';
import ServicoCard from '../../../components/ServicoCard'; // Verifique se o caminho está correto

export default function SalaoPerfil() {
  const { id } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  
  const { selectedSalon, servicos, loading } = useAppSelector((state) => state.salon);

  useEffect(() => {
    if (typeof id === 'string') {
      dispatch(fetchSalonById(id));
      dispatch(fetchSalonServicos(id));
    }
  }, [id, dispatch]);

  if (loading) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#6b21a8" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <Stack.Screen options={{ 
        title: selectedSalon?.nome || 'Barbearia', 
        headerShown: true,
        headerTitleStyle: { fontWeight: '800', color: '#1a0a2e' },
        headerTintColor: '#6b21a8',
      }} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header com Capa e Foto */}
        <View style={styles.headerContainer}>
          <Image 
            source={{ uri: selectedSalon?.capa || 'https://via.placeholder.com/400x200' }} 
            style={styles.capa} 
          />
          <View style={styles.perfilInfo}>
            <Image 
              source={{ uri: selectedSalon?.foto || 'https://via.placeholder.com/100' }} 
              style={styles.fotoPerfil} 
            />
            <Text style={styles.nome}>{selectedSalon?.nome}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color="#6b21a8" />
              <Text style={styles.subtitulo}>
                {selectedSalon?.endereco?.cidade} - {selectedSalon?.endereco?.uf}
              </Text>
            </View>
          </View>
        </View>

        {/* Listagem de Serviços */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
          
          {servicos.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum serviço disponível no momento.</Text>
          ) : (
            servicos.map((item: any) => {
              // O ID do serviço pode vir em diferentes campos dependendo da sua API
              const servicoId = item.servicoId || item._id || item.id;
              
              return (
                <ServicoCard 
                  key={servicoId} 
                  servicoId={servicoId} 
                  onPress={() => console.log('Agendar serviço:', servicoId)}
                />
              );
            })
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { marginBottom: 20 },
  capa: { width: '100%', height: 180 },
  perfilInfo: { alignItems: 'center', marginTop: -50 },
  fotoPerfil: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#FFF', backgroundColor: '#EEE' },
  nome: { fontSize: 24, fontWeight: '800', marginTop: 10, color: '#1a0a2e' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  subtitulo: { color: '#666', fontSize: 14, marginLeft: 4, fontWeight: '500' },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, color: '#1a0a2e' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
});
