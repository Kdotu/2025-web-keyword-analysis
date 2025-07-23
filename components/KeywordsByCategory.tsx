import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { Keyword } from '../types';

interface KeywordsByCategoryProps {
  keywords: Keyword[];
  selectedKeywords: string[];
  onKeywordSelect: (keyword: string) => void;
  maxVisible?: number;
}

export function KeywordsByCategory({ 
  keywords, 
  selectedKeywords, 
  onKeywordSelect, 
  maxVisible = 8 
}: KeywordsByCategoryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState(0);

  // 카테고리별로 키워드 그룹화
  const keywordsByCategory = keywords.reduce((acc, keyword) => {
    const category = keyword.category || '일반';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(keyword);
    return acc;
  }, {} as Record<string, Keyword[]>);

  // 각 카테고리의 키워드를 빈도순으로 정렬
  Object.keys(keywordsByCategory).forEach(category => {
    keywordsByCategory[category].sort((a, b) => b.frequency - a.frequency);
  });

  const categories = Object.keys(keywordsByCategory);
  const cardsPerPage = 3; // 한 페이지에 3개씩 표시
  const totalPages = Math.ceil(categories.length / cardsPerPage);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // 현재 페이지에 표시할 카테고리들
  const getCurrentPageCategories = () => {
    const startIndex = currentSlide * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    return categories.slice(startIndex, endIndex);
  };

  if (categories.length === 0) {
    return (
      <Card className="border-[#2973B2]/20">
        <CardContent className="flex flex-col items-center justify-center h-32 text-center bg-gradient-to-br from-white to-[#2973B2]/5">
          <Tag className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">키워드가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Kanban 보드 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-[#2973B2]" />
          <h3 className="text-lg font-semibold text-[#2973B2]">키워드 카테고리</h3>
          <Badge variant="outline" className="border-[#2973B2]/30 text-[#2973B2]">
            {categories.length}개 카테고리
          </Badge>
        </div>
        
        {/* 슬라이드 네비게이션 */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={totalPages <= 1}
              className="border-[#2973B2]/30 hover:bg-[#2973B2]/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {currentSlide + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={totalPages <= 1}
              className="border-[#2973B2]/30 hover:bg-[#2973B2]/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 3개씩 그리드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[500px]">
        {getCurrentPageCategories().map((category) => {
          const categoryKeywords = keywordsByCategory[category];
          const isExpanded = expandedCategories[category];
          const visibleKeywords = isExpanded ? categoryKeywords : categoryKeywords.slice(0, maxVisible);
          const hasMore = categoryKeywords.length > maxVisible;

          return (
            <Card key={category} className="border-[#2973B2]/20 h-full flex flex-col">
              <CardHeader className="pb-3 bg-gradient-to-br from-[#2973B2]/5 to-[#2973B2]/10 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-[#2973B2] flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#2973B2]/20 border-2 border-[#2973B2]" />
                    <span className="truncate">{category}</span>
                    <Badge variant="outline" className="bg-[#2973B2]/10 border-[#2973B2]/30 text-[#2973B2] text-xs">
                      {categoryKeywords.length}
                    </Badge>
                  </CardTitle>
                  {hasMore && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategory(category)}
                      className="p-1 h-auto hover:bg-[#2973B2]/10 flex-shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-[#2973B2]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#2973B2]" />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 bg-gradient-to-br from-white to-[#2973B2]/5 flex-1 flex flex-col">
                {/* Kanban 카드들 */}
                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-2">
                    {visibleKeywords.map((keyword) => {
                      const isSelected = selectedKeywords.includes(keyword.text);
                      const isDisabled = selectedKeywords.length >= 2 && !isSelected;
                      
                      return (
                        <div
                          key={keyword.id}
                          onClick={() => !isDisabled && onKeywordSelect(keyword.text)}
                          className={`
                            p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-102
                            ${isSelected 
                              ? 'bg-[#2973B2] text-white border-[#2973B2] shadow-lg scale-105' 
                              : 'bg-white border-[#2973B2]/20 hover:border-[#2973B2]/40 hover:shadow-md'
                            }
                            ${isDisabled ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : ''}
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium text-sm truncate ${isSelected ? 'text-white' : 'text-[#2973B2]'}`} title={keyword.text}>
                              {keyword.text}
                            </span>
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className={isSelected ? 'text-white/80' : 'text-gray-500'}>
                              빈도: {keyword.frequency}
                            </span>
                            <div className={`px-2 py-1 rounded text-xs truncate max-w-[80px] ${
                              isSelected 
                                ? 'bg-white/20 text-white' 
                                : 'bg-[#2973B2]/10 text-[#2973B2]'
                            }`} title={keyword.category || '일반'}>
                              {keyword.category || '일반'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* 더 보기/접기 버튼 */}
                <div className="pt-3 flex-shrink-0">
                  {hasMore && !isExpanded && (
                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategory(category)}
                        className="text-[#2973B2] hover:bg-[#2973B2]/10 w-full"
                      >
                        +{categoryKeywords.length - maxVisible}개 더 보기
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}

                  {hasMore && isExpanded && (
                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategory(category)}
                        className="text-[#2973B2] hover:bg-[#2973B2]/10 w-full"
                      >
                        접기
                        <ChevronUp className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* 빈 공간 채우기 (3개 미만일 때) */}
        {getCurrentPageCategories().length < cardsPerPage && (
          Array.from({ length: cardsPerPage - getCurrentPageCategories().length }).map((_, index) => (
            <div key={`empty-${index}`} className="hidden lg:block" />
          ))
        )}
      </div>

      {/* 슬라이드 인디케이터 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? 'bg-[#2973B2]' : 'bg-[#2973B2]/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* 페이지 정보 */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-gray-500">
          {getCurrentPageCategories().length}개 카테고리 표시 중 (전체 {categories.length}개)
        </div>
      )}
    </div>
  );
}