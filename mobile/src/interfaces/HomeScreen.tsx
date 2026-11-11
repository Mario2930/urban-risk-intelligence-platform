import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  fetchPrioritizedRisks,
  fetchDashboardIndicators,
  createCommunityReport,
  triggerSensorSimulation,
  resetAllEvents,
} from '../services/api';
import { RiskEvent, DashboardIndicators } from '../types/risk';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { DashboardHeader } from '../components/DashboardHeader';
import { RiskCard } from '../components/RiskCard';

const BAIRROS_SP = [
  'Ipiranga',
  'Bela Vista',
  'Vila Mariana',
  'Mooca',
  'Pinheiros',
  'Tatuapé',
  'Lins de Vasconcelos',
  'Cambuci',
  'Liberdade',
  'Consolação',
  'Aclimação',
  'Santana',
  'Butantã',
  'Itaquera',
  'Santo Amaro',
  'Perdizes',
  'Vila Prudente',
  'Brás',
  'Penha',
  'Jabaquara',
  ' Brooklin',
  'Casa Verde',
  'Lapa',
  ' Tucuruvi',
].map((b) => b.trim());

export const HomeScreen: React.FC = () => {
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [indicators, setIndicators] = useState<DashboardIndicators | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('--:--:--');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [neighborhood, setNeighborhood] = useState<string>('Ipiranga');
  const [neighborhoodSearch, setNeighborhoodSearch] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedType, setSelectedType] = useState<
    'ALAGAMENTO' | 'ILHA_DE_CALOR' | 'INTERRUPCAO_SERVICO'
  >('ALAGAMENTO');

  // Filtra os bairros conforme o texto digitado na pesquisa
  const filteredNeighborhoods = useMemo(() => {
    const query = neighborhoodSearch.trim().toLowerCase();
    if (!query) return BAIRROS_SP;
    return BAIRROS_SP.filter((b) => b.toLowerCase().includes(query));
  }, [neighborhoodSearch]);

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

  const handleResetEvents = async () => {
    try {
      await resetAllEvents();
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
        readingValue:
          selectedType === 'ALAGAMENTO'
            ? 75
            : selectedType === 'ILHA_DE_CALOR'
            ? 39
            : 8,
      });
      setDescription('');
      setNeighborhoodSearch('');
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

      <FlatList
        data={events}
        keyExtractor={(item, idx) => String(item.id ?? idx)}
        ListHeaderComponent={
          <View>
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
                <Text style={styles.actionBtnText}>⚡ Simular IoT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.reportBtn]}
                onPress={() => setShowForm(!showForm)}
              >
                <Text style={styles.actionBtnText}>
                  {showForm ? '✖ Fechar Relato' : '➕ Adicionar Relato'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.resetBtn]}
                onPress={handleResetEvents}
              >
                <Text style={styles.actionBtnText}>🗑️ Resetar</Text>
              </TouchableOpacity>
            </View>

            {showForm && (
              <View style={styles.formBox}>
                <Text style={styles.formTitle}>Novo Relato Comunitário</Text>

                <Text style={styles.formLabel}>1. Tipo de Risco:</Text>
                <View style={styles.typeSelectorRow}>
                  {(['ALAGAMENTO', 'ILHA_DE_CALOR', 'INTERRUPCAO_SERVICO'] as const).map(
                    (type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeChip,
                          selectedType === type && styles.typeChipSelected,
                        ]}
                        onPress={() => setSelectedType(type)}
                      >
                        <Text style={styles.typeChipText}>
                          {type.replace(/_/g, ' ')}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                <View style={styles.selectedBairroHeader}>
                  <Text style={styles.formLabel}>2. Bairro / Região:</Text>
                  <View style={styles.selectedBairroBadge}>
                    <Text style={styles.selectedBairroBadgeText}>
                      📍 Selecionado: {neighborhood}
                    </Text>
                  </View>
                </View>

                <TextInput
                  style={styles.input}
                  value={neighborhoodSearch}
                  onChangeText={setNeighborhoodSearch}
                  placeholder="🔍 Pesquisar bairro na lista (ex: Ipiranga, Mooca, Lins...)"
                  placeholderTextColor="#94a3b8"
                />

                <View style={styles.bairroListContainer}>
                  {filteredNeighborhoods.length > 0 ? (
                    filteredNeighborhoods.map((item) => {
                      const isSelected = item === neighborhood;
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.bairroOption,
                            isSelected && styles.bairroOptionSelected,
                          ]}
                          onPress={() => {
                            setNeighborhood(item);
                            setNeighborhoodSearch('');
                          }}
                        >
                          <Text
                            style={[
                              styles.bairroOptionText,
                              isSelected && styles.bairroOptionTextSelected,
                            ]}
                          >
                            {isSelected ? `✓ ${item}` : item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={styles.emptySearchText}>
                      Nenhum bairro encontrado para "{neighborhoodSearch}"
                    </Text>
                  )}
                </View>

                <Text style={styles.formLabel}>
                  3. Descrição da Ocorrência (Anônimo - LGPD):
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Descreva a situação observada no local..."
                  placeholderTextColor="#64748b"
                  multiline
                />

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmitReport}
                >
                  <Text style={styles.submitBtnText}>
                    Enviar Alerta em {neighborhood}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.sectionTitle}>
              📋 Eventos Priorizados por IA ({events.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => <RiskCard event={item} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 12,
  },
  alertNotification: {
    backgroundColor: '#7f1d1d',
    borderWidth: 1,
    borderColor: '#f87171',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  alertNotificationTitle: {
    color: '#fecaca',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 4,
  },
  alertNotificationBody: {
    color: '#ffffff',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simBtn: {
    backgroundColor: '#0284c7',
  },
  reportBtn: {
    backgroundColor: '#4f46e5',
  },
  resetBtn: {
    backgroundColor: '#475569',
    flex: 0.65,
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  formBox: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  formTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  formLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#334155',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeChipSelected: {
    backgroundColor: '#2563eb',
  },
  typeChipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  selectedBairroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  selectedBairroBadge: {
    backgroundColor: '#065f46',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  selectedBairroBadgeText: {
    color: '#d1fae5',
    fontSize: 12,
    fontWeight: '700',
  },
  bairroListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  bairroOption: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  bairroOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#60a5fa',
  },
  bairroOptionText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  bairroOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  emptySearchText: {
    color: '#94a3b8',
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
});