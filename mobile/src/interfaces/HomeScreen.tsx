import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  fetchPrioritizedRisks,
  fetchDashboardIndicators,
  createCommunityReport,
  triggerSensorSimulation,
} from '../services/api';
import { RiskEvent, DashboardIndicators } from '../types/risk';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { DashboardHeader } from '../components/DashboardHeader';
import { RiskCard } from '../components/RiskCard';

export const HomeScreen: React.FC = () => {
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [indicators, setIndicators] = useState<DashboardIndicators | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('--:--:--');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [neighborhood, setNeighborhood] = useState<string>('Ipiranga');
  const [description, setDescription] = useState<string>('');
  const [selectedType, setSelectedType] = useState<
    'ALAGAMENTO' | 'ILHA_DE_CALOR' | 'INTERRUPCAO_SERVICO'
  >('ALAGAMENTO');

  const syncDataWithBackend = useCallback(async () => {
    const start = Date.now();
    try {
      const [risksData, dashData] = await Promise.all([
        fetchPrioritizedRisks(),
        fetchDashboardIndicators(),
      ]);
      setEvents(risksData);
      setIndicators(dashData);
      setIsConnected(true);
      setLatencyMs(Date.now() - start);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (error) {
      setIsConnected(false);
      setLatencyMs(null);
    }
  }, []);

  useEffect(() => {
    syncDataWithBackend();
    const interval = setInterval(syncDataWithBackend, 4000);
    return () => clearInterval(interval);
  }, [syncDataWithBackend]);

  const handleSimulateSensor = async () => {
    try {
      await triggerSensorSimulation();
      await syncDataWithBackend();
    } catch {
      setIsConnected(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!neighborhood.trim() || !description.trim()) return;
    try {
      await createCommunityReport({
        riskType: selectedType,
        neighborhood: neighborhood.trim(),
        description: description.trim(),
        sourceType: 'COMUNIDADE',
        readingValue: selectedType === 'ALAGAMENTO' ? 75 : selectedType === 'ILHA_DE_CALOR' ? 39 : 8,
      });
      setDescription('');
      setShowForm(false);
      await syncDataWithBackend();
    } catch {
      setIsConnected(false);
    }
  };

  const topCriticalAlert = events.find((e) => e.priorityLevel === 'CRITICO');

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>🏙️ Urban Risk Intelligence</Text>
      <Text style={styles.subtitle}>Monitoramento Comunitário e Sensores Urbanos</Text>

      <ConnectionBanner
        isConnected={isConnected}
        lastSyncTime={lastSyncTime}
        latencyMs={latencyMs}
      />

      {topCriticalAlert && (
        <View style={styles.alertNotification}>
          <Text style={styles.alertNotificationTitle}>
            🚨 ALERTA PRIORITÁRIO EM {topCriticalAlert.neighborhood.toUpperCase()}
          </Text>
          <Text style={styles.alertNotificationBody}>
            {topCriticalAlert.description} (Confiança:{' '}
            {Math.round((topCriticalAlert.confidenceLevel || 0) * 100)}%)
          </Text>
        </View>
      )}

      <DashboardHeader indicators={indicators} />

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.simBtn]}
          onPress={handleSimulateSensor}
        >
          <Text style={styles.actionBtnText}>⚡ Simular Leitura IoT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.reportBtn]}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.actionBtnText}>
            {showForm ? '✖ Fechar Relato' : '➕ Relato Comunitário'}
          </Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <ScrollView style={styles.formBox}>
          <Text style={styles.formLabel}>Tipo de Risco:</Text>
          <View style={styles.typeSelectorRow}>
            {(['ALAGAMENTO', 'ILHA_DE_CALOR', 'INTERRUPCAO_SERVICO'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  selectedType === type && styles.typeChipSelected,
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={styles.typeChipText}>{type.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Bairro / Região:</Text>
          <TextInput
            style={styles.input}
            value={neighborhood}
            onChangeText={setNeighborhood}
            placeholder="Ex: Ipiranga, Vila Mariana..."
            placeholderTextColor="#64748b"
          />

          <Text style={styles.formLabel}>Descrição da Ocorrência (Anônimo - LGPD):</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva a situação observada no local..."
            placeholderTextColor="#64748b"
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReport}>
            <Text style={styles.submitBtnText}>Enviar Alerta para Análise</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Text style={styles.sectionTitle}>
        📋 Eventos Priorizados por IA ({events.length})
      </Text>

      <FlatList
        data={events}
        keyExtractor={(item, idx) => String(item.id ?? idx)}
        renderItem={({ item }) => <RiskCard event={item} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 44,
  },
  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 10,
  },
  alertNotification: {
    backgroundColor: '#7f1d1d',
    borderWidth: 1,
    borderColor: '#f87171',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  alertNotificationTitle: {
    color: '#fecaca',
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 2,
  },
  alertNotificationBody: {
    color: '#ffffff',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  simBtn: {
    backgroundColor: '#0284c7',
  },
  reportBtn: {
    backgroundColor: '#4f46e5',
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  formBox: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    maxHeight: 270,
  },
  formLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#334155',
    borderRadius: 6,
    alignItems: 'center',
  },
  typeChipSelected: {
    backgroundColor: '#2563eb',
  },
  typeChipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  submitBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
});