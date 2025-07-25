import React from 'react';
import { ShareAndCollaboration } from '../ShareAndCollaboration';
import { Alert, AlertDescription } from '../ui/alert';

export function ShareTab({ selectedAnalysis, onSave }) {
  if (selectedAnalysis) {
    return <ShareAndCollaboration analysis={selectedAnalysis} onSave={onSave} />;
  }
  return (
    <Alert className="border-[#2973B2]/30 bg-[#2973B2]/5">
      <AlertDescription>
        공유할 분석 결과를 선택하세요. 분석 히스토리 탭에서 분석 결과를 선택하거나 새로운 분석을 생성해주세요.
      </AlertDescription>
    </Alert>
  );
} 