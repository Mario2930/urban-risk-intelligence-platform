export interface RiskEvent {
  id?: number;
  riskType: 'ALAGAMENTO' | 'ILHA_DE_CALOR' | 'INTERRUPCAO_SERVICO';
  neighborhood: string;
  description: string;
  sourceType: 'SENSOR' | 'BASE_PUBLICA' | 'COMUNIDADE';
  reporterAnonId?: string;
  readingValue: number;
  confidenceLevel?: number;
  priorityScore?: number;
  priorityLevel?: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  status?: string;
  createdAt?: string;
}

export interface DashboardIndicators {
  totalEvents: number;
  criticalAlerts: number;
  highAlerts: number;
  averageConfidence: number;
  aiEngineStatus: string;
  lastServerUpdate: string;
}