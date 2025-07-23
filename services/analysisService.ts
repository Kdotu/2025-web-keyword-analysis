import { AnalysisTopic, AnalysisStats } from '../types';

export class AnalysisService {
  private static instance: AnalysisService;
  private analysisHistory: AnalysisTopic[] = [];
  private isInitialized: boolean = false;

  static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService();
    }
    return AnalysisService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.loadFromLocalStorage();
      this.isInitialized = true;
      console.log('AnalysisService 초기화 완료');
    } catch (error) {
      console.error('AnalysisService 초기화 실패:', error);
      this.isInitialized = true;
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('analysis_history');
      if (stored) {
        this.analysisHistory = JSON.parse(stored).map((analysis: any) => ({
          ...analysis,
          generatedAt: new Date(analysis.generatedAt)
        }));
      }
    } catch (error) {
      console.error('분석 히스토리 로드 실패:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('analysis_history', JSON.stringify(this.analysisHistory));
    } catch (error) {
      console.error('분석 히스토리 저장 실패:', error);
    }
  }

  async generateAnalysis(keyword1: string, keyword2: string): Promise<AnalysisTopic> {
    // OpenAI API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    const analysis: AnalysisTopic = {
      id: Date.now().toString(),
      keyword1,
      keyword2,
      title: this.generateTitle(keyword1, keyword2),
      description: this.generateDescription(keyword1, keyword2),
      suggestions: this.generateSuggestions(keyword1, keyword2),
      generatedAt: new Date()
    };

    return analysis;
  }

  private generateTitle(keyword1: string, keyword2: string): string {
    const templates = [
      `${keyword1}과 ${keyword2}의 융합: 새로운 비즈니스 기회`,
      `${keyword1} 기반 ${keyword2} 전략 분석`,
      `${keyword1}와 ${keyword2}를 활용한 혁신 방안`,
      `${keyword1} × ${keyword2}: 시너지 효과 극대화`,
      `${keyword1} 중심의 ${keyword2} 트렌드 분석`,
      `${keyword1}와 ${keyword2}의 상호작용과 미래 전망`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateDescription(keyword1: string, keyword2: string): string {
    const descriptions = [
      `${keyword1}과 ${keyword2}는 현재 시장에서 중요한 트렌드로 부상하고 있습니다. 이 두 요소의 결합은 새로운 비즈니스 모델과 혁신적인 솔루션을 창출할 수 있는 잠재력을 가지고 있습니다.`,
      
      `${keyword1} 기술의 발전과 ${keyword2}의 시장 수요 증가는 상호 보완적인 관계를 형성하고 있습니다. 이러한 시너지는 기업들에게 새로운 성장 동력을 제공할 것으로 예상됩니다.`,
      
      `${keyword1} 분야의 전문성과 ${keyword2}의 혁신적 접근법을 결합하면, 경쟁우위를 확보하고 지속가능한 성장을 달성할 수 있는 전략을 수립할 수 있습니다.`,
      
      `${keyword1}와 ${keyword2}의 융합은 사용자 경험을 향상시키고, 운영 효율성을 높이며, 새로운 가치 창출의 기회를 제공합니다. 이는 디지털 트랜스포메이션의 핵심 요소가 될 것입니다.`
    ];

    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateSuggestions(keyword1: string, keyword2: string): string[] {
    const suggestionTemplates = [
      `${keyword1} 기술을 활용한 ${keyword2} 서비스 개발`,
      `${keyword1}와 ${keyword2}를 결합한 새로운 플랫폼 구축`,
      `${keyword1} 전문가와 ${keyword2} 전문가 간의 협업 체계 구성`,
      `${keyword1} 데이터를 활용한 ${keyword2} 최적화 방안`,
      `${keyword1} 기반 ${keyword2} 자동화 시스템 도입`,
      `${keyword1}와 ${keyword2}의 통합 솔루션 개발`,
      `${keyword1} 교육 프로그램에 ${keyword2} 요소 도입`,
      `${keyword1} 성과 측정을 위한 ${keyword2} 지표 개발`,
      `${keyword1} 커뮤니티에서 ${keyword2} 활동 확대`,
      `${keyword1} 인프라에 ${keyword2} 기술 적용`
    ];

    // 랜덤하게 4-6개 제안 선택
    const count = Math.floor(Math.random() * 3) + 4;
    const shuffled = suggestionTemplates.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async saveAnalysisToHistory(analysis: AnalysisTopic): Promise<void> {
    this.analysisHistory.unshift(analysis); // 최신 분석을 맨 앞에 추가
    this.saveToLocalStorage();
  }

  async getAnalysisTopics(): Promise<AnalysisTopic[]> {
    return [...this.analysisHistory];
  }

  async deleteAnalysis(id: string): Promise<boolean> {
    const index = this.analysisHistory.findIndex(analysis => analysis.id === id);
    if (index === -1) return false;

    this.analysisHistory.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  async clearAnalysisHistory(): Promise<void> {
    this.analysisHistory = [];
    this.saveToLocalStorage();
  }

  getAnalysisStats(): AnalysisStats {
    const totalAnalyses = this.analysisHistory.length;
    const allKeywords = this.analysisHistory.flatMap(a => [a.keyword1, a.keyword2]);
    const uniqueKeywords = new Set(allKeywords).size;
    
    const totalSuggestions = this.analysisHistory.reduce(
      (sum, analysis) => sum + analysis.suggestions.length, 
      0
    );
    const averageSuggestionsPerAnalysis = totalAnalyses > 0 
      ? Math.round(totalSuggestions / totalAnalyses * 10) / 10 
      : 0;

    // 가장 빈번한 카테고리 계산 (키워드 기반 추정)
    const categoryKeywords = {
      '기술': ['AI', '머신러닝', '클라우드', '블록체인', '사이버보안'],
      '비즈니스': ['마케팅', '비즈니스', '전략', '관리', '수익'],
      '혁신': ['혁신', '창의', '아이디어', '개발', '연구'],
      '데이터': ['데이터', '분석', '통계', '인사이트', '정보']
    };

    const categoryCount = Object.entries(categoryKeywords).reduce((acc, [category, keywords]) => {
      acc[category] = allKeywords.filter(keyword => 
        keywords.some(catKeyword => 
          keyword.toLowerCase().includes(catKeyword.toLowerCase())
        )
      ).length;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentCategory = Object.entries(categoryCount).reduce(
      (max, [category, count]) => count > max.count ? { category, count } : max,
      { category: '일반', count: 0 }
    ).category;

    return {
      totalAnalyses,
      uniqueKeywords,
      averageSuggestionsPerAnalysis,
      mostFrequentCategory
    };
  }

  searchAnalyses(query: string): AnalysisTopic[] {
    const lowercaseQuery = query.toLowerCase();
    return this.analysisHistory.filter(analysis =>
      analysis.title.toLowerCase().includes(lowercaseQuery) ||
      analysis.description.toLowerCase().includes(lowercaseQuery) ||
      analysis.keyword1.toLowerCase().includes(lowercaseQuery) ||
      analysis.keyword2.toLowerCase().includes(lowercaseQuery) ||
      analysis.suggestions.some(suggestion => 
        suggestion.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  getAnalysesByKeyword(keyword: string): AnalysisTopic[] {
    const lowercaseKeyword = keyword.toLowerCase();
    return this.analysisHistory.filter(analysis =>
      analysis.keyword1.toLowerCase() === lowercaseKeyword ||
      analysis.keyword2.toLowerCase() === lowercaseKeyword
    );
  }

  getRecentAnalyses(limit: number = 5): AnalysisTopic[] {
    return this.analysisHistory.slice(0, limit);
  }

  async syncWithDatabase(): Promise<void> {
    // 데이터베이스 동기화 시뮬레이션
    console.log('분석 데이터 동기화 중...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('분석 데이터 동기화 완료');
  }

  exportAnalyses(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.analysisHistory, null, 2);
    } else {
      // CSV 형태로 변환
      const headers = ['ID', 'Keyword1', 'Keyword2', 'Title', 'Description', 'Suggestions', 'Generated At'];
      const rows = this.analysisHistory.map(analysis => [
        analysis.id,
        analysis.keyword1,
        analysis.keyword2,
        analysis.title,
        analysis.description,
        analysis.suggestions.join('; '),
        analysis.generatedAt.toISOString()
      ]);

      return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }
  }
}