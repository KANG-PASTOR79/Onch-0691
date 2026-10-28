# GOD119 · AI 목회자 세미나 실시간 강의실

GOD119는 기존 교회 홈페이지를 변경하지 않고 `Onch-0691/GOD119/` 경로에 별도로 설치한 강의 페이지입니다.

- 참석자 화면: https://kang-pastor79.github.io/Onch-0691/GOD119/
- 강사 화면: https://kang-pastor79.github.io/Onch-0691/GOD119/?teacher=1
- 설정 안내: https://kang-pastor79.github.io/Onch-0691/GOD119/setup.html

## 현재 구현 상태

- GitHub에 강사용·참석자용 웹 화면, 페이지 이동, 펜·형광펜·지우개·레이저 포인터 코드 등록
- 실시간 동기화는 **Firebase Realtime Database 연결 전**이므로 현재 다른 노트북에 전송되지 않음
- Firebase 인증 설정이 완료되면 참석자는 로그인 없이 보기만 하고, 인증된 지정 강사 UID만 수정할 수 있도록 규칙 예시 마련
- 현재 원본 56장 PPT 슬라이드 이미지, 노트북 파일, 연결 동영상, 개인 경로는 **공개 저장소에 게시하지 않음**. 강의 페이지는 제목 기반의 안전한 미리보기를 표시

## 진행 순서

1. [강사 연결 안내](setup.html)에서 Firebase 프로젝트 생성 및 Google 로그인 설정
2. Realtime Database를 **잠금 모드**로 생성
3. [config.js](config.js)에 Firebase 웹 앱 설정 기입 (서비스 계정 비밀키는 절대 기입하지 않기)
4. 강사 화면에 Google 로그인하여 UID 확인
5. [firebase-rules.example.json](firebase-rules.example.json)을 Firebase 콘솔의 Realtime Database 규칙에 붙여넣고 UID 교체 후 게시
6. 두 노트북으로 슬라이드 이동·판서·지우개를 실제 테스트
7. 개인 정보·초상권·저작권 검토를 마친 자료만 공개 게시

## 중요한 보안 안내

GitHub Pages와 현재 제공하는 참석자 링크는 **공개 접근 가능한 웹사이트**입니다. `noindex`는 검색엔진에 대한 권고일 뿐 접근 통제가 아닙니다. 강의자료와 참여자 정보를 비공개로 해야 한다면 참석자 인증이 가능한 별도 서비스 구성이 필요합니다.

Firebase의 웹 설정(API 키 등)은 공개 웹 앱의 식별 정보이며 백엔드 비밀키가 아닙니다. 데이터 접근 권한은 **Firebase Security Rules**로 제한해야 합니다. 공개 GitHub에 서비스 계정 JSON, OAuth 비밀키, 비밀번호, 개인 노트북 파일을 올리지 마세요.
