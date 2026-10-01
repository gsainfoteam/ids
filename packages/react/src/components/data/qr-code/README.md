# QRCode

URL, 텍스트, 연락처를 QR 코드로 그립니다. 행렬은 `uqr` 가 만들고, IDS 가 토큰 색으로 SVG 를 그립니다.

- **SVG 한 장.** 모듈은 `path` 하나, 세 모서리의 파인더는 또 하나입니다. 서버 HTML 에 이미 그려져 있고, 어떤 크기로 늘려도 흐려지지 않습니다.
- **토큰 색.** `surface` 바탕에 `on-surface` 모듈입니다. 다크 모드에서는 테마를 따라 반전됩니다. 반전이 곤란하면 `inverted={false}` 를 씁니다.
- **모양.** 모듈은 `square` / `rounded` / `dots`, 파인더는 `square` / `rounded` / `circle` 입니다.
- **가운데 로고.** `QRCode.Logo` 를 넣으면 가운데 모듈을 비우고 오류 정정 수준을 H 로 올립니다.
- **이름.** `role="img"` 이고, 기본 이름은 "QR 코드" 입니다. 긴 URL 을 소리 내어 읽지 않습니다.

```tsx
import { QRCode } from '@gsainfoteam/ids-react';

<QRCode value="https://gistory.me/profile/alice" aria-label="Alice의 프로필" />;
```

## 모양

```tsx
<QRCode value={url} />                                  // square 모듈, square 파인더
<QRCode value={url} shape="rounded" />                  // 붙은 모듈은 이어지고 바깥 모서리만 둥글다
<QRCode value={url} shape="dots" />                     // 동그란 모듈, circle 파인더
<QRCode value={url} shape="dots" finderShape="square" /> // 파인더만 따로
```

- `finderShape` 를 주지 않으면 `shape` 를 따릅니다: `square` → `square`, `rounded` → `rounded`, `dots` → `circle`.
- `dots` 의 점은 이웃한 점과 맞닿는 크기입니다. 점 사이를 더 벌리면 일부 스캐너(jsQR)가 읽지 못합니다.

## 크기와 여백

```tsx
<QRCode value={url} size="tiny" />        // 96px
<QRCode value={url} />                    // standard, 128px
<QRCode value={url} size={240} />         // px
<QRCode value={url} className="size-60" /> // Tailwind 로도 된다

<QRCode value={url} quietZone={4} />      // 기본. 둘레에 모듈 4칸을 비운다(표준)
<QRCode value={url} quietZone={0} />      // 여백 없음. 모서리도 둥글게 깎지 않는다
```

- 여백(quiet zone)은 스캐너가 코드의 경계를 찾는 자리입니다. 줄이려면 코드 둘레가 이미 비어 있어야 합니다.
- 내용이 길수록 버전이 올라가 모듈이 촘촘해집니다. 긴 URL 은 `size` 를 키웁니다. 루트의 `data-version` 이 버전입니다.

## 오류 정정

```tsx
<QRCode value={url} errorCorrection="L" />  // 7% 복구. 가장 성김
<QRCode value={url} />                      // M, 15% 복구 (기본)
<QRCode value={url} errorCorrection="Q" />  // 25% 복구
<QRCode value={url} errorCorrection="H" />  // 30% 복구. 로고가 있으면 기본
```

## 로고

```tsx
<QRCode value="https://gistory.me/pay/8203" aria-label="결제 페이지">
  <QRCode.Logo>
    <img src="/brand-mark.svg" alt="" />
  </QRCode.Logo>
</QRCode>

<QRCode value={url}>
  <QRCode.Logo>
    <AcademicCapIcon />           {/* 아이콘은 모듈 색을 따른다 */}
  </QRCode.Logo>
</QRCode>

<QRCode value={url}>
  <QRCode.Logo asChild>
    <a href="/brand">...</a>      {/* 기본 div 대신 자식 요소 */}
  </QRCode.Logo>
</QRCode>
```

- 가운데 약 22% 너비의 모듈을 비우고, 그 안쪽 한 칸을 띄워 로고를 둡니다. 로고가 불투명해도 H 수준이면 읽힙니다.
- `errorCorrection` 을 `L` 이나 `M` 으로 직접 주면 개발 모드에서 경고합니다.
- 로고의 `img` 는 `alt=""` 로 둡니다. QR 코드 전체가 이미 이름을 가진 그림이라, 안쪽은 읽히지 않습니다.

## 색과 다크 모드

```tsx
<QRCode value={url} />                    // 테마를 따른다. 다크 모드에서는 밝은 모듈, 어두운 바탕
<QRCode value={url} inverted={false} />   // 어느 모드에서나 밝은 바탕에 어두운 모듈
<QRCode value={url} inverted />           // 어느 모드에서나 어두운 바탕에 밝은 모듈

<QRCode
  value={url}
  className="[--qr-code-foreground:var(--ids-color-accent)]"  // 모듈 색
/>
```

- QR 표준은 밝은 바탕에 어두운 모듈입니다. iOS 카메라, Google Lens 처럼 요즘 앱은 반전된 코드도 읽지만, 오래된 스캐너나 결제 단말기는 못 읽을 수 있습니다.
- 어떤 스캐너가 읽을지 모르는 화면(결제, 출입, 인쇄물)에는 `inverted={false}` 를 씁니다. 다크 모드에서 흰 판 위에 코드가 놓입니다.
- 색은 `--qr-code-foreground`, `--qr-code-background` 두 변수로 바꿉니다. 두 색의 대비가 클수록 잘 읽힙니다. 기본 조합은 어느 모드에서나 15:1 이 넘습니다.

## 접근성

```tsx
<QRCode value={url} />                                     // 이름 "QR 코드"
<QRCode value={url} aria-label="결제 페이지로 가는 QR 코드" />

<figure>
  <QRCode value={url} aria-labelledby="caption" />
  <figcaption id="caption">Alice 의 프로필 {url}</figcaption>  {/* 스캔할 수 없는 사람도 주소를 본다 */}
</figure>
```

- 기본 이름은 번역 키 `qrCode.label` 입니다. 값(`value`)은 이름에 넣지 않습니다. 긴 URL 을 한 글자씩 읽게 되기 때문입니다.
- 무엇으로 가는 코드인지 `aria-label` 로 적고, 같은 주소를 링크나 글자로도 보여 줍니다(WCAG 1.1.1).

## 상태와 data 속성

| 속성                    | 뜻                                        |
| ----------------------- | ----------------------------------------- |
| `data-shape`            | `square` / `rounded` / `dots`             |
| `data-finder-shape`     | `square` / `rounded` / `circle`           |
| `data-error-correction` | 실제로 쓴 수준 `L` / `M` / `Q` / `H`      |
| `data-version`          | QR 버전(1~40). 모듈 수는 `버전 × 4 + 17`  |
| `data-overflow`         | 값이 너무 길어 그리지 못했을 때           |

함수로 받는 상태는 `{ version, errorCorrection, shape, finderShape }` 입니다. 루트의 `className`, `style` 이 받습니다.

## 속성

| 속성              | 기본 / 동작                                                   |
| ----------------- | ------------------------------------------------------------- |
| `value`           | 인코딩할 문자열. UTF-8 로 담는다                              |
| `size`            | `standard`(128px, 기본) / `tiny`(96px) / 숫자(px)             |
| `errorCorrection` | `L` / `M`(기본) / `Q` / `H`. 로고가 있으면 기본 `H`           |
| `shape`           | `square`(기본) / `rounded` / `dots`                           |
| `finderShape`     | `square` / `rounded` / `circle`. 기본은 `shape` 를 따름       |
| `quietZone`       | 둘레 빈 칸 수. 기본 `4`                                       |
| `inverted`        | 없음: 테마를 따름. `false`: 항상 밝은 바탕. `true`: 항상 반전 |
| `Logo.asChild`    | 기본 `div` 대신 자식 요소에 속성을 합친다                     |
| 그 외             | 루트 `div` 의 native 속성                                     |

## 알아둘 것

- 개발 모드에서 `value` 가 비었을 때, 너무 길어 인코딩하지 못할 때, 로고에 낮은 수준을 줬을 때 경고합니다.
- 너무 긴 값은 예외를 던지지 않고 빈 판을 그리며 `data-overflow` 를 붙입니다. 버전 40, `L` 수준에서 영문 약 2,900자가 한도입니다.
