import { useEffect } from 'react';
import { installGlobalErrorReporting } from '@/services/monitoring/reporting';

export function MonitoringBridge() {
  useEffect(() => installGlobalErrorReporting(), []);
  return null;
}
