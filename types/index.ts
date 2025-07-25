// 키워드 관련 타입
export interface Keyword {
  id: string;
  keywords: string; // 기존 text → keywords
  dept1_category?: string;
  dept2_category?: string;
  source_url?: string;
  frequency: number;
  created_at?: Date;
  updated_at?: Date;
}

// 크롤링 대상 타입
export interface CrawlTarget {
  id: string;
  domain: string;
  url: string;
  lastCrawled?: Date;
}

// 크롤링 작업 타입
export interface CrawlJob {
  id: string;
  targetUrl: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  keywordsExtracted?: number;
  error?: string;
}

// 분석 주제 타입
export interface AnalysisTopic {
  id: string;
  keyword1: string;
  keyword2: string;
  title: string;
  description: string;
  suggestions: string[];
  generatedAt: Date;
}

// 설정 관련 타입
export interface SystemSettings {
  maxKeywordsPerSite: number;
  crawlDelay: number;
  enableAutoAnalysis: boolean;
  storageProvider: 'local' | 'supabase' | 'googlesheets';
}

// 분석 통계 타입
export interface AnalysisStats {
  totalAnalyses: number;
  uniqueKeywords: number;
  averageSuggestionsPerAnalysis: number;
  mostFrequentCategory: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션 타입
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 검색 필터 타입
export interface SearchFilter {
  query?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'frequency' | 'date' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}

// 차트 데이터 타입
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

// 내보내기 옵션 타입
export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  includeAnalysis: boolean;
  includeKeywords: boolean;
  includeTrends: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// 카테고리 타입
export interface Category {
  code: string;
  category_nm: string;
  created_at?: Date;
  updated_at?: Date;
}