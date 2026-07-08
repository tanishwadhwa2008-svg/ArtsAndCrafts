import type { AnalyticsSummary } from '@arts/shared';
import { apiRequest } from '../lib/api.js';

export type { AnalyticsSummary };

export function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return apiRequest<AnalyticsSummary>('/analytics/summary');
}
