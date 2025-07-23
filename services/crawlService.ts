import { Keyword, CrawlTarget, CrawlJob } from '../types';

export class CrawlService {
  private static instance: CrawlService;
  private keywords: Keyword[] = [];
  private crawlTargets: CrawlTarget[] = [];
  private crawlJobs: CrawlJob[] = [];
  private isInitialized: boolean = false;

  static getInstance(): CrawlService {
    if (!CrawlService.instance) {
      CrawlService.instance = new CrawlService();
    }
    return CrawlService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 로컬 스토리지에서 데이터 로드
      this.loadFromLocalStorage();
      
      // 샘플 데이터 생성 (초기 실행시)
      if (this.keywords.length === 0) {
        this.generateSampleData();
      }
      
      this.isInitialized = true;
      console.log('CrawlService 초기화 완료');
    } catch (error) {
      console.error('CrawlService 초기화 실패:', error);
      this.generateSampleData(); // 에러 시 샘플 데이터로 대체
      this.isInitialized = true;
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const storedKeywords = localStorage.getItem('crawl_keywords');
      const storedTargets = localStorage.getItem('crawl_targets');
      const storedJobs = localStorage.getItem('crawl_jobs');

      if (storedKeywords) {
        this.keywords = JSON.parse(storedKeywords).map((k: any) => ({
          ...k,
          extractedAt: new Date(k.extractedAt)
        }));
      }

      if (storedTargets) {
        this.crawlTargets = JSON.parse(storedTargets).map((t: any) => ({
          ...t,
          lastCrawled: t.lastCrawled ? new Date(t.lastCrawled) : undefined
        }));
      }

      if (storedJobs) {
        this.crawlJobs = JSON.parse(storedJobs).map((j: any) => ({
          ...j,
          startedAt: new Date(j.startedAt),
          completedAt: j.completedAt ? new Date(j.completedAt) : undefined
        }));
      }
    } catch (error) {
      console.error('로컬 스토리지 로드 실패:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('crawl_keywords', JSON.stringify(this.keywords));
      localStorage.setItem('crawl_targets', JSON.stringify(this.crawlTargets));
      localStorage.setItem('crawl_jobs', JSON.stringify(this.crawlJobs));
    } catch (error) {
      console.error('로컬 스토리지 저장 실패:', error);
    }
  }

  private generateSampleData(): void {
    const sampleKeywords: Keyword[] = [
      {
        id: '1',
        text: 'AI',
        frequency: 15,
        category: '기술',
        sourceUrl: 'https://example.com',
        extractedAt: new Date()
      },
      {
        id: '2',
        text: '머신러닝',
        frequency: 12,
        category: '기술',
        sourceUrl: 'https://example.com',
        extractedAt: new Date()
      },
      {
        id: '3',
        text: '비즈니스',
        frequency: 10,
        category: '비즈니스',
        sourceUrl: 'https://example.com',
        extractedAt: new Date()
      },
      {
        id: '4',
        text: '혁신',
        frequency: 8,
        category: '혁신',
        sourceUrl: 'https://example.com',
        extractedAt: new Date()
      },
      {
        id: '5',
        text: '데이터',
        frequency: 14,
        category: '데이터',
        sourceUrl: 'https://example.com',
        extractedAt: new Date()
      },
      {
        id: '6',
        text: '디지털 트랜스포메이션',
        frequency: 7,
        category: '기술',
        sourceUrl: 'https://example.com',
        extractedAt: new Date()
      },
      {
        id: '7',
        text: '클라우드',
        frequency: 11,
        category: '기술',
        sourceUrl: 'https://example.com',
        extractedAt: new Date()
      },
      {
        id: '8',
        text: '마케팅',
        frequency: 9,
        category: '비즈니스',
        sourceUrl: 'https://example.com',
        extractedAt: new Date()
      }
    ];

    const sampleTargets: CrawlTarget[] = [
      {
        id: '1',
        domain: 'example.com',
        url: 'https://example.com',
        lastCrawled: new Date()
      }
    ];

    this.keywords = sampleKeywords;
    this.crawlTargets = sampleTargets;
    this.saveToLocalStorage();
  }

  getKeywords(): Keyword[] {
    return [...this.keywords];
  }

  getCrawlTargets(): CrawlTarget[] {
    return [...this.crawlTargets];
  }

  getCrawlJobs(): CrawlJob[] {
    return [...this.crawlJobs];
  }

  addCrawlTarget(domain: string, url: string): boolean {
    // 중복 확인
    if (this.crawlTargets.some(target => target.url === url)) {
      return false;
    }

    const newTarget: CrawlTarget = {
      id: Date.now().toString(),
      domain,
      url,
      lastCrawled: undefined
    };

    this.crawlTargets.push(newTarget);
    this.saveToLocalStorage();
    return true;
  }

  removeCrawlTarget(id: string): boolean {
    const index = this.crawlTargets.findIndex(target => target.id === id);
    if (index === -1) return false;

    this.crawlTargets.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  async crawlWebsite(target: CrawlTarget): Promise<CrawlJob> {
    const job: CrawlJob = {
      id: Date.now().toString(),
      targetUrl: target.url,
      status: 'running',
      startedAt: new Date(),
      keywordsExtracted: 0
    };

    this.crawlJobs.push(job);
    this.saveToLocalStorage();

    // 크롤링 시뮬레이션
    try {
      await this.simulateCrawling(job, target);
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : '알 수 없는 오류';
      job.completedAt = new Date();
      this.saveToLocalStorage();
    }

    return job;
  }

  private async simulateCrawling(job: CrawlJob, target: CrawlTarget): Promise<void> {
    // 2-5초 대기 (크롤링 시뮬레이션)
    const delay = Math.random() * 3000 + 2000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 새로운 키워드 생성 (시뮬레이션)
    const newKeywords = this.generateRandomKeywords(target.url);
    this.keywords.push(...newKeywords);

    // 작업 완료 처리
    job.status = 'completed';
    job.completedAt = new Date();
    job.keywordsExtracted = newKeywords.length;

    // 타겟 마지막 크롤링 시간 업데이트
    const targetIndex = this.crawlTargets.findIndex(t => t.id === target.id);
    if (targetIndex !== -1) {
      this.crawlTargets[targetIndex].lastCrawled = new Date();
    }

    this.saveToLocalStorage();
  }

  private generateRandomKeywords(sourceUrl: string): Keyword[] {
    const sampleTexts = [
      '블록체인', '사이버보안', '모바일', '웹개발', '데이터베이스',
      '네트워크', '소프트웨어', '하드웨어', '프로그래밍', '알고리즘',
      '사용자 경험', '인터페이스', '프로토타입', '테스트', '배포',
      '성능', '확장성', '안정성', '유지보수', '최적화'
    ];

    const categories = ['기술', '비즈니스', '혁신', '데이터', '디자인'];
    const count = Math.floor(Math.random() * 5) + 3; // 3-7개
    const keywords: Keyword[] = [];

    for (let i = 0; i < count; i++) {
      const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      // 중복 방지
      if (keywords.some(k => k.text === text) || this.keywords.some(k => k.text === text)) {
        continue;
      }

      keywords.push({
        id: `${Date.now()}_${i}`,
        text,
        frequency: Math.floor(Math.random() * 20) + 1,
        category: categories[Math.floor(Math.random() * categories.length)],
        sourceUrl,
        extractedAt: new Date()
      });
    }

    return keywords;
  }

  async storeKeywords(provider: 'googlesheets' | 'supabase'): Promise<void> {
    // 외부 저장소에 키워드 저장 시뮬레이션
    console.log(`${provider}에 ${this.keywords.length}개 키워드 저장 중...`);
    
    // 실제 구현에서는 여기서 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`${provider} 저장 완료`);
  }

  cleanOldKeywords(days: number): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    this.keywords = this.keywords.filter(keyword => 
      keyword.extractedAt > cutoffDate
    );

    this.saveToLocalStorage();
  }

  async syncWithDatabase(): Promise<void> {
    // 데이터베이스 동기화 시뮬레이션
    console.log('데이터베이스와 동기화 중...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('동기화 완료');
  }

  forceReset(): void {
    this.keywords = [];
    this.crawlTargets = [];
    this.crawlJobs = [];
    this.isInitialized = false;
    
    // 로컬 스토리지 정리
    localStorage.removeItem('crawl_keywords');
    localStorage.removeItem('crawl_targets');
    localStorage.removeItem('crawl_jobs');
  }

  getKeywordsByCategory(): Record<string, Keyword[]> {
    return this.keywords.reduce((acc, keyword) => {
      const category = keyword.category || '일반';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(keyword);
      return acc;
    }, {} as Record<string, Keyword[]>);
  }

  searchKeywords(query: string): Keyword[] {
    const lowercaseQuery = query.toLowerCase();
    return this.keywords.filter(keyword =>
      keyword.text.toLowerCase().includes(lowercaseQuery) ||
      keyword.category?.toLowerCase().includes(lowercaseQuery)
    );
  }

  getTopKeywords(limit: number = 10): Keyword[] {
    return [...this.keywords]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }
}