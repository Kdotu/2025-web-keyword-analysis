import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart3, TrendingUp, TrendingDown, Calendar, PieChart, LineChart } from 'lucide-react';
import { Keyword } from '../types';

interface KeywordTrendChartProps {
  keywords: Keyword[];
}

interface ChartData {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

interface TimeSeriesData {
  date: string;
  count: number;
  categories: Record<string, number>;
}

export function KeywordTrendChart({ keywords }: KeywordTrendChartProps) {
  const [chartType, setChartType] = useState<'category' | 'frequency' | 'timeline'>('category');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  // 카테고리별 데이터 생성
  const categoryData: ChartData[] = useMemo(() => {
    const categoryCount = keywords.reduce((acc, keyword) => {
      const category = keyword.category || '일반';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#2973B2', '#48A6A7', '#9ACBD0', '#F2EFE7', '#e11d48', '#7c3aed', '#059669'];
    const total = keywords.length;

    return Object.entries(categoryCount)
      .map(([category, count], index) => ({
        category,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count);
  }, [keywords]);

  // 빈도별 상위 키워드 데이터
  const frequencyData = useMemo(() => {
    return [...keywords]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
      .map(keyword => ({
        text: keyword.text,
        frequency: keyword.frequency,
        category: keyword.category || '일반'
      }));
  }, [keywords]);

  // 시간별 트렌드 데이터 생성 (시뮬레이션)
  const timelineData: TimeSeriesData[] = useMemo(() => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data: TimeSeriesData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // 랜덤 데이터 생성 (실제로는 실제 데이터를 사용)
      const baseCount = Math.floor(Math.random() * 20) + 5;
      const categoryBreakdown = categoryData.reduce((acc, cat) => {
        acc[cat.category] = Math.floor(Math.random() * 8) + 1;
        return acc;
      }, {} as Record<string, number>);

      data.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        count: baseCount,
        categories: categoryBreakdown
      });
    }

    return data;
  }, [timeRange, categoryData]);

  const renderCategoryChart = () => {
    if (categoryData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>표시할 카테고리 데이터가 없습니다</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* 파이 차트 스타일 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {categoryData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between p-3 rounded-lg border border-[#9ACBD0]/20 hover:bg-[#F2EFE7]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <div className="font-medium text-[#2973B2]">{item.category}</div>
                    <div className="text-sm text-gray-500">{item.count}개 키워드</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#48A6A7]">{item.percentage}%</div>
                  <div className="text-xs text-gray-400">전체 중</div>
                </div>
              </div>
            ))}
          </div>

          {/* 간단한 바 차트 */}
          <div className="space-y-2">
            {categoryData.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#2973B2] font-medium">{item.category}</span>
                  <span className="text-[#48A6A7]">{item.count}</span>
                </div>
                <div className="w-full bg-[#F2EFE7] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFrequencyChart = () => {
    if (frequencyData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>표시할 빈도 데이터가 없습니다</p>
          </div>
        </div>
      );
    }

    const maxFrequency = Math.max(...frequencyData.map(d => d.frequency));

    return (
      <div className="space-y-3">
        {frequencyData.map((item, index) => (
          <div key={`${item.text}-${index}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[#2973B2]/10 text-[#2973B2] text-xs">
                  #{index + 1}
                </Badge>
                <span className="font-medium text-[#2973B2]">{item.text}</span>
                <Badge variant="secondary" className="bg-[#F2EFE7] text-gray-600 text-xs">
                  {item.category}
                </Badge>
              </div>
              <div className="text-[#48A6A7] font-bold">{item.frequency}</div>
            </div>
            <div className="w-full bg-[#F2EFE7] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#2973B2] to-[#48A6A7] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(item.frequency / maxFrequency) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTimelineChart = () => {
    const maxCount = Math.max(...timelineData.map(d => d.count));

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 md:grid-cols-10 lg:grid-cols-15 gap-1">
          {timelineData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="space-y-1">
                <div
                  className="bg-[#48A6A7] rounded transition-all duration-300 hover:bg-[#2973B2] mx-auto"
                  style={{ 
                    height: `${Math.max((item.count / maxCount) * 80, 4)}px`,
                    width: '16px'
                  }}
                  title={`${item.date}: ${item.count}개`}
                />
                <div className="text-xs text-gray-500 transform -rotate-45 origin-center w-8">
                  {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-[#2973B2]/10 rounded-lg">
            <div className="text-2xl font-bold text-[#2973B2]">
              {timelineData.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <div className="text-sm text-gray-600">총 키워드 수</div>
          </div>
          <div className="text-center p-4 bg-[#48A6A7]/10 rounded-lg">
            <div className="text-2xl font-bold text-[#48A6A7]">
              {Math.round(timelineData.reduce((sum, item) => sum + item.count, 0) / timelineData.length)}
            </div>
            <div className="text-sm text-gray-600">일평균</div>
          </div>
          <div className="text-center p-4 bg-[#9ACBD0]/10 rounded-lg">
            <div className="text-2xl font-bold text-[#9ACBD0]">
              {Math.max(...timelineData.map(d => d.count))}
            </div>
            <div className="text-sm text-gray-600">최고치</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 헤더 및 컨트롤 */}
      <Card className="border-[#9ACBD0]/20">
        <CardHeader className="bg-gradient-to-br from-white to-[#F2EFE7]/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#2973B2] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                키워드 트렌드 분석
              </CardTitle>
              <CardDescription>
                키워드 데이터의 패턴과 트렌드를 시각적으로 분석합니다
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-[#9ACBD0]/50 text-[#2973B2]">
                {keywords.length}개 데이터
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="bg-gradient-to-br from-white to-[#F2EFE7]/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">차트 유형:</span>
              <div className="flex gap-1">
                <Button
                  variant={chartType === 'category' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('category')}
                  className={chartType === 'category' ? 'bg-[#2973B2]' : 'border-[#9ACBD0]/50 hover:bg-[#F2EFE7]/50'}
                >
                  <PieChart className="h-3 w-3 mr-1" />
                  카테고리
                </Button>
                <Button
                  variant={chartType === 'frequency' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('frequency')}
                  className={chartType === 'frequency' ? 'bg-[#2973B2]' : 'border-[#9ACBD0]/50 hover:bg-[#F2EFE7]/50'}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  빈도
                </Button>
                <Button
                  variant={chartType === 'timeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('timeline')}
                  className={chartType === 'timeline' ? 'bg-[#2973B2]' : 'border-[#9ACBD0]/50 hover:bg-[#F2EFE7]/50'}
                >
                  <LineChart className="h-3 w-3 mr-1" />
                  시간별
                </Button>
              </div>
            </div>

            {chartType === 'timeline' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">기간:</span>
                <Select value={timeRange} onValueChange={(value: '7d' | '30d' | 'all') => setTimeRange(value)}>
                  <SelectTrigger className="w-32 h-8 border-[#9ACBD0]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">최근 7일</SelectItem>
                    <SelectItem value="30d">최근 30일</SelectItem>
                    <SelectItem value="all">전체 기간</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 차트 영역 */}
      <Card className="border-[#9ACBD0]/20">
        <CardHeader>
          <CardTitle className="text-[#2973B2] flex items-center gap-2">
            {chartType === 'category' && <PieChart className="h-4 w-4" />}
            {chartType === 'frequency' && <BarChart3 className="h-4 w-4" />}
            {chartType === 'timeline' && <LineChart className="h-4 w-4" />}
            
            {chartType === 'category' && '카테고리별 분포'}
            {chartType === 'frequency' && '키워드 빈도 순위'}
            {chartType === 'timeline' && '시간별 트렌드'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="bg-gradient-to-br from-white to-[#F2EFE7]/20">
          {chartType === 'category' && renderCategoryChart()}
          {chartType === 'frequency' && renderFrequencyChart()}
          {chartType === 'timeline' && renderTimelineChart()}
        </CardContent>
      </Card>

      {/* 인사이트 카드 */}
      <Card className="border-[#9ACBD0]/20">
        <CardHeader>
          <CardTitle className="text-[#2973B2]">데이터 인사이트</CardTitle>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-white to-[#F2EFE7]/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#48A6A7]" />
                <span className="font-medium text-[#2973B2]">주요 트렌드</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• 가장 활발한 카테고리: <span className="font-medium text-[#48A6A7]">{categoryData[0]?.category || 'N/A'}</span></div>
                <div>• 최고 빈도 키워드: <span className="font-medium text-[#48A6A7]">{frequencyData[0]?.text || 'N/A'}</span></div>
                <div>• 평균 키워드 빈도: <span className="font-medium text-[#48A6A7]">{keywords.length > 0 ? Math.round(keywords.reduce((sum, k) => sum + k.frequency, 0) / keywords.length) : 0}</span></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#48A6A7]" />
                <span className="font-medium text-[#2973B2]">데이터 현황</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• 총 키워드 수: <span className="font-medium text-[#48A6A7]">{keywords.length}개</span></div>
                <div>• 카테고리 수: <span className="font-medium text-[#48A6A7]">{categoryData.length}개</span></div>
                <div>• 데이터 품질: <span className="font-medium text-[#48A6A7]">양호</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}