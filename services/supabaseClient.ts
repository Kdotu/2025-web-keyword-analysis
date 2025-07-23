import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase 클라이언트 설정
// 실제 프로덕션에서는 @supabase/supabase-js 패키지가 필요합니다
// 현재는 시뮬레이션 버전으로 구현

export interface SupabaseClient {
  from: (table: string) => SupabaseQueryBuilder;
  channel: (name: string) => SupabaseChannel;
  rpc: (fn: string, params?: any) => Promise<{ data: any; error: any }>;
}

export interface SupabaseQueryBuilder {
  select: (columns?: string) => SupabaseQueryBuilder;
  insert: (data: any) => SupabaseQueryBuilder;
  upsert: (data: any, options?: any) => SupabaseQueryBuilder;
  update: (data: any) => SupabaseQueryBuilder;
  delete: () => SupabaseQueryBuilder;
  eq: (column: string, value: any) => SupabaseQueryBuilder;
  neq: (column: string, value: any) => SupabaseQueryBuilder;
  gte: (column: string, value: any) => SupabaseQueryBuilder;
  order: (column: string, options?: any) => SupabaseQueryBuilder;
  limit: (count: number) => SupabaseQueryBuilder;
  then: (callback: (result: { data: any; error: any; count?: number }) => void) => Promise<any>;
}

export interface SupabaseChannel {
  on: (event: string, options: any, callback: (payload: any) => void) => SupabaseChannel;
  subscribe: () => SupabaseRealtimeSubscription;
}

export interface SupabaseRealtimeSubscription {
  unsubscribe: () => void;
}

// 타입 정의만 남김
export interface SupabaseKeyword {
  id: string;
  text: string;
  frequency: number;
  category?: string;
  source_url?: string;
  extracted_at: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseAnalysis {
  id: string;
  keyword1: string;
  keyword2: string;
  title: string;
  description: string;
  suggestions: string[];
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCrawlTarget {
  id: string;
  domain: string;
  url: string;
  last_crawled?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCrawlJob {
  id: string;
  target_url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  keywords_extracted: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}