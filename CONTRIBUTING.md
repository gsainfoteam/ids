# IDS 에 기여하기

IDS 는 pnpm 워크스페이스와 Turborepo 로 묶은 모노레포입니다. 규칙 전체는 [RULES.md](./RULES.md) 에 있고, 이 문서는 처음 기여할 때 필요한 흐름만 모았습니다.

## 준비

```bash
pnpm install
pnpm --filter @gsainfoteam/ids-react exec playwright install chromium   # 브라우저 테스트용, 한 번만
pnpm storybook                                                         # http://localhost:6006
```

- Node 는 `mise.toml` 이 정한 버전을 씁니다.
- Flutter 패키지는 `packages/flutter` 에서 `flutter pub get` 후 작업합니다.

## 변경하기

- **토큰:** `packages/core/tokens/` 를 고친 뒤 `pnpm codegen` 으로 생성 파일을 다시 만듭니다. `packages/css/dist/ids.css`, `packages/react/src/tokens/types.ts`, `packages/flutter/lib/tokens/*.dart` 는 손으로 고치지 않습니다.
- **컴포넌트:** RULES 의 폴더 구조, 스타일, API, 스토리 규칙을 따릅니다. 새 컴포넌트는 스토리(Playground, Gallery, 기능별), README, 브라우저 테스트를 함께 둡니다.
- **코드 주석:** 쓰지 않습니다. 설명은 README 와 스토리 설명에 둡니다.

## 확인

```bash
pnpm typecheck
pnpm lint
pnpm test          # 빌드 후 브라우저 테스트, 모든 스토리의 play, dist 검사
```

- 테스트는 사용자가 하는 입력(`userEvent`, CDP)으로 컴포넌트를 움직입니다. 자세한 규칙은 RULES 의 "Tests" 절에 있습니다.
- 한 파일만: `pnpm --filter @gsainfoteam/ids-react exec vitest run tests/select.test.tsx`

## 커밋과 PR

- 커밋 하나에 변경 하나를 담습니다. 제목은 영어 한 줄, `<type>(<scope>): <title>` 명령형입니다(예: `fix(react): keep focus on the trigger after Escape`).
- 사용자에게 보이는 변경은 `pnpm changeset` 으로 기록합니다. breaking 이면 본문을 "Breaking:" 으로 시작하고 옮기는 법을 적습니다.
- PR 은 템플릿의 확인 항목을 채웁니다.

## 버전 정책

- `@gsainfoteam/ids-css`, `@gsainfoteam/ids-react`, `ids_flutter` 는 같은 버전을 씁니다(Changesets fixed mode).
- **1.0 전(0.x):**
  - minor 는 breaking 변경을 담을 수 있습니다. 해당 changeset 은 "Breaking:" 으로 시작하고 옮기는 법을 적습니다.
  - patch 는 동작을 바꾸지 않는 수정만 담습니다.
- **1.0:** Flutter 컴포넌트가 React 를 따라오고 API 를 동결할 때 올립니다. 그 뒤로는 semver 를 따르며, breaking 은 major 에서만 합니다.
- 배포 절차는 [README 의 배포](./README.md#배포) 에 있습니다.

## 보안

취약점은 이슈로 올리지 말고 [SECURITY.md](./SECURITY.md) 를 따라 알려 주세요.

## 라이선스

기여한 코드는 저장소의 [MIT 라이선스](./LICENSE) 를 따릅니다.
