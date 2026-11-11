import axios from 'axios';
import { RiskEvent, DashboardIndicators } from '../types/risk';

export const API_BASE_URL = 'http://localhost:8080/api/risks';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
});

export const fetchPrioritizedRisks = async (): Promise<RiskEvent[]> => {
  const response = await api.get<RiskEvent[]>('');
  return response.data;
};

export const fetchDashboardIndicators = async (): Promise<DashboardIndicators> => {
  const response = await api.get<DashboardIndicators>('/dashboard');
  return response.data;
};

export const createCommunityReport = async (
  payload: Omit<RiskEvent, 'id' | 'confidenceLevel' | 'priorityScore' | 'priorityLevel'>
): Promise<RiskEvent> => {
  const response = await api.post<RiskEvent>('', payload);
  return response.data;
};

export const triggerSensorSimulation = async (): Promise<RiskEvent> => {
  const response = await api.post<RiskEvent>('/simulate');
  return response.data;
};