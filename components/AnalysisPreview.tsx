import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Brain, BookOpen, TrendingUp, Lightbulb } from 'lucide-react';
import { AnalysisService } from '../services/analysisService';
import { AnalysisTopic } from '../types';

interface AnalysisPreviewProps {
  selectedKeywords: string[];
  onAnalysisGenerated: (analysis: AnalysisTopic) => void;
}

export function AnalysisPreview({ selectedKeywords, onAnalysisGenerated }: AnalysisPreviewProps) {
  const [analysisService] = useState(() => AnalysisService.getInstance());
  const [previewAnalysis, setPreviewAnalysis] = useState<AnalysisTopic | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (selectedKeywords.length === 2) {
      generatePreview();
    } else {
      setPreviewAnalysis(null);
    }
  }, [selectedKeywords]);

  const generatePreview = async () => {
    if (selectedKeywords.length !== 2) return;

    setIsGenerating(true);
    try {
      // 올바른 메서드명 사용: generateAnalysis
      const analysis = await analysisService.generateAnalysis(
        selectedKeywords[0],
        selectedKeywords[1]
      );
      setPreviewAnalysis(analysis);
    } catch (error) {
      console.error('미리보기 생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAnalysis = () => {
    if (previewAnalysis) {
      onAnalysisGenerated(previewAnalysis);
    }
  };

  if (selectedKeywords.length < 2) {
    return (
      <Card className="h-full border-2 border-[#2973B2]/20 rounded-2xl overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center bg-gradient-to-br from-white to-[#2973B2]/5 p-6">
          <div className="p-4 bg-[#2973B2]/10 rounded-full mb-4">
            <Brain className="h-8 w-8 text-[#2973B2]" />
          </div>
          <h3 className="text-lg font-medium text-[#2973B2] mb-2">분석 미리보기</h3>
          <p className="text-sm text-gray-500 mb-4">
            두 개의 키워드를 선택하면<br />
            AI 분석 결과를 미리 볼 수 있습니다
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-6 h-6 border-2 border-dashed border-[#2973B2]/40 rounded flex items-center justify-center">1</div>
            <span>키워드 선택</span>
            <div className="w-6 h-6 border-2 border-dashed border-[#2973B2]/40 rounded flex items-center justify-center">2</div>
            <span>키워드 선택</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <Card className="h-full border-2 border-[#2973B2]/20 rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-4 bg-gradient-to-br from-white to-[#2973B2]/5">
          <div className="mx-auto p-3 bg-[#2973B2]/10 rounded-full mb-3">
            <Loader2 className="h-6 w-6 text-[#2973B2] animate-spin" />
          </div>
          <CardTitle className="text-lg text-[#2973B2]">분석 생성 중</CardTitle>
          <CardDescription className="text-sm">
            AI가 키워드 조합을 분석하고 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-white to-[#2973B2]/5">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="bg-[#2973B2]/10 border-[#2973B2]/30 text-[#2973B2]">
                {selectedKeywords[0]}
              </Badge>
              <span className="text-[#2973B2]">+</span>
              <Badge variant="outline" className="bg-[#2973B2]/10 border-[#2973B2]/30 text-[#2973B2]">
                {selectedKeywords[1]}
              </Badge>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 bg-[#2973B2]/10 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!previewAnalysis) {
    return null;
  }

  return (
    <Card className="h-full border-2 border-[#2973B2]/20 rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-br from-white to-[#2973B2]/5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#2973B2]/10 rounded">
              <Lightbulb className="h-4 w-4 text-[#2973B2]" />
            </div>
            <Badge variant="outline" className="text-xs border-[#2973B2]/30 text-[#2973B2]">AI 분석</Badge>
          </div>
          <Button 
            onClick={handleSaveAnalysis} 
            size="sm" 
            className="ml-2 bg-[#2973B2] hover:bg-[#2973B2]/90"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            저장
          </Button>
        </div>
        
        <CardTitle className="text-lg leading-tight text-[#2973B2]">
          {previewAnalysis.title}
        </CardTitle>
        
        {/* Fix: Use span instead of div to avoid p > div nesting issue */}
        <CardDescription className="mt-2">
          <span className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-[#2973B2]/10 text-[#2973B2] text-xs">
              {previewAnalysis.keyword1}
            </Badge>
            <span className="text-[#2973B2]">+</span>
            <Badge variant="secondary" className="bg-[#2973B2]/10 text-[#2973B2] text-xs">
              {previewAnalysis.keyword2}
            </Badge>
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 bg-gradient-to-br from-white to-[#2973B2]/5">
        {/* 분석 개요 */}
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center text-[#2973B2]">
            <TrendingUp className="h-3 w-3 mr-1" />
            분석 개요
          </h4>
          <ScrollArea className="h-20">
            <p className="text-sm text-gray-600 leading-relaxed">
              {previewAnalysis.description}
            </p>
          </ScrollArea>
        </div>
        
        {/* 주요 포인트 */}
        <div>
          <h4 className="font-medium text-sm mb-3 text-[#2973B2]">
            주요 분석 포인트
          </h4>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {previewAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#2973B2] rounded-full mt-2 flex-shrink-0" />
                  <span className="text-xs text-gray-600 leading-relaxed">{suggestion}</span>
                </div>
              ))}
              {previewAnalysis.suggestions.length > 3 && (
                <div className="text-xs text-[#2973B2] italic pl-3">
                  +{previewAnalysis.suggestions.length - 3}개 추가 포인트
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* 생성 시간 */}
        <div className="pt-2 border-t border-[#2973B2]/20">
          <div className="text-xs text-gray-500">
            생성: {previewAnalysis.generatedAt.toLocaleTimeString('ko-KR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}