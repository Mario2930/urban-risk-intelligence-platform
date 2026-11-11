import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ConnectionBannerProps {
  isConnected: boolean;
  lastSyncTime: string;
  latencyMs: number | null;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  isConnected,
  lastSyncTime,
  latencyMs,
}) => {
  return (
    <View style={[styles.banner, isConnected ? styles.online : styles.offline]}>
      <Text style={styles.titleText}>
        {isConnected
          ? '🟢 SISTEMA CONECTADO EM TEMPO REAL'
          : '🔴 BACKEND DESCONECTADO (MODO OFFLINE)'}
      </Text>
      <Text style={styles.subText}>
        {isConnected
          ? `Última sincronização com a API às ${lastSyncTime} • Latência: ${latencyMs ?? 0}ms`
          : 'Sem conexão com o servidor. Exibindo dados em cache local e tentando reconectar a cada 4s...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 14,
    minHeight: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  online: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
  },
  offline: {
    backgroundColor: '#7f1d1d',
    borderColor: '#f87171',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});