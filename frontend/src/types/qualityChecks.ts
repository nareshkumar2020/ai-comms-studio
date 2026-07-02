export interface DraftQualityCheck {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  helperText?: string;
}
