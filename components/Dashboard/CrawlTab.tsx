import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Trash2 } from 'lucide-react';

export function CrawlTab({ crawlTargets, newTargetUrl, onNewTargetUrlChange, onAddTarget, onRemoveTarget }) {
  return (
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
            onChange={onNewTargetUrlChange}
            onKeyPress={e => {
              if (e.key === 'Enter') onAddTarget();
            }}
            className="border-[#2973B2]/30"
          />
          <Button onClick={onAddTarget} disabled={!newTargetUrl.trim()} className="bg-[#2973B2] hover:bg-[#2973B2]/90">
            대상 추가
          </Button>
        </div>
        <div className="space-y-2">
          {crawlTargets.length === 0 ? (
            <p className="text-gray-500 text-center py-4">크롤링 대상이 없습니다</p>
          ) : (
            crawlTargets.map(target => (
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveTarget(target.id)}
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
  );
} 