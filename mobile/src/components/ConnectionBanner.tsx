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
      <Text style={styles.statusText}>
        {isConnected
          ? `🟢 CONECTADO EM TEMPO REAL • Sincronizado às ${lastSyncTime} (${latencyMs ?? 0}ms)`
          : `🔴 BACKEND DESCONECTADO • Exibindo último estado seguro em cache. Reconectando automaticamente...`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  online: {
    backgroundColor: '#065f46',
  },
  offline: {
    backgroundColor: '#991b1b',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});