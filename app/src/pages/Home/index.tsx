import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, Image, FlatList 
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Header'; // 🔥 Certifique-se de que o caminho está correto

// Tipagem básica (Ajuste conforme sua store)
interface RootState {
  auth: {
    salao: {
      nome: string;
      foto?: string;
    } | null;
  };
}

const Home: React.FC = () => {
  const { salao } = useSelector((state: RootState) => state.auth);

  // Dados de exemplo para o dashboard
  const stats = [
    { id: '1', title: 'Agendamentos Hoje', value: '12', icon: 'calendar-check', color: '#5E17EB' },
    { id: '2', title: 'Faturamento Mês', value: 'R$ 4.500', icon: 'currency-usd', color: '#27AE60' },
    { id: '3', title: 'Novos Clientes', value: '28', icon: 'account-group', color: '#F2994A' },
  ];

  const renderStatCard = ({ item }: { item: typeof stats[0] }) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Boas Vindas */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Olá, {salao?.nome || 'Salão'}</Text>
          <Text style={styles.welcomeSubtitle}>Confira o resumo do seu negócio hoje.</Text>
        </View>

        {/* Estatísticas Rápidas */}
        <View style={styles.statsSection}>
          <FlatList
            data={stats}
            renderItem={renderStatCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        {/* Atalhos Rápidos */}
        <View style={styles.shortcutsSection}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.shortcutsGrid}>
            <TouchableOpacity style={styles.shortcutBtn}>
              <View style={styles.shortcutIconWrapper}>
                <Icon name="plus-circle" size={30} color="#5E17EB" />
              </View>
              <Text style={styles.shortcutText}>Novo Agendamento</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shortcutBtn}>
              <View style={styles.shortcutIconWrapper}>
                <Icon name="account-plus" size={30} color="#5E17EB" />
              </View>
              <Text style={styles.shortcutText}>Novo Cliente</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shortcutBtn}>
              <View style={styles.shortcutIconWrapper}>
                <Icon name="content-cut" size={30} color="#5E17EB" />
              </View>
              <Text style={styles.shortcutText}>Serviços</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shortcutBtn}>
              <View style={styles.shortcutIconWrapper}>
                <Icon name="chart-bar" size={30} color="#5E17EB" />
              </View>
              <Text style={styles.shortcutText}>Relatórios</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Próximos Agendamentos (Placeholder) */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximos Agendamentos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.emptyCard}>
            <Icon name="calendar-blank" size={40} color="#DDD" />
            <Text style={styles.emptyText}>Nenhum agendamento para agora.</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  welcomeSection: { padding: 20, paddingTop: 30 },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A0633' },
  welcomeSubtitle: { fontSize: 14, color: '#6C63FF', marginTop: 5 },
  
  statsSection: { marginTop: 10 },
  statCard: {
    backgroundColor: '#FFF',
    width: 150,
    padding: 20,
    borderRadius: 15,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    alignItems: 'center',
  },
  iconContainer: { width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statTitle: { fontSize: 12, color: '#888', marginTop: 2, textAlign: 'center' },

  shortcutsSection: { padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A0633', marginBottom: 15 },
  shortcutsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  shortcutBtn: { width: '48%', backgroundColor: '#FFF', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15, elevation: 1 },
  shortcutIconWrapper: { marginBottom: 10 },
  shortcutText: { fontSize: 13, fontWeight: '600', color: '#444', textAlign: 'center' },

  recentSection: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  seeAllLink: { color: '#6C63FF', fontWeight: 'bold', fontSize: 14 },
  emptyCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 40, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#DDD' },
  emptyText: { marginTop: 10, color: '#AAA', fontSize: 14 },
});

export default Home;
