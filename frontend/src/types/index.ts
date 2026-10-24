/**
 * types/index.ts
 * Core TypeScript definitions for AETHER Platform.
 */

export type UserRole = 'student' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface StudentProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  student_id_number?: string;
  school: string;
  academic_year: string;
  target_grade: number;
  phone?: string;
  bio?: string;
}

export interface RecommendationItem {
  type: 'warning' | 'info' | 'success';
  title: string;
  detail: string;
}

export interface PredictionRecord {
  id: number;
  predicted_grade: number;
  confidence_low: number;
  confidence_high: number;
  performance_category: string;
  model_name: string;
  recommendations: RecommendationItem[];
  input_features: Record<string, any>;
  created_at: string;
}

export type PredictionResponse = PredictionRecord;

export interface StudentOverviewData {
  student_name: string;
  email: string;
  school: string;
  student_id: string;
  predicted_grade: number | null;
  confidence_low: number | null;
  confidence_high: number | null;
  performance_category: string;
  target_grade: number;
  total_predictions: number;
  recent_predictions: Array<{
    id: number;
    predicted_grade: number;
    created_at: string;
    category: string;
  }>;
  active_goals_count: number;
  completed_goals_count: number;
  strengths: string[];
  improvements: string[];
  latest_recommendations: RecommendationItem[];
}

export interface StudyGoal {
  id: number;
  user_id: number;
  title: string;
  category: string;
  target_hours: number;
  completed: boolean;
  due_date?: string;
  created_at: string;
  completed_at?: string;
}

export interface PredictionInputPayload {
  school: string;
  sex: string;
  age: number;
  address: string;
  famsize: string;
  Pstatus: string;
  Medu: number;
  Fedu: number;
  Mjob: string;
  Fjob: string;
  reason: string;
  guardian: string;
  traveltime: number;
  studytime: number;
  failures: number;
  schoolsup: string;
  famsup: string;
  paid: string;
  activities: string;
  nursery: string;
  higher: string;
  internet: string;
  romantic: string;
  famrel: number;
  freetime: number;
  goout: number;
  Dalc: number;
  Walc: number;
  health: number;
  absences: number;
}

export interface AdminOverviewStats {
  total_students: number;
  total_predictions: number;
  active_students_count: number;
  average_predicted_grade: number;
  champion_model_name: string;
  champion_rmse: number;
  champion_mae: number;
  champion_r2: number;
  dataset_students_count: number;
  dataset_mean_grade: number;
  dataset_pass_rate: number;
  performance_segments: Record<string, number>;
}

export interface AdminStudentItem {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  school: string;
  student_id_number: string;
  target_grade: number;
  prediction_count: number;
  latest_predicted_grade: number | null;
}

export interface ModelBenchmarkItem {
  model_name: string;
  mae: number;
  rmse: number;
  r2: number;
  is_champion: boolean;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface AuditLogItem {
  id: number;
  actor_id?: number;
  actor_email: string;
  action: string;
  resource_type: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
}
