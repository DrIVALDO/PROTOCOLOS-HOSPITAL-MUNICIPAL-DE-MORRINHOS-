export interface CheckItem {
  html: string;
  urgent: boolean;
}

export interface ConfigDict {
  [key: string]: string;
}

export interface PatientField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'number';
  mask?: 'date' | 'time';
  visible: boolean;
}

export interface ParameterOption {
  score: number;
  label: string;
  badgeColor?: string;
  textColor?: string;
}

export interface SepsisParameter {
  id: string;
  titleKey: string;
  subKey: string;
  howToKey: string;
  attentionKey?: string;
  options: { score: number; labelKey: string; scoreClass: string }[];
}

export type ActiveTabType = 'identidade' | 'pop' | 'ordem' | 'cores' | 's1news' | 's2sofa' | 's3classif' | 's4pacote' | 's5vaso' | 's6atb' | 's7cuid' | 'senha';
