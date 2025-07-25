import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { CrawlService } from '../services/crawlService';
import { AnalysisService } from '../services/analysisService';
import { DatabaseService } from '../services/databaseService';
import { Keyword, CrawlTarget, CrawlJob, AnalysisTopic, Category } from '../types';
import { Globe, Database, Brain, Settings, Play, Loader2, CheckCircle, XCircle, Trash2, BarChart3, RefreshCw, Wifi, WifiOff, TrendingUp, Share2, EyeOff } from 'lucide-react';
import { KeywordsByCategory } from './KeywordsByCategory';
import { AnalysisPreview } from './AnalysisPreview';
import { AnalysisHistory } from './AnalysisHistory';
import { KeywordTrendChart } from './KeywordTrendChart';
import { ShareAndCollaboration } from './ShareAndCollaboration';
import { KeywordsTab } from './Dashboard/KeywordsTab';

interface MenuSettings {
  keywords: boolean;
  crawl: boolean;
  analysis: boolean;
  trends: boolean;
  share: boolean;
}

export function Dashboard() {
  const [crawlService] = useState(() => CrawlService.getInstance());
  const [analysisService] = useState(() => AnalysisService.getInstance());
  const [databaseService] = useState(() => DatabaseService.getInstance());
  
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [crawlTargets, setCrawlTargets] = useState<CrawlTarget[]>([]);
  // const [crawlJobs, setCrawlJobs] = useState<CrawlJob[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisTopic[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisTopic | null>(null);
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [storageType, setStorageType] = useState<'googlesheets' | 'supabase'>('supabase');
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // 메뉴 on/off 설정 (설정 메뉴 제외)
  const [menuSettings, setMenuSettings] = useState<MenuSettings>({
    keywords: true,
    crawl: true,
    analysis: true,
    trends: true,
    share: true,
  });
  const [menuLoading, setMenuLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('keywords');
  // 🔽 아래 4개 useState를 최상단으로 이동
  const [newKeyword, setNewKeyword] = useState('');
  const [addingKeyword, setAddingKeyword] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [newCategoryCode, setNewCategoryCode] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryActionLoading, setCategoryActionLoading] = useState(false);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>('');

  // Supabase에서 메뉴 설정 불러오기
  useEffect(() => {
    const fetchMenuSettings = async () => {
      setMenuLoading(true);
      const db = DatabaseService.getInstance();
      const settings = await db.getMenuSettings();
      // 모든 필드가 undefined일 경우 기본값 할당
      const safeSettings: MenuSettings = {
        keywords: settings?.keywords ?? true,
        crawl: settings?.crawl ?? true,
        analysis: settings?.analysis ?? true,
        trends: settings?.trends ?? true,
        share: settings?.share ?? true,
      };
      setMenuSettings(safeSettings);
      setMenuLoading(false);
    };
    fetchMenuSettings();
  }, []);

  // 카테고리 목록 불러오기 useEffect (최상단에 위치)
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoryLoading(true);
      try {
        const db = DatabaseService.getInstance();
        const cats = await db.getCategories();
        setCategories(cats);
      } catch (err) {
        setCategories([]);
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 메뉴 설정 변경 시 Supabase에 저장
  const handleMenuToggle = async (menuKey: keyof MenuSettings) => {
    const newSettings: MenuSettings = {
      ...menuSettings,
      [menuKey]: !menuSettings[menuKey]
    };
    setMenuSettings(newSettings);
    const db = DatabaseService.getInstance();
    await db.saveMenuSettings(newSettings as unknown as Record<string, boolean>);
  };

  useEffect(() => {
    // CrawlService 초기화 (한 번만 실행됨)
    initializeServices();
    
    // 로컬 스토리지에서 메뉴 설정 불러오기
    // const savedSettings = localStorage.getItem('menuSettings');
    // if (savedSettings) {
    //   try {
    //     const parsed = JSON.parse(savedSettings);
    //     setMenuSettings(parsed);
    //   } catch (error) {
    //     console.error('메뉴 설정 로드 실패:', error);
    //   }
    // }
  }, []);

  // 메뉴 설정 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    // localStorage.setItem('menuSettings', JSON.stringify(menuSettings));
    
    // 현재 활성화된 탭이 비활성화되면 다른 탭으로 이동
    if (!menuSettings[activeTab as keyof MenuSettings] && activeTab !== 'settings') {
      const firstActiveTab = (Object.keys(menuSettings) as (keyof MenuSettings)[]).find(key => menuSettings[key]) || 'keywords';
      setActiveTab(firstActiveTab);
    }
  }, [menuSettings, activeTab]);

  const initializeServices = async () => {
    await crawlService.initialize();
    updateData();
    checkDatabaseConnection();
  };

  const checkDatabaseConnection = async () => {
    const connected = await databaseService.testConnection();
    setIsDbConnected(connected);
    
    if (connected) {
      // 실시간 구독 설정 (비활성화)
      // const keywordSubscription = databaseService.subscribeToKeywords((newKeywords) => {
      //   setKeywords(newKeywords);
      //   console.log('newKeywords', newKeywords);
      // });
      // 
      // const analysisSubscription = databaseService.subscribeToAnalysis((newAnalysis) => {
      //   setAnalysisHistory(newAnalysis);
      // });
      
      // DB 연결 후 데이터 한 번 더 로드
      updateData();
      // 컴포넌트 언마운트 시 구독 해제 (비활성화)
      // return () => {
      //   keywordSubscription.unsubscribe();
      //   analysisSubscription.unsubscribe();
      // };
    }
  };

  const updateData = async () => {
    if (isDbConnected) {
      console.log('isDbConnected', isDbConnected);


      // Supabase에서 데이터 로드
      const [dbKeywords, dbAnalysis, dbTargets] = await Promise.all([
      // const [dbKeywords, dbAnalysis, dbTargets, dbJobs] = await Promise.all([
        databaseService.getKeywords(),
        databaseService.getAnalysisHistory(),
        databaseService.getCrawlTargets(),
        // databaseService.getCrawlJobs()
      ]);

      setKeywords(dbKeywords);
      setAnalysisHistory(dbAnalysis);
      setCrawlTargets(dbTargets);
      // setCrawlJobs(dbJobs);
    } else {
      // 로컬 데이터 로드
      // setKeywords(crawlService.getKeywords());
      // setCrawlTargets(crawlService.getCrawlTargets());
      // setCrawlJobs(crawlService.getCrawlJobs());
      // setAnalysisHistory(await analysisService.getAnalysisTopics());
    }
  };

  const handleSyncWithDatabase = async () => {
    setIsSyncing(true);
    try {
      if (isDbConnected) {
        // 로컬 데이터를 Supabase에 동기화
        await Promise.all([
          databaseService.saveKeywords(crawlService.getKeywords()),
          databaseService.saveCrawlTargets(crawlService.getCrawlTargets()),
          // databaseService.saveCrawlJobs(crawlService.getCrawlJobs())
        ]);
        
        // 분석 히스토리 동기화
        const localAnalysis = await analysisService.getAnalysisTopics();
        for (const analysis of localAnalysis) {
          await databaseService.saveAnalysis(analysis);
        }
        
        await updateData();
      }
      
      // 성공 알림
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-[#2973B2] text-white px-4 py-2 rounded-md shadow-lg z-50';
      notification.textContent = '데이터베이스와 동기화되었습니다!';
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error('동기화 실패:', error);
      // 에러 알림
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
      notification.textContent = '동기화에 실패했습니다.';
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCrawl = async (target: CrawlTarget) => {
    try {
      const job = await crawlService.crawlWebsite(target);
      
      if (isDbConnected) {
        // await databaseService.saveCrawlJobs([job]);
        await databaseService.saveCrawlTargets([{ ...target, lastCrawled: new Date() }]);
      }
      
      updateData();
    } catch (error) {
      console.error('크롤링 실패:', error);
    }
  };

  const handleKeywordSelect = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else if (selectedKeywords.length < 2) {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  // 🔧 분석 저장 시 키워드 데이터가 사라지는 문제 해결
  const handleAnalysisGenerated = async (analysis: AnalysisTopic) => {
    try {
      // 1. 분석을 히스토리에 저장
      await analysisService.saveAnalysisToHistory(analysis);
      
      // 2. Supabase에 연결되어 있으면 분석만 저장 (키워드 데이터는 건드리지 않음)
      if (isDbConnected) {
        await databaseService.saveAnalysis(analysis);
        
        // 분석 히스토리만 업데이트 (키워드는 그대로 유지)
        const updatedAnalysisHistory = await databaseService.getAnalysisHistory();
        setAnalysisHistory(updatedAnalysisHistory);
      } else {
        // 로컬 모드에서는 분석 히스토리만 업데이트
        const localAnalysisHistory = await analysisService.getAnalysisTopics();
        setAnalysisHistory(localAnalysisHistory);
      }
      
      // 3. 성공 알림
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-[#2973B2] text-white px-4 py-2 rounded-md shadow-lg z-50';
      notification.textContent = '분석이 저장되었습니다!';
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
      
      console.log('분석 저장 완료 - 키워드 데이터 유지됨');
    } catch (error) {
      console.error('분석 저장 실패:', error);
      
      // 에러 알림
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
      notification.textContent = '분석 저장에 실패했습니다.';
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (confirm('이 분석 결과를 삭제하시겠습니까?')) {
      await analysisService.deleteAnalysis(analysisId);
      
      if (isDbConnected) {
        await databaseService.deleteAnalysis(analysisId);
      }
      
      // 분석 히스토리만 업데이트
      if (isDbConnected) {
        const updatedAnalysisHistory = await databaseService.getAnalysisHistory();
        setAnalysisHistory(updatedAnalysisHistory);
      } else {
        const localAnalysisHistory = await analysisService.getAnalysisTopics();
        setAnalysisHistory(localAnalysisHistory);
      }
      
      if (selectedAnalysis?.id === analysisId) {
        setSelectedAnalysis(null);
      }
    }
  };

  const handleClearAnalysisHistory = async () => {
    if (confirm('모든 분석 히스토리를 삭제하시겠습니까?')) {
      await analysisService.clearAnalysisHistory();
      
      if (isDbConnected) {
        await databaseService.clearAnalysisHistory();
      }
      
      setAnalysisHistory([]);
      setSelectedAnalysis(null);
    }
  };

  const handleAddTarget = async () => {
    if (newTargetUrl.trim()) {
      try {
        const url = new URL(newTargetUrl.trim());
        const result = crawlService.addCrawlTarget(url.hostname, newTargetUrl.trim());
        if (result) {
          if (isDbConnected) {
            await databaseService.saveCrawlTargets(crawlService.getCrawlTargets());
          }
          setNewTargetUrl('');
          updateData();
        } else {
          alert('이미 존재하는 크롤링 대상입니다.');
        }
      } catch (error) {
        alert('유효하지 않은 URL입니다. 올바른 URL을 입력해주세요.');
        console.error('잘못된 URL:', error);
      }
    }
  };

  const handleRemoveTarget = async (targetId: string) => {
    if (confirm('이 크롤링 대상을 삭제하시겠습니까?')) {
      crawlService.removeCrawlTarget(targetId);
      
      if (isDbConnected) {
        await databaseService.saveCrawlTargets(crawlService.getCrawlTargets());
      }
      
      updateData();
    }
  };

  const handleStoreKeywords = async () => {
    try {
      if (storageType === 'supabase' && isDbConnected) {
        await databaseService.saveKeywords(keywords);
        alert('키워드가 Supabase에 성공적으로 저장되었습니다!');
      } else {
        await crawlService.storeKeywords(storageType);
        alert(`키워드가 ${storageType}에 성공적으로 저장되었습니다!`);
      }
    } catch (error) {
      console.error('저장 실패:', error);
    }
  };

  const getStatusIcon = (status: CrawlJob['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusText = (status: CrawlJob['status']) => {
    switch (status) {
      case 'running':
        return '진행중';
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      case 'pending':
        return '대기중';
      default:
        return '알 수 없음';
    }
  };

  const analysisStats = analysisService.getAnalysisStats();

  // 활성화된 탭들만 필터링
  const availableTabs = isDbConnected
    ? [
        ...(menuSettings.keywords ? ['keywords'] : []),
        ...(menuSettings.crawl ? ['crawl'] : []),
        ...(menuSettings.analysis ? ['analysis'] : []),
        ...(menuSettings.trends ? ['trends'] : []),
        ...(menuSettings.share ? ['share'] : []),
        'settings',
      ]
    : ['settings'];

  // DB 연결이 끊기면 무조건 settings 탭으로 이동
  useEffect(() => {
    if (!isDbConnected && activeTab !== 'settings') {
      setActiveTab('settings');
    }
  }, [isDbConnected, activeTab]);

  // 탭 한글화
  const tabLabels: Record<string, string> = {
    keywords: '키워드 분석',
    crawl: '웹 크롤링',
    analysis: '분석 히스토리',
    trends: '트렌드 차트',
    share: '공유 & 협업',
    settings: '설정'
  };

  if (menuLoading || !menuSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Loader2 className="h-10 w-10 text-[#2973B2] animate-spin" />
        <span className="ml-4 text-xl text-[#2973B2] font-bold">로딩 중...</span>
      </div>
    );
  }

  // 키워드 추가 핸들러 수정 (카테고리 선택)
  const handleAddKeyword = async () => {
    if (!newKeyword.trim() || !selectedCategoryCode) return;
    setAddingKeyword(true);
    try {
      const selectedCategory = categories.find(c => c.code === selectedCategoryCode);
      await databaseService.saveKeywords([
        {
          id: '',
          keywords: newKeyword,
          dept1_category: selectedCategory ? selectedCategory.category_nm : '',
          dept2_category: '',
          frequency: 1,
          created_at: new Date(),
          updated_at: new Date(),
        }
      ]);
      setNewKeyword('');
      setSelectedCategoryCode('');
      await updateData();
    } finally {
      setAddingKeyword(false);
    }
  };

  // 카테고리 추가/수정/삭제 핸들러
  const handleAddCategory = async () => {
    if (!newCategoryCode.trim() || !newCategoryName.trim()) return;
    setCategoryActionLoading(true);
    try {
      await databaseService.addCategory({ code: newCategoryCode, category_nm: newCategoryName });
      setNewCategoryCode('');
      setNewCategoryName('');
      await refreshCategories();
    } finally {
      setCategoryActionLoading(false);
    }
  };
  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setNewCategoryCode(cat.code);
    setNewCategoryName(cat.category_nm);
  };
  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryCode.trim() || !newCategoryName.trim()) return;
    setCategoryActionLoading(true);
    try {
      await databaseService.updateCategory({ ...editingCategory, code: newCategoryCode, category_nm: newCategoryName });
      setEditingCategory(null);
      setNewCategoryCode('');
      setNewCategoryName('');
      await refreshCategories();
    } finally {
      setCategoryActionLoading(false);
    }
  };
  const handleDeleteCategory = async (code: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setCategoryActionLoading(true);
    try {
      await databaseService.deleteCategory(code);
      await refreshCategories();
    } finally {
      setCategoryActionLoading(false);
    }
  };
  const refreshCategories = async () => {
    setCategoryLoading(true);
    const cats = await databaseService.getCategories();
    console.log('카테고리 목록:', cats);
    setCategories(cats);
    setCategoryLoading(false);
  };

  // 탭 전환 시 updateData 호출
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    updateData();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2973B2]">키워드 분석 시스템</h1>
          <p className="text-gray-600">웹 콘텐츠에서 키워드를 추출하고 분석하여 인사이트를 생성합니다</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="border-[#2973B2]/30 text-[#2973B2]">
            <Database className="h-3 w-3 mr-1" />
            {keywords.length}개 키워드
          </Badge>
          <Badge variant="outline" className="border-[#2973B2]/30 text-[#2973B2]">
            <BarChart3 className="h-3 w-3 mr-1" />
            {analysisHistory.length}개 분석
          </Badge>
          <Badge variant={isDbConnected ? "default" : "secondary"} className={isDbConnected ? 'bg-[#2973B2] text-white' : 'bg-gray-100 text-gray-700'}>
            {isDbConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isDbConnected ? 'Supabase 연결됨' : '로컬 모드'}
          </Badge>
          {isDbConnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncWithDatabase}
              disabled={isSyncing}
              className="border-[#2973B2]/30 hover:bg-[#2973B2]/10"
            >
              {isSyncing ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              동기화
            </Button>
          )}
          
          {/* 설정 버튼 (항상 접근 가능) */}
          {/* Dialog 관련 코드 완전히 삭제 */}
        </div>
      </div>

      {/* Supabase 연결 상태 알림 - 연결 실패시만 표시 */}
      {!isDbConnected && (
        <Alert className="border-[#2973B2]/30 bg-[#2973B2]/5">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Supabase 데이터베이스에 연결할 수 없습니다. 로컬 모드로 실행 중입니다. 
            데이터는 브라우저 세션에만 저장됩니다.
          </AlertDescription>
        </Alert>
      )}

      {availableTabs.length > 0 ? (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          {/* 
            🎯 메인 메뉴 탭 - border 제거된 깔끔한 스타일
            📍 이 부분이 상단의 주요 메뉴 탭입니다
          */}
          <TabsList 
            className="grid w-full bg-[#2973B2]/10 p-3 h-16 rounded-2xl" 
            style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }}
          >
            {availableTabs.map(tab => {
              const IconComponent = tab === 'keywords' ? Database : tab === 'crawl' ? Globe : tab === 'analysis' ? Brain : tab === 'trends' ? TrendingUp : tab === 'share' ? Share2 : Settings;
              return (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="
                    data-[state=active]:bg-[#2973B2] 
                    data-[state=active]:text-white 
                    data-[state=active]:shadow-lg
                    h-10 px-6 text-base font-medium 
                    rounded-xl transition-all duration-200 
                    hover:bg-[#2973B2]/20 
                    text-[#2973B2] 
                    flex items-center justify-center gap-3
                    border-0 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-[#2973B2]/50
                    focus:ring-offset-0
                  "
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="hidden sm:inline">{tabLabels[tab]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {menuSettings.keywords && (
            <TabsContent value="keywords" className="space-y-6">
              <KeywordsTab
                keywords={keywords}
                selectedKeywords={selectedKeywords}
                onKeywordSelect={handleKeywordSelect}
                onResetSelected={() => setSelectedKeywords([])}
                onAnalysisGenerated={handleAnalysisGenerated}
                keywordsLoading={false} // 필요시 로딩 상태 변수로 교체
              />
            </TabsContent>
          )}

          {menuSettings.crawl && (
            <TabsContent value="crawl" className="space-y-6">
              <Card className="border-[#2973B2]/20">
                <CardHeader>
                  <CardTitle className="text-[#2973B2]">크롤링 대상</CardTitle>
                  <CardDescription>
                    키워드 추출을 위해 크롤링할 웹사이트를 관리합니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 bg-gradient-to-br from-white to-[#2973B2]/5">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="크롤링할 웹사이트 URL을 입력하세요"
                      value={newTargetUrl}
                      onChange={(e) => setNewTargetUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTarget();
                        }
                      }}
                      className="border-[#2973B2]/30"
                    />
                    <Button onClick={handleAddTarget} disabled={!newTargetUrl.trim()} className="bg-[#2973B2] hover:bg-[#2973B2]/90">
                      대상 추가
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {crawlTargets.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">크롤링 대상이 없습니다</p>
                    ) : (
                      crawlTargets.map((target) => (
                        <div key={target.id} className="flex items-center justify-between p-3 border border-[#2973B2]/20 rounded-lg hover:bg-[#2973B2]/5 transition-colors">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{target.domain}</div>
                            <div className="text-sm text-gray-600">{target.url}</div>
                            {target.lastCrawled && (
                              <div className="text-xs text-gray-500">
                                마지막 크롤링: {target.lastCrawled.toLocaleString()}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* <Button 
                              onClick={() => handleCrawl(target)}
                              disabled={crawlJobs.some(job => job.targetUrl === target.url && job.status === 'running')}
                              size="sm"
                              className="bg-[#2973B2] hover:bg-[#2973B2]/90"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              크롤링
                            </Button> */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveTarget(target.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="border-[#2973B2]/20">
                <CardHeader>
                  <CardTitle className="text-[#2973B2]">크롤링 작업</CardTitle>
                  <CardDescription>크롤링 진행 상황과 결과를 모니터링합니다</CardDescription>
                </CardHeader>
                <CardContent className="bg-gradient-to-br from-white to-[#2973B2]/5">
                  <div className="space-y-2">
                    {crawlJobs.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">아직 크롤링 작업이 없습니다</p>
                    ) : (
                      crawlJobs.slice().reverse().map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-3 border border-[#2973B2]/20 rounded-lg hover:bg-[#2973B2]/5 transition-colors">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(job.status)}
                            <div>
                              <div className="font-medium text-gray-800">{job.targetUrl}</div>
                              <div className="text-sm text-gray-600">
                                시작: {job.startedAt.toLocaleString()}
                              </div>
                              {job.status === 'completed' && (
                                <div className="text-sm text-[#2973B2]">
                                  {job.keywordsExtracted}개 키워드 추출 완료
                                </div>
                              )}
                              {job.error && (
                                <div className="text-sm text-red-600">오류: {job.error}</div>
                              )}
                            </div>
                          </div>
                          <Badge variant={job.status === 'completed' ? 'default' : 'secondary'} className={job.status === 'completed' ? 'bg-[#2973B2] text-white' : 'bg-gray-100 text-gray-700'}>
                            {getStatusText(job.status)}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card> */}
            </TabsContent>
          )}

          {menuSettings.analysis && (
            <TabsContent value="analysis" className="space-y-6">
              <AnalysisHistory />
            </TabsContent>
          )}

          {menuSettings.trends && (
            <TabsContent value="trends" className="space-y-6">
              <KeywordTrendChart keywords={keywords} />
            </TabsContent>
          )}

          {menuSettings.share && (
            <TabsContent value="share" className="space-y-6">
              {selectedAnalysis ? (
                <ShareAndCollaboration 
                  analysis={selectedAnalysis} 
                  onSave={handleAnalysisGenerated}
                />
              ) : (
                <Alert className="border-[#2973B2]/30 bg-[#2973B2]/5">
                  <AlertDescription>
                    공유할 분석 결과를 선택하세요. 분석 히스토리 탭에서 분석 결과를 선택하거나 새로운 분석을 생성해주세요.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          )}

          {/* 시스템 설정 탭 추가 */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-[#2973B2]/20">
              <CardHeader>
                <CardTitle className="text-[#2973B2]">메뉴 관리</CardTitle>
                <CardDescription>사용할 메뉴를 선택하여 인터페이스를 커스터마이징하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 bg-gradient-to-br from-white to-[#2973B2]/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border border-[#2973B2]/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className={`h-5 w-5 ${menuSettings.keywords ? 'text-[#2973B2]' : 'text-gray-400'}`} />
                      <div>
                        <Label htmlFor="keywords-toggle" className="font-medium">키워드 분석</Label>
                        <p className="text-sm text-gray-500">키워드 추출 및 분석 기능</p>
                      </div>
                    </div>
                    <Switch
                      id="keywords-toggle"
                      checked={menuSettings.keywords}
                      onCheckedChange={() => handleMenuToggle('keywords')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-[#2973B2]/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className={`h-5 w-5 ${menuSettings.crawl ? 'text-[#2973B2]' : 'text-gray-400'}`} />
                      <div>
                        <Label htmlFor="crawl-toggle" className="font-medium">웹 크롤링</Label>
                        <p className="text-sm text-gray-500">웹사이트 크롤링 관리</p>
                      </div>
                    </div>
                    <Switch
                      id="crawl-toggle"
                      checked={menuSettings.crawl}
                      onCheckedChange={() => handleMenuToggle('crawl')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-[#2973B2]/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Brain className={`h-5 w-5 ${menuSettings.analysis ? 'text-[#2973B2]' : 'text-gray-400'}`} />
                      <div>
                        <Label htmlFor="analysis-toggle" className="font-medium">분석 히스토리</Label>
                        <p className="text-sm text-gray-500">과거 분석 결과 관리</p>
                      </div>
                    </div>
                    <Switch
                      id="analysis-toggle"
                      checked={menuSettings.analysis}
                      onCheckedChange={() => handleMenuToggle('analysis')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-[#2973B2]/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className={`h-5 w-5 ${menuSettings.trends ? 'text-[#2973B2]' : 'text-gray-400'}`} />
                      <div>
                        <Label htmlFor="trends-toggle" className="font-medium">트렌드 차트</Label>
                        <p className="text-sm text-gray-500">키워드 트렌드 시각화</p>
                      </div>
                    </div>
                    <Switch
                      id="trends-toggle"
                      checked={menuSettings.trends}
                      onCheckedChange={() => handleMenuToggle('trends')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-[#2973B2]/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Share2 className={`h-5 w-5 ${menuSettings.share ? 'text-[#2973B2]' : 'text-gray-400'}`} />
                      <div>
                        <Label htmlFor="share-toggle" className="font-medium">공유 & 협업</Label>
                        <p className="text-sm text-gray-500">팀 협업 및 공유 기능</p>
                      </div>
                    </div>
                    <Switch
                      id="share-toggle"
                      checked={menuSettings.share}
                      onCheckedChange={() => handleMenuToggle('share')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-[#2973B2]/20 rounded-lg opacity-50">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-[#2973B2]" />
                      <div>
                        <Label className="font-medium">설정</Label>
                        <p className="text-sm text-gray-500">시스템 설정 관리 (항상 활성화)</p>
                      </div>
                    </div>
                    <Switch checked={true} disabled={true} />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-[#2973B2]/10 border border-[#2973B2]/30 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>활성화된 메뉴:</strong> {Object.values(menuSettings).filter(Boolean).length}/5 (설정 메뉴 제외)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    설정은 우상단 설정 버튼을 통해 항상 접근 가능합니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Supabase 연결 상태 */}
            <Card className="border-[#2973B2]/20">
              <CardHeader>
                <CardTitle className="text-[#2973B2]">Supabase 연결 상태</CardTitle>
                <CardDescription>실시간 데이터베이스 연결 정보</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 bg-gradient-to-br from-white to-[#2973B2]/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isDbConnected ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-[#2973B2]" />
                        <span className="text-[#2973B2] font-medium">Supabase 연결됨</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700 font-medium">Supabase 연결 실패</span>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkDatabaseConnection}
                      className="border-[#2973B2]/30 hover:bg-[#2973B2]/10"
                    >
                      연결 테스트
                    </Button>
                    {isDbConnected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSyncWithDatabase}
                        disabled={isSyncing}
                        className="border-[#2973B2]/30 hover:bg-[#2973B2]/10"
                      >
                        {isSyncing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        수동 동기화
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  {isDbConnected 
                    ? '모든 데이터가 Supabase 데이터베이스에 실시간으로 저장됩니다.'
                    : '현재 로컬 모드로 실행 중입니다. 데이터는 브라우저 세션에만 임시 저장됩니다.'
                  }
                </div>

                {isDbConnected && (
                  <div className="p-3 bg-[#2973B2]/10 border border-[#2973B2]/20 rounded-lg">
                    <p className="text-sm text-[#2973B2] font-medium">✓ 실시간 동기화 활성화</p>
                    <p className="text-xs text-gray-600">변경사항이 자동으로 데이터베이스에 반영됩니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 저장소 설정 */}
            <Card className="border-[#2973B2]/20">
              <CardHeader>
                <CardTitle className="text-[#2973B2]">키워드 및 카테고리 추가 설정</CardTitle>
                <CardDescription>키워드와 카테고리를 추가/수정/삭제할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 bg-gradient-to-br from-white to-[#2973B2]/5">
                {/* 카테고리 관리 UI */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-[#2973B2]">카테고리 관리</span>
                    {categoryLoading && <Loader2 className="h-4 w-4 animate-spin text-[#2973B2]" />}
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="카테고리 코드"
                      value={newCategoryCode}
                      onChange={e => setNewCategoryCode(e.target.value)}
                      className="border border-[#2973B2]/30 rounded px-2 py-1 w-full md:w-1/3"
                      disabled={!!editingCategory}
                    />
                    <input
                      type="text"
                      placeholder="카테고리명"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      className="border border-[#2973B2]/30 rounded px-2 py-1 w-full md:w-1/3"
                    />
                    {editingCategory ? (
                      <Button onClick={handleUpdateCategory} disabled={categoryActionLoading} className="bg-[#2973B2] text-white min-w-[80px]">수정</Button>
                    ) : (
                      <Button onClick={handleAddCategory} disabled={categoryActionLoading} className="bg-[#2973B2] text-white min-w-[80px]">추가</Button>
                    )}
                    {editingCategory && (
                      <Button variant="outline" onClick={() => { setEditingCategory(null); setNewCategoryCode(''); setNewCategoryName(''); }} className="min-w-[60px]">취소</Button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                      <thead>
                        <tr className="bg-[#2973B2]/10">
                          <th className="px-2 py-1 border">코드</th>
                          <th className="px-2 py-1 border">카테고리명</th>
                          <th className="px-2 py-1 border">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(cat => (
                          <tr key={cat.code}>
                            <td className="px-2 py-1 border">{cat.code}</td>
                            <td className="px-2 py-1 border">{cat.category_nm}</td>
                            <td className="px-2 py-1 border space-x-1">
                              <Button size="sm" variant="outline" onClick={() => handleEditCategory(cat)} disabled={categoryActionLoading}>수정</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat.code)} disabled={categoryActionLoading}>삭제</Button>
                            </td>
                          </tr>
                        ))}
                        {categories.length === 0 && (
                          <tr><td colSpan={3} className="text-center text-gray-400 py-2">카테고리가 없습니다</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* 키워드 추가 UI */}
                <div className="flex flex-col md:flex-row gap-2 w-full">
                  <input
                    type="text"
                    placeholder="키워드"
                    value={newKeyword}
                    onChange={e => setNewKeyword(e.target.value)}
                    className="border border-[#2973B2]/30 rounded px-2 py-1 w-full md:w-1/3"
                  />
                  <select
                    value={selectedCategoryCode}
                    onChange={e => setSelectedCategoryCode(e.target.value)}
                    className="border border-[#2973B2]/30 rounded px-2 py-1 w-full md:w-1/3"
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map(cat => (
                      <option key={cat.code} value={cat.code}>{cat.category_nm}</option>
                    ))}
                  </select>
                  <Button
                    onClick={handleAddKeyword}
                    disabled={!newKeyword.trim() || !selectedCategoryCode || addingKeyword}
                    className="bg-[#2973B2] text-white hover:bg-[#2973B2]/90 min-w-[80px]"
                  >
                    {addingKeyword ? '저장 중...' : '키워드 추가'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 시스템 관리 */}
            <Card className="border-[#2973B2]/20">
              <CardHeader>
                <CardTitle className="text-[#2973B2]">시스템 관리</CardTitle>
                <CardDescription>시스템 데이터 관리 및 초기화</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 bg-gradient-to-br from-white to-[#2973B2]/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[#2973B2]/10 border border-[#2973B2]/20 rounded-lg">
                    <div className="text-2xl font-bold text-[#2973B2]">{analysisHistory.length}</div>
                    <div className="text-sm text-[#2973B2]">총 분석 수</div>
                  </div>
                  <div className="text-center p-4 bg-[#2973B2]/10 border border-[#2973B2]/20 rounded-lg">
                    <div className="text-2xl font-bold text-[#2973B2]">
                      {new Set([...analysisHistory.flatMap(a => [a.keyword1, a.keyword2])]).size}
                    </div>
                    <div className="text-sm text-[#2973B2]">고유 키워드</div>
                  </div>
                  <div className="text-center p-4 bg-[#2973B2]/20 border border-[#2973B2]/30 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">{keywords.length}</div>
                    <div className="text-sm text-gray-700">총 키워드</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      crawlService.cleanOldKeywords(30);
                      updateData();
                      alert('30일 이전의 키워드가 정리되었습니다.');
                    }}
                  >
                    30일 이전 키워드 정리
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleClearAnalysisHistory}
                    className="border-[#2973B2]/30 hover:bg-[#2973B2]/10"
                  >
                    분석 기록 지우기
                  </Button>
                  
                  <Button 
                    variant="secondary"
                    onClick={async () => {
                      if (confirm('시스템을 완전히 초기화하시겠습니까? 모든 데이터가 삭제됩니다.')) {
                        crawlService.forceReset();
                        await crawlService.initialize();
                        await analysisService.clearAnalysisHistory();
                        
                        if (isDbConnected) {
                          await databaseService.clearAnalysisHistory();
                        }
                        
                        setSelectedKeywords([]);
                        setSelectedAnalysis(null);
                        await updateData();
                        alert('시스템이 초기화되었습니다.');
                      }
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    시스템 초기화
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Alert className="border-[#2973B2]/30 bg-[#2973B2]/5">
          <Settings className="h-4 w-4" />
          <AlertDescription>
            모든 메뉴가 비활성화되어 있습니다. 우상단의 설정 버튼을 클릭하여 사용할 메뉴를 활성화해주세요.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}