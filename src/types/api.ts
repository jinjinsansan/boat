// API関連の型定義（競艇版）

export interface UserPoints {
  current_points: number;
  total_earned: number;
  total_spent: number;
  can_create_chat: boolean;
}

export interface PointTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
}

export interface ApiError {
  error: string;
  details?: string;
  status?: number;
}

export interface HealthCheck {
  status: string;
  timestamp?: string;
}
