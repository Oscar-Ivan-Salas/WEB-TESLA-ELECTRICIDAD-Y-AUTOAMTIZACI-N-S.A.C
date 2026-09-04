export type BuildingType = 'residencial' | 'comercial' | 'industrial';

export type MetricIconName = 'Home' | 'Building2' | 'Factory';

export interface BuildingMetric {
  id: BuildingType;
  name: string;
  clashFactor: number;
  costPerClash: number;
  icon: MetricIconName;
}

export const BIM_METRICS: Record<BuildingType, BuildingMetric> = {
  residencial: {
    id: 'residencial',
    name: 'Residencial / Multifamiliar',
    clashFactor: 0.08,
    costPerClash: 1300,
    icon: 'Home',
  },
  comercial: {
    id: 'comercial',
    name: 'Comercial / Saunas / Locales',
    clashFactor: 0.15,
    costPerClash: 2000,
    icon: 'Building2',
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial / Producción',
    clashFactor: 0.22,
    costPerClash: 3000,
    icon: 'Factory',
  },
};

export const METRIC_ORDER: BuildingType[] = ['residencial', 'comercial', 'industrial'];
