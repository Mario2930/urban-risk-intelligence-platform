import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardIndicators } from '../types/risk';

interface DashboardHeaderProps {
  indicators: DashboardIndicators | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ indicators }) => {
  return (
    <View style={styles.container}>
      <View style={styles.cardsRow}>
        <View style={[styles.card, styles.criticalCard]}>
          <Text style={styles.cardValue}>{indicators ? indicators.criticalAlerts : '-'}</Text>
          <Text style={styles.cardLabel}>Alertas Críticos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>{indicators ? indicators.totalEvents : '-'}</Text>
          <Text style={styles.cardLabel}>Eventos Ativos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>
            {indicators ? `${indicators.averageConfidence}%` : '-'}
          </Text>
          <Text style={styles.cardLabel}>Confiança Média</Text>
        </View>
      </View>

      <Text style={styles.aiStatus}>
        🧠 Motor de Análise: {indicators?.aiEngineStatus || 'Aguardando sincronização...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  criticalCard: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
  },
  cardValue: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  aiStatus: {
    color: '#38bdf8',
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
});