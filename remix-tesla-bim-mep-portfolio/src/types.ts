export interface Project {
  id: string;
  title: string;
  category: 'Industrial' | 'Comercial' | 'Hospitalario' | 'Infraestructura';
  area: string;
  location: string;
  lod: 'LOD 300' | 'LOD 350' | 'LOD 400';
  clashesPrevented: number;
  savingsEstimated: string;
  imageUrl: string;
  description: string;
  specialties: string[];
}

export interface Specialty {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  imageUrl: string;
  features: string[];
  specs: { label: string; value: string }[];
}

export interface ClashItem {
  id: string;
  spec1: string;
  spec2: string;
  level: string;
  gridRef: string;
  status: 'Resuelto' | 'En revisión' | 'Aprobado';
  distance: string;
  costImpact: string;
}

export interface BoundingBox3D {
  type: 'ELEC' | 'SAN' | 'HVAC' | 'STRUCT' | 'CLASH';
  name: string;
  system: string;
  specs: string;
  status: string;
}
