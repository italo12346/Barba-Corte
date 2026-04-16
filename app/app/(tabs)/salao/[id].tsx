import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchSalonById, fetchSalonServicos } from '../../../store/slices/salonSlice';

import HomeHeader from '../../../components/HomeHeader';

export default function SalaoPerfil() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { selectedSalon, servicos, loading, error } = useAppSelector((state) => state.salon);

  useEffect(() => {
    if (typeof id === 'string') {
      dispatch(fetchSalonById(id));
      dispatch(fetchSalonServicos(id));
    }
  }, [id, dispatch]);

  const handleCall = () => {
    if (selectedSalon?.telefone) {
      Linking.openURL(`tel:${selectedSalon.telefone}`);
    }
  };

  const handleWhatsApp = () => {
    if (selectedSalon?.telefone) {
      const message = `Olá ${selectedSalon.nome}, gostaria de saber mais sobre os serviços.`;
      Linking.openURL(
        `whatsapp://send?phone=55${selectedSalon.telefone}&text=${encodeURIComponent(message)}`
      );
    }
  };

  const handleMap = () => {
    if (selectedSalon?.geo?.coordinates) {
      const [longitude, latitude] = selectedSalon.geo.coordinates;
      const label = selectedSalon.nome;

      const url = Platform.select({
        ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
        android: `geo:0,0?q=${latitude},${longitude}(${label})`
      });

      if (url) Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6b21a8" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Capa */}
        <Image
          source={{ uri: selectedSalon?.capa || 'https://via.placeholder.com/400x200' }}
          style={styles.capa}
        />

        {/* Perfil */}
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

        {/* Contato */}
        <View style={styles.contactSection}>
          <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#6b21a8" />
            <Text style={styles.contactBtnText}>Ligar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactBtn} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={styles.contactBtnText}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactBtn} onPress={handleMap}>
            <Ionicons name="map" size={20} color="#6b21a8" />
            <Text style={styles.contactBtnText}>Mapa</Text>
          </TouchableOpacity>
        </View>

        {/* Serviços */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>

          {servicos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={40} color="#CCC" />
              <Text style={styles.emptyText}>
                Nenhum serviço cadastrado no momento.
              </Text>
            </View>
          ) : (
            servicos.map((servico) => (
              <TouchableOpacity
                key={servico._id}
                style={styles.servicoCard}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri:
                      servico.arquivos?.[0]?.caminhoArquivo ||
                      servico.foto ||
                      'https://via.placeholder.com/80'
                  }}
                  style={styles.servicoFoto}
                />

                <View style={styles.servicoInfo}>
                  <Text style={styles.servicoTitulo} numberOfLines={1}>
                    {servico.titulo}
                  </Text>

                  <Text style={styles.servicoPreco}>
                    {servico.preco
                      ? `R$ ${servico.preco.toFixed(2).replace('.', ',')}`
                      : 'Consulte o valor'}
                  </Text>

                  <View style={styles.durationRow}>
                    <Ionicons name="time-outline" size={12} color="#999" />
                    <Text style={styles.durationText}>
                      {servico.duracao
                        ? `${servico.duracao} min`
                        : 'Tempo sob consulta'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.btnAgendar}>
                  <Text style={styles.btnAgendarTexto}>Agendar</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a0a2e' },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginTop: 10
  },

  capa: { width: '100%', height: 180 },

  perfilInfo: {
    alignItems: 'center',
    marginTop: -50
  },

  fotoPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFF'
  },

  nome: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 10,
    color: '#1a0a2e'
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },

  subtitulo: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4
  },

  contactSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginVertical: 30
  },

  contactBtn: {
    alignItems: 'center',
    backgroundColor: '#F8F9FD',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16
  },

  contactBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1a0a2e',
    marginTop: 6
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 25
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    color: '#1a0a2e'
  },

  servicoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 20,
    marginBottom: 16
  },

  servicoFoto: {
    width: 70,
    height: 70,
    borderRadius: 14
  },

  servicoInfo: {
    flex: 1,
    marginLeft: 15
  },

  servicoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a0a2e'
  },

  servicoPreco: {
    fontSize: 14,
    color: '#6b21a8',
    marginTop: 4,
    fontWeight: '800'
  },

  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },

  durationText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4
  },

  btnAgendar: {
    backgroundColor: '#6b21a8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12
  },

  btnAgendarTexto: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 20
  },

  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 10
  }
});