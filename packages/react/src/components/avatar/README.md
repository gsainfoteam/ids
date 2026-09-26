# Avatar

```tsx
import { Avatar } from '@gsainfoteam/ids-react';

<Avatar src="/avatars/alice.jpg" name="Alice Kim" />
<Avatar name="류현승" />
<Avatar src="/logos/acme.png" name="Acme" variant="square" />
```

사용자나 엔티티를 나타내는 미디어 컨테이너다. `variant`는 `circle`(기본) `square`,
`size`는 `standard`(기본) `tiny`.

## fallback

`src`가 있으면 이미지를 그리고, 로드에 실패하면 fallback으로 넘어간다. fallback은 두 단계다.

1. `<Avatar.Fallback>`을 넣었으면 그것
2. 아니면 `name`에서 뽑은 이니셜

이니셜 규칙은 한글이면 첫 글자(`류현승` → `류`), 그 외에는 앞 두 단어의 첫 글자
(`Alice Kim` → `AK`)다. `initialsOf`로 따로 꺼내 쓸 수도 있다.

기본 사용자 아이콘은 없다. IDS는 아이콘 세트를 들고 다니지 않으므로 직접 넣는다.

```tsx
<Avatar alt="알 수 없는 사용자">
  <Avatar.Fallback>
    <UserIcon />
  </Avatar.Fallback>
</Avatar>
```

## 접근성

`role="img"`이고 `aria-label`은 `alt ?? name`이다. 둘 다 없으면 `IdsError`를 던진다 —
읽어줄 이름이 없는 이미지가 되기 때문이다. `src`, `name`, `<Avatar.Fallback>`이 모두
없을 때도 마찬가지로 던진다. 그릴 것이 없다.

이미지는 `loading="lazy"`이고 `alt=""`다. 이름은 바깥 `role="img"`이 이미 들고 있어서
안쪽 `<img>`까지 읽으면 두 번 읽힌다.
