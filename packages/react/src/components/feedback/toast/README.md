# Toast

작업 결과를 화면 구석에 잠깐 띄웠다가 스스로 사라지는 알림입니다. 사용자가 닫을 때까지 페이지 안에 남아야 하는 알림은 `Alert` 를 씁니다.

- **어디서든 부릅니다.** `toast('저장했습니다')` 는 컴포넌트 밖에서도 부를 수 있습니다. 가장 바깥 `IdsProvider` 가 알림을 그릴 자리를 갖고 있습니다.
- **Alert 와 같은 의미.** `colorScheme` 의 색, 아이콘, 알리는 강도가 Alert 와 같습니다. warning 과 error 는 읽던 것을 끊고 알리고(`role="alert"`), 나머지는 기다렸다 알립니다(`role="status"`).
- **쌓입니다.** 새 알림이 앞에 오고 뒤의 알림은 작아진 채 가장자리만 보입니다. 마우스를 올리거나 포커스하면 펼쳐집니다.
- **읽는 동안 멈춥니다.** 마우스를 올린 동안, 안에 포커스가 있는 동안, 탭이 가려진 동안에는 사라지는 시간이 흐르지 않습니다.
- **밀어서 닫습니다.** 가장자리 쪽으로 45px 넘게, 또는 빠르게 밀면 닫히고, 덜 밀면 제자리로 돌아옵니다.
- **키보드.** F6 이나 Alt+T 로 알림 영역에 들어가고, 한 번 더 누르거나 Escape 로 원래 자리로 돌아갑니다.
- **대화상자 위에서도.** 열린 `Dialog` 위에 뜨고, 눌러도 대화상자가 닫히지 않습니다.

```tsx
import { toast } from '@gsainfoteam/ids-react';

toast.success('저장했습니다', { description: '바꾼 내용이 모두 반영됐습니다.' });
```

## 띄우기

```tsx
toast('새 댓글이 달렸습니다');              // neutral, 아이콘 없음
toast.info('점검이 예정돼 있습니다');
toast.success('저장했습니다');
toast.warning('저장 공간이 거의 찼습니다');  // role="alert"
toast.error('보내지 못했습니다');            // colorScheme="danger", role="alert"
toast.loading('올리는 중');                  // Spinner, 스스로 사라지지 않는다
```

- 모두 알림의 id 를 돌려줍니다. id 를 넘기지 않으면 숫자가 붙습니다.
- `toast.show` 는 `toast` 와 같습니다.

## 옵션

```tsx
toast('메일을 지웠습니다', {
  description: '휴지통에서 30일 동안 보관됩니다.',
  duration: 6000,                                  // 기본 4000ms, Infinity 면 닫을 때까지
  action: { label: '되돌리기', onClick: restore },  // IDS Button
  colorScheme: 'info',                             // 함수 이름보다 우선한다
  icon: <TrashIcon />,                             // null 이면 아이콘 없이
  onDismiss: (t) => {},                            // 닫기 버튼, 밀기, 동작 버튼, toast.dismiss
  onAutoClose: (t) => {},                          // 시간이 다 돼서 사라질 때
  className: 'max-w-xs',
  style: {},
});
```

- 동작 버튼을 누르면 알림이 닫힙니다. `onClick` 에서 `event.preventDefault()` 하면 남습니다.
- 모든 알림에 닫기 버튼(X, "알림 닫기")이 붙습니다.

## id 로 바꾸기

```tsx
const id = toast.loading('내보내는 중');
toast.success('내보냈습니다', { id });   // 같은 알림이 바뀐다
toast.dismiss(id);
toast.dismiss();                         // 모두 닫는다. toast.dismissAll() 과 같다
```

- 같은 id 로 다시 부르면 자리와 요소를 그대로 두고 내용만 바꿉니다. 사라지는 시간은 처음부터 다시 셉니다.
- 넘기지 않은 옵션(`description`, `action` 등)은 이전 값을 이어 씁니다. `colorScheme` 과 `duration` 은 부른 함수의 기본값으로 돌아갑니다.
- 닫히는 중인 알림도 같은 id 로 부르면 다시 열립니다.

## toast.promise

```tsx
toast.promise(save(), {
  loading: '저장하는 중',                          // 생략하면 "처리하는 중"
  success: (result) => `${result.name} 을 저장했습니다`,
  error: (reason) => `저장하지 못했습니다: ${String(reason)}`,
  description: '잠시만 기다려 주세요.',             // 나머지 옵션은 세 단계에 모두 쓰인다
});

toast.promise(() => fetch('/api'), { success: '보냈습니다' });   // 함수를 넘겨도 된다
```

- 불러오는 동안은 loading 알림이고, 끝나면 같은 알림이 success 나 error 로 바뀝니다.
- `success` 나 `error` 를 생략하면 그렇게 끝났을 때 알림을 닫습니다.
- 알림의 id 를 돌려줍니다. 결과는 넘긴 promise 에서 받습니다.

## Toaster

```tsx
import { Toaster } from '@gsainfoteam/ids-react';

<IdsProvider>
  <App />
  <Toaster placement="top-center" max={5} />
</IdsProvider>;
```

- `Toaster` 를 두지 않아도 가장 바깥 `IdsProvider` 가 기본값으로 그립니다. 앱에 `Toaster` 를 두면 그쪽이 기본을 대신하고, 빼면 기본이 돌아옵니다.
- 여러 개를 두면 먼저 그린 하나만 알림을 그립니다.

| 속성          | 기본 / 동작                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `placement`   | `bottom-right`. `top-left` / `top-center` / `top-right` / `bottom-left` / `bottom-center`       |
| `max`         | `3`. 넘는 알림은 뒤에 숨어 기다리고, 기다리는 동안은 시간이 흐르지 않는다                       |
| `gap`         | `14`(px). 펼쳤을 때 알림 사이, 접었을 때 뒤 알림이 보이는 폭                                    |
| `offset`      | `24`(px). 화면 가장자리에서 떨어진 거리. 640px 미만에서는 16px                                  |
| `expand`      | `false`. `true` 면 늘 펼쳐 둔다                                                                 |
| `hotkey`      | `['altKey', 'KeyT']`. 영역으로 들어가는 키. 수정 키 이름과 `event.code` 를 섞는다. F6 은 늘 된다 |
| `className`   | 알림 영역으로 간다                                                                              |
| `aria-label`  | 알림 영역의 이름. 기본 "알림"                                                                   |

- 640px 미만에서는 좌우 16px 을 남기고 화면 폭을 채웁니다. 그 이상에서는 356px 폭입니다.

## 쌓기와 밀기

| 동작                                 | 결과                                                                 |
| ------------------------------------ | -------------------------------------------------------------------- |
| 새 알림                              | 앞에 온다. 뒤 알림은 하나마다 5% 작아지고 `gap` 만큼 올라가 보인다   |
| 마우스를 올리기, 포커스, 누르고 있기 | 모두 펼쳐지고 시간이 멈춘다                                          |
| 가장자리 쪽으로 45px, 또는 빠르게    | 밀려 나가며 닫힌다(`onDismiss`)                                      |
| 덜 밀기, 반대쪽으로 밀기             | 제자리로 돌아온다. 반대쪽은 무겁게 따라온다                          |
| 탭이 가려짐                          | 시간이 멈춘다                                                        |

- 밀 수 있는 쪽은 아래쪽 알림은 아래, 위쪽 알림은 위, 그리고 놓인 옆쪽(가운데면 양옆)입니다.
- 버튼 위에서 누른 것은 밀기가 아니라 버튼 누르기입니다.

## 키보드

| 키                | 동작                                                           |
| ----------------- | -------------------------------------------------------------- |
| F6, Alt+T         | 알림이 있으면 영역으로 들어간다. 안에서 누르면 원래 자리로 간다 |
| Tab               | 영역 안의 동작 버튼과 닫기 버튼을 돈다                          |
| Escape            | 원래 자리로 돌아간다. 열린 대화상자는 닫지 않는다               |

- 포커스가 있던 알림이 닫히면 포커스는 원래 자리로, 그곳이 없으면 알림 영역으로 갑니다.

## 상태

| 속성                 | 붙는 곳                                  |
| -------------------- | ---------------------------------------- |
| `data-toaster`       | 알림 영역을 품은 live region             |
| `data-placement`     | 알림 영역                                |
| `data-expanded`      | 펼쳐진 알림 영역과 알림                  |
| `data-front`         | 맨 앞 알림                               |
| `data-visible`       | `max` 안에 드는 알림                     |
| `data-loading`       | loading 알림                             |
| `data-swiping`       | 밀고 있는 알림                           |
| `data-swipe-out`     | 밀려 나가는 알림(`x` / `y`)              |
| `data-ending-style`  | 닫히는 애니메이션 중인 알림              |
| `data-color-scheme`  | 알림의 의미                              |

- 알림마다 `--toasts-before`(앞에 있는 알림 수), `--offset`(펼쳤을 때의 거리), `--initial-height`(제 높이)가, 영역에 `--front-toast-height`, `--gap` 이 붙습니다.

## 알아둘 것

- 서버 렌더 결과에는 아무것도 없습니다. 알림 영역은 브라우저에서 그려지고, 알림이 있는 동안만 top layer 에 올라옵니다.
- 알림이 없을 때 영역은 역할(`region`, `status`, `alert`)을 드러내지 않습니다.
- 알림 영역은 늘 `aria-live` 라서 열린 대화상자가 나머지 페이지를 `aria-hidden` 으로 숨길 때도 숨지 않습니다.
- `max` 를 넘어 숨은 알림은 `inert` 라서 Tab 으로 닿지 않습니다.
- 애니메이션은 `prefers-reduced-motion` 이면 꺼집니다.
