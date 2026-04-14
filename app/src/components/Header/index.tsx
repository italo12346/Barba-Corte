import React from 'react';
import { Platform, Image, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Importando componentes estilizados oficiais
import { 
  Box, 
  Text, 
  Touchable, 
} from '../../styles';

// Tipagem básica para o RootState
interface RootState {
  auth: {
    salao: {
      nome: string;
      foto?: string;
    } | null;
  };
}

const Header: React.FC = () => {
  const { salao } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<any>();

  // Iniciais do salão caso não tenha foto
  const initials = salao?.nome
    ? salao.nome
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'S';

  return (
    <Box 
      width="100%" 
      height={Platform.OS === 'ios' ? '100px' : '70px'} 
      background="light" 
      align="flex-end" 
      justify="space-between" 
      hasPadding 
      style={styles.headerShadow}
    >
      {/* Lado Esquerdo: Logo */}
      <Box align="center">
        <Icon name="content-cut" size={24} color="#6C63FF" />
        <Text bold color="dark" spacing="0 0 0 8px" style={{ fontSize: 18, letterSpacing: -0.5 }}>
          BARBA<Text bold color="primary" style={{ fontSize: 18 }}>CORTE</Text>
        </Text>
      </Box>

      {/* Lado Direito: Perfil e Notificações */}
      <Box align="center">
        <Touchable 
          spacing="0 15px 0 0"
          onPress={() => {}}
          style={{ position: 'relative' }}
        >
          <Icon name="bell-outline" size={26} color="#1A0633" />
          <Box 
            width="10px" 
            height="10px" 
            radius={5} 
            background="danger" 
            style={styles.badge} 
          />
        </Touchable>

        <Touchable 
          onPress={() => navigation.navigate('Profile')}
        >
          {salao?.foto ? (
            <Image 
              source={{ uri: salao.foto }} 
              style={styles.avatar} 
            />
          ) : (
            <Box 
              width="40px" 
              height="40px" 
              radius={20} 
              background="primary" 
              align="center" 
              justify="center"
            >
              <Text bold color="light" small>{initials}</Text>
            </Box>
          )}
        </Touchable>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  headerShadow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
});

export default Header;
