returnzero 사의 STT API를 이용하여 STT모듈을 만드는 프로젝틑
하단에 참고주소

[일반STT](https://developers.rtzr.ai/docs/stt-streaming/)

[스트리밍STT-Websocket](https://developers.rtzr.ai/docs/stt-file/)

## description

음성파일에서 발화 문구를 추출하려 텍스트로 변경, 이 텍스트를 사용자 화면에 보여주는 것이 주요 기능
청각적요소의 시각화기능

## Package module

- nextjs 13.14 : nextjs14 버전 사용 금지. AppRouter 기능때문에 socker 기능 사용 불가.
- fluent-ffmpeg : 패키지 단독사용 불가 시스템 내부에 ffmpeg 설치되어 있어야 사용 가능.

## Environment

- CLIENT_ID : returnzero 에서 발급받은 클라이언트 아이디
- CLIENT_SECRETE : returnzero 에서 발급받은 클라이언트 시크릿
