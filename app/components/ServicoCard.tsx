import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api'; // Verifique se o caminho para sua instância do axios está correto

interface ServicoCardProps {
  servicoId: string;
  onPress?: () => void;
}

export default function ServicoCard({ servicoId, onPress }: ServicoCardProps) {
  const [servico, setServico] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicoDetalhes = async () => {
      try {
        // Chamada para a rota específica de detalhes do serviço
        const { data } = await api.get(`/servicos/servico/${servicoId}`);
        setServico(data);
      } catch (error) {
        console.error("Erro ao buscar detalhes do serviço:", error);
      } finally {
        setLoading(false);
      }
    };

    if (servicoId) {
      fetchServicoDetalhes();
    }
  }, [servicoId]);

  if (loading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator size="small" color="#6b21a8" />
      </View>
    );
  }

  if (!servico) return null;

  // Busca a imagem no array 'arquivos' (padrão do seu backend)
  const arquivos = servico.arquivos || [];
  const imagemUrl = arquivos.length > 0 
    ? arquivos[0].caminhoArquivo 
    : 'https://via.placeholder.com/100';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <Image source={{ uri: imagemUrl }} style={styles.foto} />
      
      <View style={styles.info}>
        <Text style={styles.titulo} numberOfLines={1}>{servico.titulo}</Text>
        
        <Text style={styles.preco}>
          R$ {(servico.preco || 0).toFixed(2).replace('.', ',')}
        </Text>
        
        <View style={styles.durationRow}>
          <Ionicons name="time-outline" size={12} color="#999" />
          <Text style={styles.durationText}>{servico.duracao || 0} min</Text>
        </View>
      </View>

      <View style={styles.btnAgendar}>
        <Text style={styles.btnAgendarTexto}>Agendar</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderRadius: 20, 
    marginBottom: 16, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 4 }, 
    borderWidth: 1, 
    borderColor: '#F5F5F5' 
  },
  center: { justifyContent: 'center', height: 100 },
  foto: { width: 75, height: 75, borderRadius: 16, backgroundColor: '#F0F0F0' },
  info: { flex: 1, marginLeft: 15, marginRight: 10 },
  titulo: { fontSize: 16, fontWeight: '700', color: '#1a0a2e' },
  preco: { fontSize: 15, color: '#6b21a8', marginTop: 4, fontWeight: '800' },
  durationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  durationText: { fontSize: 12, color: '#999', marginLeft: 4 },
  btnAgendar: { backgroundColor: '#6b21a8', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  btnAgendarTexto: { color: '#FFF', fontWeight: '800', fontSize: 12 },
});
