import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { Trash2, Search, Brain, Calendar, FileText, Filter, MoreVertical, Eye, Loader2 } from 'lucide-react';
import { AnalysisTopic } from '../types';
import { DatabaseService } from '../services/databaseService';

export function AnalysisHistory({
  // analysisHistory,
  // onDeleteAnalysis,
  // onClearHistory,
  // onSelectAnalysis
}: any) {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const db = DatabaseService.getInstance();
      const history = await db.getAnalysisHistory();
      setAnalysisHistory(history);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  // 검색 필터링
  const filteredHistory = analysisHistory.filter(analysis =>
    analysis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    analysis.keyword1.toLowerCase().includes(searchQuery.toLowerCase()) ||
    analysis.keyword2.toLowerCase().includes(searchQuery.toLowerCase()) ||
    analysis.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAnalysisClick = (analysis: AnalysisTopic) => {
    setSelectedAnalysis(analysis.id);
    // onSelectAnalysis(analysis); // This prop is removed, so this line is removed
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full">
        <Loader2 className="h-10 w-10 text-[#2973B2] animate-spin mb-2" />
        <span className="text-lg text-[#2973B2] font-bold">로딩 중...</span>
      </div>
    );
  }

  if (analysisHistory.length === 0) {
    return (
      <Card className="border-[#9ACBD0]/20">
        <CardContent className="flex flex-col items-center justify-center h-64 text-center bg-gradient-to-br from-white to-[#F2EFE7]/20">
          <div className="p-4 bg-[#F2EFE7]/60 rounded-full mb-4">
            <Brain className="h-8 w-8 text-[#2973B2]" />
          </div>
          <h3 className="text-lg font-medium text-[#2973B2] mb-2">분석 히스토리가 없습니다</h3>
          <p className="text-sm text-gray-500 mb-4">
            키워드 분석을 시작하면 분석 결과가 여기에 저장됩니다
          </p>
          <div className="text-xs text-gray-400">
            키워드 분석 탭에서 분석을 시작해보세요
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 검색 */}
      <Card className="border-[#9ACBD0]/20">
        <CardHeader className="bg-gradient-to-br from-white to-[#F2EFE7]/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#2973B2] flex items-center gap-2">
                <Brain className="h-5 w-5" />
                분석 히스토리
              </CardTitle>
              <CardDescription>
                과거에 생성된 분석 결과를 관리하고 재사용할 수 있습니다
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-[#9ACBD0]/50 text-[#2973B2]">
                총 {analysisHistory.length}개
              </Badge>
              <Button
                variant="outline"
                size="sm"
                // onClick={onClearHistory} // This prop is removed, so this line is removed
                disabled={analysisHistory.length === 0}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                전체 삭제
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="bg-gradient-to-br from-white to-[#F2EFE7]/20">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="제목, 키워드, 설명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#9ACBD0]/30"
              />
            </div>
            <Button variant="outline" size="sm" className="border-[#9ACBD0]/50 hover:bg-[#F2EFE7]/50">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 검색 결과 */}
      {searchQuery && (
        <Alert className="border-[#9ACBD0]/30 bg-[#F2EFE7]/50">
          <Search className="h-4 w-4" />
          <AlertDescription>
            "{searchQuery}"에 대한 검색 결과: {filteredHistory.length}개
          </AlertDescription>
        </Alert>
      )}

      {/* 분석 결과 목록 */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card className="border-[#9ACBD0]/20">
            <CardContent className="flex flex-col items-center justify-center h-32 text-center bg-gradient-to-br from-white to-[#F2EFE7]/20">
              <Search className="h-6 w-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">검색 결과가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((analysis) => (
            <Card 
              key={analysis.id} 
              className={`border-[#9ACBD0]/20 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedAnalysis === analysis.id ? 'ring-2 ring-[#2973B2] border-[#2973B2]' : ''
              }`}
              onClick={() => handleAnalysisClick(analysis)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-[#2973B2]/10 text-[#2973B2] text-xs">
                        {analysis.keyword1}
                      </Badge>
                      <span className="text-[#48A6A7]">+</span>
                      <Badge variant="secondary" className="bg-[#2973B2]/10 text-[#2973B2] text-xs">
                        {analysis.keyword2}
                      </Badge>
                    </div>
                    <CardTitle className="text-base text-[#2973B2] leading-tight">
                      {analysis.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(analysis.generatedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {analysis.suggestions.length}개 제안
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalysisClick(analysis);
                      }}
                      className="p-1 h-auto text-[#48A6A7] hover:bg-[#48A6A7]/10"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // onDeleteAnalysis(analysis.id); // This prop is removed, so this line is removed
                      }}
                      className="p-1 h-auto text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 bg-gradient-to-br from-white to-[#F2EFE7]/20">
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                  {analysis.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-[#2973B2] mb-1">주요 제안사항:</div>
                  <div className="grid grid-cols-1 gap-1">
                    {analysis.suggestions.slice(0, 2).map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-[#48A6A7] rounded-full mt-2 flex-shrink-0" />
                        <span className="text-xs text-gray-600 line-clamp-1">{suggestion}</span>
                      </div>
                    ))}
                    {analysis.suggestions.length > 2 && (
                      <div className="text-xs text-[#48A6A7] italic pl-3">
                        +{analysis.suggestions.length - 2}개 추가
                      </div>
                    )}
                  </div>
                </div>

                {selectedAnalysis === analysis.id && (
                  <div className="mt-3 pt-3 border-t border-[#9ACBD0]/20">
                    <div className="flex items-center gap-2 text-xs text-[#48A6A7]">
                      <Eye className="h-3 w-3" />
                      <span>이 분석이 공유 탭에서 활성화되었습니다</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 통계 정보 */}
      {analysisHistory.length > 0 && (
        <Card className="border-[#9ACBD0]/20">
          <CardContent className="bg-gradient-to-br from-white to-[#F2EFE7]/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#2973B2]">{analysisHistory.length}</div>
                <div className="text-sm text-gray-600">총 분석 수</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#48A6A7]">
                  {new Set([...analysisHistory.flatMap(a => [a.keyword1, a.keyword2])]).size}
                </div>
                <div className="text-sm text-gray-600">고유 키워드</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#9ACBD0]">
                  {Math.round(analysisHistory.reduce((sum, a) => sum + a.suggestions.length, 0) / analysisHistory.length * 10) / 10}
                </div>
                <div className="text-sm text-gray-600">평균 제안 수</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-700">
                  {analysisHistory.filter(a => 
                    new Date(a.generatedAt).toDateString() === new Date().toDateString()
                  ).length}
                </div>
                <div className="text-sm text-gray-600">오늘 분석</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}