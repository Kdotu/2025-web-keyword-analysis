import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RefreshCw, Database } from 'lucide-react';
import { KeywordsByCategory } from '../KeywordsByCategory';
import { AnalysisPreview } from '../AnalysisPreview';
import { Alert, AlertDescription } from '../ui/alert';

export function KeywordsTab({ keywords, selectedKeywords, onKeywordSelect, onResetSelected, onAnalysisGenerated, keywordsLoading }) {
  if (keywordsLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="ml-3 text-[#2973B2] font-medium">키워드 로딩 중...</span>
      </div>
    );
  }
  if (keywords.length === 0) {
    return (
      <Alert className="border-[#2973B2]/30 bg-[#2973B2]/5">
        <AlertDescription>
          아직 추출된 키워드가 없습니다. 웹 크롤링 탭에서 웹사이트 크롤링을 시작하세요.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 키워드 선택 영역 (2/3 너비) */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="border-[#2973B2]/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-[#2973B2]">
                  <Database className="h-5 w-5" />
                  키워드 선택
                </CardTitle>
                <CardDescription>
                  카테고리별로 정리된 키워드 중 두 개를 선택하여 분석을 시작하세요
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onResetSelected}
                disabled={selectedKeywords.length === 0}
                className="border-[#2973B2]/30 hover:bg-[#2973B2]/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                초기화
              </Button>
            </div>
          </CardHeader>
          <CardContent className="bg-gradient-to-br from-white to-[#2973B2]/5">
            {/* 선택된 키워드 표시 + 설명 */}
            <div className="mb-6 p-4 bg-[#2973B2]/10 border border-[#2973B2]/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#2973B2]">선택된 키워드</span>
                <span className="text-xs text-gray-500">{selectedKeywords.length}/2</span>
              </div>
              <div className="flex items-center gap-2 min-h-[32px] mb-3">
                {selectedKeywords.length === 0 ? (
                  <span className="text-sm text-gray-400">키워드를 선택해주세요</span>
                ) : (
                  <>
                    {selectedKeywords.map((keyword, index) => (
                      <React.Fragment key={keyword}>
                        <Badge variant="default" className="px-3 py-1 bg-[#2973B2] text-white">
                          {keyword}
                        </Badge>
                        {index === 0 && selectedKeywords.length === 2 && (
                          <span className="text-[#2973B2] text-lg">+</span>
                        )}
                      </React.Fragment>
                    ))}
                    {selectedKeywords.length === 1 && (
                      <div className="border-2 border-dashed border-[#2973B2]/50 rounded px-3 py-1">
                        <span className="text-sm text-gray-400">두 번째 키워드</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* 키워드 선택 안내 */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-[#2973B2] rounded-full" />
                <span>
                  아래 키워드 카드를 클릭하여 선택하세요. 최대 2개까지 선택 가능합니다.
                </span>
              </div>
              {selectedKeywords.length === 2 && (
                <div className="mt-2 text-xs text-[#2973B2] font-medium">
                  ✓ 키워드 선택 완료! 우측에서 AI 분석 결과를 확인하세요.
                </div>
              )}
            </div>
            {/* Kanban 보드 스타일 키워드 캐러셀 */}
            <KeywordsByCategory
              keywords={keywords}
              selectedKeywords={selectedKeywords}
              onKeywordSelect={onKeywordSelect}
              maxVisible={5}
            />
          </CardContent>
        </Card>
      </div>
      {/* 분석 미리보기 영역 (1/3 너비) */}
      <div className="lg:col-span-1">
        <AnalysisPreview
          selectedKeywords={selectedKeywords}
          onAnalysisGenerated={onAnalysisGenerated}
        />
      </div>
    </div>
  );
} 