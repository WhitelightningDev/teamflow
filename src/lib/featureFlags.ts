export const FeatureFlags = {
  DASHBOARD_ALERTS: (import.meta as any).env?.VITE_FEATURE_DASHBOARD_ALERTS !== 'false',
  DASHBOARD_TRENDS: (import.meta as any).env?.VITE_FEATURE_DASHBOARD_TRENDS !== 'false',
  DASHBOARD_DRILLDOWN: (import.meta as any).env?.VITE_FEATURE_DASHBOARD_DRILLDOWN !== 'false',
  DASHBOARD_EXPORT: (import.meta as any).env?.VITE_FEATURE_DASHBOARD_EXPORT !== 'false',
  DASHBOARD_SCORECARDS: (import.meta as any).env?.VITE_FEATURE_DASHBOARD_SCORECARDS !== 'false',
}

