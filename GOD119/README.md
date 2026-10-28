# GOD119 강의실

기존 교회 홈페이지를 보존하면서 GOD119/ 경로에 독립 설치한 AI 목회자 세미나용 웹페이지입니다.

## 현재 상태
원본 PPT, 노트북 로컬 영상, 개인 문서, 개인 파일 경로는 공개하지 않았습니다. 56장 슬라이드의 목차 미리보기를 제공합니다.
강사 제어 화면은 ?teacher=1 이며, Firebase 설정 이전에는 해당 브라우저에서만 시연됩니다.

## GitHub Pages 설정
저장소 Settings > Pages > Deploy from a branch > main / root > Save. 게시 후 예상 주소: https://kang-pastor79.github.io/Onch-0691/GOD119/

## 실시간 Firebase 설정
1. Firebase Console에서 프로젝트, Web App 및 Realtime Database를 만듭니다.
2. Authentication에서 Google 로그인 활성화. Authorized domains에 kang-pastor79.github.io를 추가합니다.
3. 웹 앱 구성을 GOD119/config.js에 입력합니다. 서비스 계정 비밀키를 절대 넣지 마세요.
4. 강사 화면에서 Google 로그인 후 보이는 UID를 복사합니다.
5. Firebase Realtime Database Rules 콘솔에 firebase-rules.example.json을 붙여넣고 REPLACE_WITH_PRESENTER_UID를 UID로 교체한 뒤 게시합니다. 교체된 규칙을 공개 GitHub 파일에 올리지 마세요.
6. 참석자와 강사 링크를 서로 다른 기기로 열어 슬라이드 이동 및 판서를 검증합니다.

주의: 참석자 로그인 없는 공개 열람 방식입니다. 사이트와 데이터베이스에 개인정보, 참석자 명부나 비밀 강의자료를 게시하지 마세요.

## 원본 슬라이드
실제 슬라이드 JPG 파일은 보안 검토와 게시 승인 전까지 GitHub에 올리지 않았습니다. 승인 후 GOD119/slides/slide-01.jpg 부터 slide-56.jpg까지 업로드하면 이미지가 표시됩니다.