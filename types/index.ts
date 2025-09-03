export interface UserDetails {
  id: string;
  full_name?: string;
  avatar_url?: string;
  billing_address?: any;
  payment_method?: any;
}

export interface Subscription {
  id: string;
  user_id: string;
  status?: string;
  metadata?: any;
  price_id?: string;
  quantity?: number;
  cancel_at_period_end?: boolean;
  created: string;
  current_period_start: string;
  current_period_end: string;
  ended_at?: string;
  cancel_at?: string;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  prices?: any;
}