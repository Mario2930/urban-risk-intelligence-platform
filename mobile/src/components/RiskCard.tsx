import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskEvent } from '../types/risk';

interface RiskCardProps {
  event: RiskEvent;
}

export const RiskCard: React.FC<RiskCardProps> = ({ event }) => {
  const getPriorityColor = (level?: string) => {
    switch (level) {
      case 'CRITICO': return '#ef4444';
      case 'ALTO': return '#f97316';
      case 'MEDIO': return '#eab308';
      default: return '#22c55e';
    }
  };

  const getRiskLabel = (type: string) => {
    switch (type) {
      case 'ALAGAMENTO': return '🌊 Alagamento';
      case 'ILHA_DE_CALOR': return '🌡️ Ilha de Calor';
      case 'INTERRUPCAO_SERVICO': return '⚡ Interrupção de Serviço';
      default: return type;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'SENSOR': return '📡 Sensor IoT';
      case 'BASE_PUBLICA': return '🏛️ Base Pública';
      case 'COMUNIDADE': return '👥 Relato Comunitário';
      default: return source;
    }
  };

  const confidencePercent = Math.round((event.confidenceLevel || 0) * 100);

  return (
    <View style={[styles.card, { borderLeftColor: getPriorityColor(event.priorityLevel) }]}>
      <View style={styles.headerRow}>
        <Text style={styles.riskType}>{getRiskLabel(event.riskType)}</Text>
        <View style={[styles.badge, { backgroundColor: getPriorityColor(event.priorityLevel) }]}>
          <Text style={styles.badgeText}>
            {event.priorityLevel} • Score {event.priorityScore}
          </Text>
        </View>
      </View>

      <Text style={styles.neighborhood}>📍 Bairro: {event.neighborhood}</Text>
      <Text style={styles.description}>{event.description}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.metaText}>{getSourceLabel(event.sourceType)}</Text>
        <Text style={styles.confidenceText}>
          🛡️ Confiança do Dado: {confidencePercent}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  riskType: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  neighborhood: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
  },
  metaText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceText: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '700',
  },
});