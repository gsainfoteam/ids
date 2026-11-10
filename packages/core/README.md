# @gsainfoteam/ids-core

토큰 소스 + Style Dictionary codegen. **배포하지 않음** — 빌드 타임 전용.

## 역할

`packages/core/tokens/`의 JSON 토큰을 읽어 아래 파일을 생성한다.

| 출력 파일 | 설명 |
|---|---|
| `packages/css/dist/ids.css` | CSS 변수 + Tailwind `@theme` |
| `packages/react/src/tokens/types.ts` | TypeScript 타입 (`IdsColor`, `IdsSize` 등) |
| `packages/flutter/lib/tokens/*.dart` | Dart 토큰 클래스 |

## 토큰 구조

```
tokens/
  palette.json          # 원시 색상 팔레트 (blue.500, orange.300 등)
  spacing.json          # 간격 원시값 (xs, sm, md, ...)
  typography.json       # 폰트 패밀리·사이즈·웨이트·행간 원시값
  motion.json           # 애니메이션 지속시간 원시값
  enums.json            # IdsColor·IdsMode·IdsSize·IdsVariant 열거값
  semantic/
    [color].light.json  # 라이트 모드 시맨틱 색상 (primary, on-primary 등)
    [color].dark.json   # 다크 모드 시맨틱 색상
    typography.json     # 시맨틱 타이포그래피 스케일 (display, heading, body 등)
```

시맨틱 색상 파일에서 `{blue.600}` 형태로 팔레트를 참조한다.

## codegen 실행

```bash
# 루트에서
pnpm codegen

# 또는 이 패키지 직접
pnpm build
```

생성된 파일은 직접 편집하지 않는다. `pnpm codegen` 실행 시 덮어쓴다.

## 새 색상 추가

```bash
# 1. 팔레트 값 추가
#    tokens/palette.json

# 2. 시맨틱 파일 추가
#    tokens/semantic/[color].light.json
#    tokens/semantic/[color].dark.json

# 3. codegen
pnpm codegen
```

시맨틱 파일 구조:

```json
{
  "color": {
    "primary":    { "$value": "{blue.600}", "$type": "color" },
    "on-primary": { "$value": "{neutral.0}", "$type": "color" }
  }
}
```

## 문구 카탈로그

`messages/ko.json`과 `messages/en.json`이 IDS 자체 문구의 원본이다. 서비스의 문구는 포함하지 않는다. `pnpm codegen`이 React의 `src/internal/messages-catalog.ts`와 `messages/en.json`을 생성한다. 한국어는 단순 `{name}` 인자만 사용한다.

같은 명령은 Flutter의 `lib/messages/ids_messages.dart`와 `messages/ko.i18n.json`도 생성한다. Dart에는 nullable `IdsMessages` mixin과 모든 문구를 가진 `IdsMessages.ko`가 들어간다. `dialog.close`는 `dialogClose`로, `{label}`은 필수 named parameter `Object label`로 바뀐다. 중첩 경로가 같은 Dart 이름이 되거나 한국어에 지원하지 않는 ICU 구문이 있으면 생성이 실패한다.

생성기 테스트: `node --test packages/core/dart-messages.test.mjs`.
