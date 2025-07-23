import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CheckCircle, AlertTriangle, Code, Database, Globe, Settings } from 'lucide-react';

export function SystemGuide() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">웹 크롤링 & 키워드 분석 시스템</h1>
        <p className="text-xl text-gray-600">
          설정 및 구현을 위한 완전한 기술 가이드
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              1. 웹 크롤링 설정
            </CardTitle>
            <CardDescription>규정 준수를 위한 웹 스크래핑 구성</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                크롤링 전에 항상 robots.txt와 이용약관을 확인하세요
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">구현 단계:</h4>
                <ul className="text-sm space-y-1 mt-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    속도 제한이 있는 web_crawling_tool 설정
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    robots.txt 준수 유효성 검사
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    키워드 추출 알고리즘 구현
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    데이터 유효성 검사 및 정리 추가
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <code className="text-sm">
                  {`// 크롤링 설정 예시
const crawlConfig = {
  respectRobotsTxt: true,
  delay: 1000, // 요청 간 1초 대기
  userAgent: 'YourBot/1.0',
  maxPages: 100
};`}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              2. 데이터 저장소 설정
            </CardTitle>
            <CardDescription>Google Sheets 또는 Supabase 중 선택</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Badge variant="outline">Google Sheets API</Badge>
              <Badge variant="outline">Supabase</Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Google Sheets 설정:</h4>
                <ul className="text-sm space-y-1 mt-2">
                  <li>• Google Sheets API 활성화</li>
                  <li>• 서비스 계정 자격 증명 생성</li>
                  <li>• 인증 설정</li>
                  <li>• 쓰기 권한 구성</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Supabase 설정:</h4>
                <ul className="text-sm space-y-1 mt-2">
                  <li>• Supabase 프로젝트 생성</li>
                  <li>• 데이터베이스 스키마 설정</li>
                  <li>• API 키 구성</li>
                  <li>• Row Level Security 활성화</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="h-5 w-5 mr-2" />
              3. API 통합
            </CardTitle>
            <CardDescription>OpenAI 또는 기타 분석 API와 연결</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">OpenAI API 설정:</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <code>
                    {`const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content: \`다음을 결합한 분석 주제 생성: \${keyword1} + \${keyword2}\`
    }
  ],
  max_tokens: 500,
});`}
                  </code>
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  API 호출에 대한 적절한 오류 처리 및 속도 제한을 구현하세요
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              4. 시스템 아키텍처
            </CardTitle>
            <CardDescription>완전한 구현 구조</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">핵심 구성 요소:</h4>
                <ul className="text-sm space-y-1 mt-2">
                  <li>• CrawlService - 웹 스크래핑 로직</li>
                  <li>• StorageService - 데이터 지속성</li>
                  <li>• AnalysisService - AI 주제 생성</li>
                  <li>• SchedulerService - 자동화된 업데이트</li>
                  <li>• UIComponents - 사용자 인터페이스</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">보안 고려사항:</h4>
                <ul className="text-sm space-y-1 mt-2">
                  <li>• API 키 및 자격 증명 암호화</li>
                  <li>• 속도 제한 구현</li>
                  <li>• 모든 통신에 HTTPS 사용</li>
                  <li>• 모든 입력 데이터 유효성 검사 및 정리</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>구현 워크플로</CardTitle>
          <CardDescription>단계별 구현 프로세스</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">1단계: 기초</h4>
              <ul className="text-sm space-y-1">
                <li>• 개발 환경 설정</li>
                <li>• 필요한 종속성 설치</li>
                <li>• API 자격 증명 구성</li>
                <li>• 기본 프로젝트 구조 생성</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">2단계: 핵심 기능</h4>
              <ul className="text-sm space-y-1">
                <li>• 웹 크롤링 로직 구현</li>
                <li>• 키워드 추출 설정</li>
                <li>• 저장 시스템 연결</li>
                <li>• 사용자 인터페이스 구축</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600">3단계: 개선</h4>
              <ul className="text-sm space-y-1">
                <li>• 자동화된 스케줄링 추가</li>
                <li>• 오류 처리 구현</li>
                <li>• 모니터링 및 로깅 추가</li>
                <li>• 시스템 배포 및 테스트</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>환경 변수</CardTitle>
          <CardDescription>프로덕션 배포를 위한 필수 구성</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm whitespace-pre">
              {`# API 키
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_SHEETS_CREDENTIALS=path_to_service_account.json
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 데이터베이스
DATABASE_URL=your_database_connection_string

# 애플리케이션
NODE_ENV=production
PORT=3000
CRAWL_DELAY=1000
MAX_CRAWL_PAGES=100

# 보안
JWT_SECRET=your_jwt_secret
API_RATE_LIMIT=100`}
            </code>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>프로덕션 준비:</strong> 이 시스템은 적절한 오류 처리, 속도 제한, 데이터 유효성 검사를 통해 확장 가능하도록 설계되었습니다. 
          사용량을 모니터링하고 웹사이트 이용약관을 준수하는 것을 잊지 마세요.
        </AlertDescription>
      </Alert>
    </div>
  );
}