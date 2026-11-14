import { ENDPOINTS } from '@/constants/config';
import type { HealthStatus } from '@/types';
import type { HealthService } from '../types';
import { HEALTH_OPTIONS, type ApiClient } from './apiClient';

export function createHealthService(client: ApiClient): HealthService {
  return {
    async check(): Promise<HealthStatus> {
      const d = await client.get<{ status?: string; provider?: 'cloud' | 'local' | 'automatic'; model?: string; configured?: boolean }>(
        ENDPOINTS.health,
        HEALTH_OPTIONS,
      );
      return { backend: true, model: d.status === 'ok' && d.configured !== false, modelName: d.model, provider: d.provider, configured: d.configured };
    },
  };
}
