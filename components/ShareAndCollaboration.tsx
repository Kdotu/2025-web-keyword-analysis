import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Share2, Copy, Mail, Download, Edit, Save, Users, Link, FileText, MessageCircle } from 'lucide-react';
import { AnalysisTopic } from '../types';

interface ShareAndCollaborationProps {
  analysis: AnalysisTopic;
  onSave: (analysis: AnalysisTopic) => void;
}

export function ShareAndCollaboration({ analysis, onSave }: ShareAndCollaborationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnalysis, setEditedAnalysis] = useState<AnalysisTopic>(analysis);
  const [shareUrl, setShareUrl] = useState('');
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const analysisId = analysis.id;
    const url = `${baseUrl}/shared/analysis/${analysisId}`;
    setShareUrl(url);
    return url;
  };

  const handleCopyLink = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('링크 복사 실패:', error);
    }
  };

  const handleEmailShare = () => {
    const url = generateShareUrl();
    const subject = encodeURIComponent(`키워드 분석 공유: ${analysis.title}`);
    const body = encodeURIComponent(`
안녕하세요,

다음 키워드 분석 결과를 공유드립니다:

제목: ${analysis.title}
키워드: ${analysis.keyword1} + ${analysis.keyword2}

분석 링크: ${url}

감사합니다.
    `);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleExport = (format: 'pdf' | 'json' | 'md') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(analysis, null, 2);
        filename = `analysis-${analysis.id}.json`;
        mimeType = 'application/json';
        break;
      case 'md':
        content = `# ${analysis.title}

## 키워드 조합
- **키워드 1**: ${analysis.keyword1}
- **키워드 2**: ${analysis.keyword2}
- **생성일**: ${analysis.generatedAt.toLocaleDateString('ko-KR')}

## 분석 개요
${analysis.description}

## 주요 제안사항
${analysis.suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}
`;
        filename = `analysis-${analysis.id}.md`;
        mimeType = 'text/markdown';
        break;
      default:
        // PDF는 실제 구현에서는 jsPDF 등을 사용
        alert('PDF 내보내기는 준비 중입니다.');
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = () => {
    onSave(editedAnalysis);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddCollaborator = () => {
    if (collaboratorEmail) {
      // 실제 구현에서는 서버에 협업자 추가 요청
      console.log(`협업자 추가: ${collaboratorEmail}`);
      setCollaboratorEmail('');
      alert(`${collaboratorEmail}에게 협업 초대를 발송했습니다.`);
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      // 실제 구현에서는 댓글 저장
      console.log(`댓글 추가: ${comment}`);
      setComment('');
      alert('댓글이 추가되었습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 성공 알림 */}
      {showSuccess && (
        <Alert className="border-[#48A6A7]/30 bg-[#48A6A7]/10">
          <Share2 className="h-4 w-4 text-[#48A6A7]" />
          <AlertDescription className="text-[#48A6A7]">
            작업이 성공적으로 완료되었습니다!
          </AlertDescription>
        </Alert>
      )}

      {/* 분석 정보 카드 */}
      <Card className="border-[#9ACBD0]/20">
        <CardHeader className="bg-gradient-to-br from-white to-[#F2EFE7]/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#2973B2] flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                공유 및 협업
              </CardTitle>
              <CardDescription>
                분석 결과를 팀원들과 공유하고 함께 협업할 수 있습니다
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-[#9ACBD0]/50 hover:bg-[#F2EFE7]/50"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? '취소' : '편집'}
              </Button>
              {isEditing && (
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  className="bg-[#48A6A7] hover:bg-[#48A6A7]/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 bg-gradient-to-br from-white to-[#F2EFE7]/20">
          {/* 키워드 표시 */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-[#2973B2]/10 text-[#2973B2]">
              {editedAnalysis.keyword1}
            </Badge>
            <span className="text-[#48A6A7]">+</span>
            <Badge variant="secondary" className="bg-[#2973B2]/10 text-[#2973B2]">
              {editedAnalysis.keyword2}
            </Badge>
            <span className="text-xs text-gray-500 ml-auto">
              {editedAnalysis.generatedAt.toLocaleDateString('ko-KR')}
            </span>
          </div>

          {/* 제목 편집 */}
          <div>
            <label className="text-sm font-medium text-[#2973B2] mb-2 block">분석 제목</label>
            {isEditing ? (
              <Input
                value={editedAnalysis.title}
                onChange={(e) => setEditedAnalysis({ ...editedAnalysis, title: e.target.value })}
                className="border-[#9ACBD0]/30"
              />
            ) : (
              <h3 className="text-lg font-medium text-[#2973B2]">{editedAnalysis.title}</h3>
            )}
          </div>

          {/* 설명 편집 */}
          <div>
            <label className="text-sm font-medium text-[#2973B2] mb-2 block">분석 설명</label>
            {isEditing ? (
              <Textarea
                value={editedAnalysis.description}
                onChange={(e) => setEditedAnalysis({ ...editedAnalysis, description: e.target.value })}
                rows={3}
                className="border-[#9ACBD0]/30"
              />
            ) : (
              <p className="text-gray-600 leading-relaxed">{editedAnalysis.description}</p>
            )}
          </div>

          {/* 제안사항 편집 */}
          <div>
            <label className="text-sm font-medium text-[#2973B2] mb-2 block">주요 제안사항</label>
            {isEditing ? (
              <div className="space-y-2">
                {editedAnalysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                    <Input
                      value={suggestion}
                      onChange={(e) => {
                        const newSuggestions = [...editedAnalysis.suggestions];
                        newSuggestions[index] = e.target.value;
                        setEditedAnalysis({ ...editedAnalysis, suggestions: newSuggestions });
                      }}
                      className="border-[#9ACBD0]/30"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {editedAnalysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#48A6A7] rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600 leading-relaxed">{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 공유 옵션 */}
      <Card className="border-[#9ACBD0]/20">
        <CardHeader>
          <CardTitle className="text-[#2973B2] flex items-center gap-2">
            <Link className="h-4 w-4" />
            공유 링크
          </CardTitle>
          <CardDescription>
            분석 결과를 링크로 공유하거나 다양한 형태로 내보낼 수 있습니다
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 bg-gradient-to-br from-white to-[#F2EFE7]/20">
          <div className="flex gap-2">
            <Input
              value={shareUrl || generateShareUrl()}
              readOnly
              placeholder="공유 링크가 여기에 생성됩니다"
              className="border-[#9ACBD0]/30"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="border-[#9ACBD0]/50 hover:bg-[#F2EFE7]/50"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleEmailShare}
              variant="outline"
              size="sm"
              className="border-[#9ACBD0]/50 hover:bg-[#F2EFE7]/50"
            >
              <Mail className="h-4 w-4 mr-2" />
              이메일 공유
            </Button>
            <Button
              onClick={() => handleExport('json')}
              variant="outline"
              size="sm"
              className="border-[#9ACBD0]/50 hover:bg-[#F2EFE7]/50"
            >
              <Download className="h-4 w-4 mr-2" />
              JSON 내보내기
            </Button>
            <Button
              onClick={() => handleExport('md')}
              variant="outline"
              size="sm"
              className="border-[#9ACBD0]/50 hover:bg-[#F2EFE7]/50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Markdown 내보내기
            </Button>
            <Button
              onClick={() => handleExport('pdf')}
              variant="outline"
              size="sm"
              className="border-[#9ACBD0]/50 hover:bg-[#F2EFE7]/50"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF 내보내기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 협업자 관리 */}
      <Card className="border-[#9ACBD0]/20">
        <CardHeader>
          <CardTitle className="text-[#2973B2] flex items-center gap-2">
            <Users className="h-4 w-4" />
            협업자 관리
          </CardTitle>
          <CardDescription>
            팀원을 초대하여 함께 분석 결과를 검토하고 개선할 수 있습니다
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 bg-gradient-to-br from-white to-[#F2EFE7]/20">
          <div className="flex gap-2">
            <Input
              placeholder="협업자 이메일 주소"
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
              className="border-[#9ACBD0]/30"
            />
            <Button
              onClick={handleAddCollaborator}
              disabled={!collaboratorEmail}
              className="bg-[#48A6A7] hover:bg-[#48A6A7]/90"
            >
              <Users className="h-4 w-4 mr-2" />
              초대
            </Button>
          </div>

          {/* 현재 협업자 목록 (시뮬레이션) */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[#2973B2]">현재 협업자</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-[#F2EFE7]/60 rounded border border-[#9ACBD0]/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#2973B2] rounded-full flex items-center justify-center text-white text-sm">
                    A
                  </div>
                  <div>
                    <div className="text-sm font-medium">admin@example.com</div>
                    <div className="text-xs text-gray-500">소유자</div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-[#48A6A7]/10 text-[#48A6A7] text-xs">
                  편집 가능
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 댓글 및 피드백 */}
      <Card className="border-[#9ACBD0]/20">
        <CardHeader>
          <CardTitle className="text-[#2973B2] flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            댓글 및 피드백
          </CardTitle>
          <CardDescription>
            분석 결과에 대한 의견이나 개선사항을 공유해보세요
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 bg-gradient-to-br from-white to-[#F2EFE7]/20">
          <div className="space-y-2">
            <Textarea
              placeholder="댓글을 입력하세요..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="border-[#9ACBD0]/30"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!comment.trim()}
                size="sm"
                className="bg-[#48A6A7] hover:bg-[#48A6A7]/90"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                댓글 추가
              </Button>
            </div>
          </div>

          {/* 댓글 목록 (시뮬레이션) */}
          <div className="space-y-3 border-t border-[#9ACBD0]/20 pt-4">
            <h4 className="text-sm font-medium text-[#2973B2]">댓글 (1)</h4>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-[#F2EFE7]/60 rounded border border-[#9ACBD0]/20">
                <div className="w-8 h-8 bg-[#48A6A7] rounded-full flex items-center justify-center text-white text-sm">
                  U
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">user@example.com</span>
                    <span className="text-xs text-gray-500">2시간 전</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    이 분석 결과가 매우 유용합니다. 특히 세 번째 제안사항이 우리 프로젝트에 잘 맞을 것 같아요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}