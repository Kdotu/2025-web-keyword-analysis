import { supabase, SupabaseKeyword, SupabaseAnalysis, SupabaseCrawlTarget, SupabaseCrawlJob } from './supabaseClient';
import { Keyword, AnalysisTopic, CrawlTarget, CrawlJob } from '../types';

export class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async testConnection(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('keywords')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Supabase 연결 테스트 실패:', error);
        
        // 테이블이 없으면 생성 시도
        if (error.code === '42P01') {
          await this.createTables();
          return await this.testConnection();
        }
        
        this.isConnected = false;
        return false;
      }
      
      this.isConnected = true;
      console.log('Supabase 연결 성공');
      return true;
    } catch (error) {
      console.error('Supabase 연결 오류:', error);
      this.isConnected = false;
      return false;
    }
  }

  async createTables(): Promise<void> {
    try {
      // Keywords 테이블 생성
      await supabase.rpc('create_keywords_table');
      
      // Analysis 테이블 생성
      await supabase.rpc('create_analysis_table');
      
      // Crawl targets 테이블 생성
      await supabase.rpc('create_crawl_targets_table');
      
      // Crawl jobs 테이블 생성
      await supabase.rpc('create_crawl_jobs_table');
      
      console.log('테이블 생성 완료');
    } catch (error) {
      console.error('테이블 생성 실패:', error);
      
      // SQL 직접 실행으로 테이블 생성
      const tables = [
        `
        CREATE TABLE IF NOT EXISTS keywords (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          text VARCHAR(255) NOT NULL,
          frequency INTEGER DEFAULT 1,
          category VARCHAR(100),
          source_url TEXT,
          extracted_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS analysis (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          keyword1 VARCHAR(255) NOT NULL,
          keyword2 VARCHAR(255) NOT NULL,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          suggestions TEXT[],
          generated_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS crawl_targets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          domain VARCHAR(255) NOT NULL,
          url TEXT NOT NULL UNIQUE,
          last_crawled TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS crawl_jobs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          target_url TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          keywords_extracted INTEGER DEFAULT 0,
          error_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        `
      ];

      for (const sql of tables) {
        try {
          await supabase.rpc('exec_sql', { sql });
        } catch (sqlError) {
          console.error('SQL 실행 실패:', sqlError);
        }
      }
    }
  }

  // Keywords 관련 메서드
  async saveKeywords(keywords: Keyword[]): Promise<boolean> {
    try {
      const supabaseKeywords: Omit<SupabaseKeyword, 'created_at' | 'updated_at'>[] = keywords.map(keyword => ({
        id: keyword.id,
        text: keyword.text,
        frequency: keyword.frequency,
        category: keyword.category,
        source_url: keyword.sourceUrl,
        extracted_at: keyword.extractedAt.toISOString()
      }));

      const { error } = await supabase
        .from('keywords')
        .upsert(supabaseKeywords, { onConflict: 'id' });

      if (error) {
        console.error('키워드 저장 실패:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('키워드 저장 오류:', error);
      return false;
    }
  }

  async getKeywords(): Promise<Keyword[]> {
    try {
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .order('frequency');

      if (error) {
        console.error('키워드 조회 실패:', error);
        return [];
      }

      return data.map(this.mapSupabaseKeywordToKeyword);
    } catch (error) {
      console.error('키워드 조회 오류:', error);
      return [];
    }
  }

  async deleteKeyword(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('keywords')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('키워드 삭제 오류:', error);
      return false;
    }
  }

  // Analysis 관련 메서드
  async saveAnalysis(analysis: AnalysisTopic): Promise<boolean> {
    try {
      const { id, ...rest } = analysis;
      const supabaseAnalysis = {
        keyword1: analysis.keyword1,
        keyword2: analysis.keyword2,
        title: analysis.title,
        description: analysis.description,
        suggestions: analysis.suggestions,
        generated_at: analysis.generatedAt.toISOString()
      };

      const { error } = await supabase
        .from('analysis')
        .insert([supabaseAnalysis]);
      
      if (error) {
        console.error('분석 저장 실패:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('분석 저장 오류:', error);
      return false;
    }
  }

  async getAnalysisHistory(): Promise<AnalysisTopic[]> {
    try {
      const { data, error } = await supabase
        .from('analysis')
        .select('*')
        .order('generated_at');

      if (error) {
        console.error('분석 히스토리 조회 실패:', error);
        return [];
      }

      return data.map(this.mapSupabaseAnalysisToAnalysisTopic);
    } catch (error) {
      console.error('분석 히스토리 조회 오류:', error);
      return [];
    }
  }

  async deleteAnalysis(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('analysis')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('분석 삭제 오류:', error);
      return false;
    }
  }

  async clearAnalysisHistory(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('analysis')
        .delete()
        .neq('id', ''); // 모든 레코드 삭제

      return !error;
    } catch (error) {
      console.error('분석 히스토리 삭제 오류:', error);
      return false;
    }
  }

  // Crawl Targets 관련 메서드
  async saveCrawlTargets(targets: CrawlTarget[]): Promise<boolean> {
    try {
      const supabaseTargets: Omit<SupabaseCrawlTarget, 'created_at' | 'updated_at'>[] = targets.map(target => ({
        id: target.id,
        domain: target.domain,
        url: target.url,
        last_crawled: target.lastCrawled?.toISOString(),
        is_active: true
      }));

      const { error } = await supabase
        .from('crawl_targets')
        .upsert(supabaseTargets, { onConflict: 'id' });

      return !error;
    } catch (error) {
      console.error('크롤링 대상 저장 오류:', error);
      return false;
    }
  }

  async getCrawlTargets(): Promise<CrawlTarget[]> {
    try {
      const { data, error } = await supabase
        .from('crawl_targets')
        .select('*')
        .order('created_at');

      if (error) {
        console.error('크롤링 대상 조회 실패:', error);
        return [];
      }

      // 시뮬레이션 환경에서는 is_active 필터링을 코드에서 처리
      return data.filter((d: any) => d.is_active).map(this.mapSupabaseCrawlTargetToCrawlTarget);
    } catch (error) {
      console.error('크롤링 대상 조회 오류:', error);
      return [];
    }
  }

  // Crawl Jobs 관련 메서드
  async saveCrawlJobs(jobs: CrawlJob[]): Promise<boolean> {
    try {
      const supabaseJobs: Omit<SupabaseCrawlJob, 'created_at' | 'updated_at'>[] = jobs.map(job => ({
        id: job.id,
        target_url: job.targetUrl,
        status: job.status,
        started_at: job.startedAt.toISOString(),
        completed_at: job.completedAt?.toISOString(),
        keywords_extracted: job.keywordsExtracted || 0,
        error_message: job.error
      }));

      const { error } = await supabase
        .from('crawl_jobs')
        .upsert(supabaseJobs, { onConflict: 'id' });

      return !error;
    } catch (error) {
      console.error('크롤링 작업 저장 오류:', error);
      return false;
    }
  }

  async getCrawlJobs(): Promise<CrawlJob[]> {
    try {
      const { data, error } = await supabase
        .from('crawl_jobs')
        .select('*')
        .order('started_at')
        .limit(50);

      if (error) {
        console.error('크롤링 작업 조회 실패:', error);
        return [];
      }

      return data.map(this.mapSupabaseCrawlJobToCrawlJob);
    } catch (error) {
      console.error('크롤링 작업 조회 오류:', error);
      return [];
    }
  }

  // 데이터 변환 메서드들
  private mapSupabaseKeywordToKeyword(supabaseKeyword: SupabaseKeyword): Keyword {
    return {
      id: supabaseKeyword.id,
      text: supabaseKeyword.text,
      frequency: supabaseKeyword.frequency,
      category: supabaseKeyword.category,
      sourceUrl: supabaseKeyword.source_url,
      extractedAt: new Date(supabaseKeyword.extracted_at)
    };
  }

  private mapSupabaseAnalysisToAnalysisTopic(supabaseAnalysis: SupabaseAnalysis): AnalysisTopic {
    return {
      id: supabaseAnalysis.id,
      keyword1: supabaseAnalysis.keyword1,
      keyword2: supabaseAnalysis.keyword2,
      title: supabaseAnalysis.title,
      description: supabaseAnalysis.description,
      suggestions: supabaseAnalysis.suggestions,
      generatedAt: new Date(supabaseAnalysis.generated_at)
    };
  }

  private mapSupabaseCrawlTargetToCrawlTarget(supabaseTarget: SupabaseCrawlTarget): CrawlTarget {
    return {
      id: supabaseTarget.id,
      domain: supabaseTarget.domain,
      url: supabaseTarget.url,
      lastCrawled: supabaseTarget.last_crawled ? new Date(supabaseTarget.last_crawled) : undefined
    };
  }

  private mapSupabaseCrawlJobToCrawlJob(supabaseJob: SupabaseCrawlJob): CrawlJob {
    return {
      id: supabaseJob.id,
      targetUrl: supabaseJob.target_url,
      status: supabaseJob.status as CrawlJob['status'],
      startedAt: new Date(supabaseJob.started_at),
      completedAt: supabaseJob.completed_at ? new Date(supabaseJob.completed_at) : undefined,
      keywordsExtracted: supabaseJob.keywords_extracted,
      error: supabaseJob.error_message
    };
  }

  // 통계 메서드
  async getStats(): Promise<{
    totalKeywords: number;
    totalAnalysis: number;
    totalCrawlTargets: number;
    recentCrawlJobs: number;
  }> {
    try {
      const [keywordsResult, analysisResult, targetsResult, jobsResult] = await Promise.all([
        supabase.from('keywords').select('count(*)', { count: 'exact' }),
        supabase.from('analysis').select('count(*)', { count: 'exact' }),
        supabase.from('crawl_targets').select('count(*)', { count: 'exact' }).eq('is_active', true),
        supabase.from('crawl_jobs').select('count(*)', { count: 'exact' }).gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        totalKeywords: keywordsResult.count || 0,
        totalAnalysis: analysisResult.count || 0,
        totalCrawlTargets: targetsResult.count || 0,
        recentCrawlJobs: jobsResult.count || 0
      };
    } catch (error) {
      console.error('통계 조회 오류:', error);
      return {
        totalKeywords: 0,
        totalAnalysis: 0,
        totalCrawlTargets: 0,
        recentCrawlJobs: 0
      };
    }
  }

  // 실시간 구독 설정
  subscribeToKeywords(callback: (keywords: Keyword[]) => void) {
    return supabase
      .channel('keywords_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'keywords' },
        async () => {
          const keywords = await this.getKeywords();
          callback(keywords);
        }
      )
      .subscribe();
  }

  subscribeToAnalysis(callback: (analysis: AnalysisTopic[]) => void) {
    return supabase
      .channel('analysis_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'analysis' },
        async () => {
          const analysis = await this.getAnalysisHistory();
          callback(analysis);
        }
      )
      .subscribe();
  }

  // 메뉴 설정 저장
  async saveMenuSettings(settings: Record<string, boolean>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('menu_settings')
        .upsert([{ id: 'default', ...settings }]);
      if (error) {
        console.error('메뉴 설정 저장 실패:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('메뉴 설정 저장 오류:', error);
      return false;
    }
  }

  // 메뉴 설정 불러오기
  async getMenuSettings(): Promise<Record<string, boolean> | null> {
    try {
      const { data, error } = await supabase
        .from('menu_settings')
        .select('*')
        .eq('id', 'default')
        .limit(1);
      if (error) {
        console.error('메뉴 설정 조회 실패:', error);
        return null;
      }
      if (data && data.length > 0) {
        const { id, ...settings } = data[0];
        return settings;
      }
      return null;
    } catch (error) {
      console.error('메뉴 설정 조회 오류:', error);
      return null;
    }
  }

  isDbConnected(): boolean {
    return this.isConnected;
  }
}