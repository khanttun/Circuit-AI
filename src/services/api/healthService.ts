import { ENDPOINTS } from '@/constants/config';
import type { HealthStatus } from '@/types';
import type { HealthService } from '../types';
import { HEALTH_OPTIONS, type ApiClient } from './apiClient';

export function createHealthService(client: ApiClient): HealthService {
  return {
    async check(): Promise<HealthStatus> {
      const d = await client.get<{ status?: string; model_available?: boolean; model?: string }>(
        ENDPOINTS.health,
        HEALTH_OPTIONS,
      );
      return { backend: true, model: d.model_available ?? d.status === 'ok', modelName: d.model };
    },
  };
}
