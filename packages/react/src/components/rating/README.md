# Rating

점수를 선택하거나 표시합니다. `ThemeProvider` 아래에서 사용합니다.

```tsx
<Rating defaultValue={3.5} step={0.5} aria-label="만족도" onChange={setScore} />
<Rating value={4.5} step={0.5} selectionMode="none" aria-label="평균 평점" />
```

- `value / defaultValue / onChange(number)`: controlled 또는 uncontrolled 값. 기본값 0.
- `max`: 양의 정수, 기본 5. `step`: 1 또는 0.5. 값은 범위 내 가장 가까운 step으로 보정합니다.
- `variant`: `star`(기본), `heart`, `circle`, `custom`. 별·하트는 Heroicons입니다.
- `size`: `standard / tiny`; Field 크기를 상속합니다.
- `selectionMode="none"`: 이름과 점수를 읽는 이미지로 표시하고 탭 정지점을 없앱니다.
- `readOnly`: 점수를 읽을 수 있는 탭 정지점 유지. `disabled`: 조작과 탭 이동, 폼 제출에서 제외.
- `onHover(number | null)`: 마우스 미리보기. 터치·키보드는 즉시 선택합니다.
- `getValueLabel(value, max)`: 각 선택지의 접근성 이름을 지역화합니다.
- `name / form`: hidden input을 통한 native FormData 및 form reset 지원.
- `ref`: 현재 선택된 실제 버튼(0점 포함). `required`는 접근성 상태이며, hidden input은 브라우저 필수값 검증을 하지 않으므로 폼 규칙으로 검증합니다.

반 점 모드에서 각 아이콘의 왼쪽/오른쪽 절반은 각각 0.5/1점입니다. 방향키는 step 단위로 이동하며 RTL 좌우 방향을 반영합니다. Home/0은 0점, End는 최댓값, 숫자 1–9는 해당 점수를 선택합니다. 경계에서는 순환하지 않고 멈춥니다. Space/Enter는 포커스된 값을 선택합니다. 선택값만 탭 정지점이며, 0점일 때 그룹 전체에 둥근 포커스가 표시됩니다.

```tsx
<FormField
  name="score"
  controlMode="value"
  registerOptions={{ min: { value: 1, message: '평점을 선택하세요.' } }}
>
  <FormField.Label>만족도</FormField.Label>
  <Rating step={0.5} />
  <FormField.Error />
</FormField>
```

커스텀 아이콘은 `variant="custom"`과 0부터 `max - 1`까지의 `Rating.Item index`로 전달합니다. `asChild`는 단일 장식 요소를 받습니다. 그래픽은 빈/채운 레이어에 두 번 렌더링되고 `inert`이므로 이벤트·ID·폼 컨트롤을 넣지 마세요. 점수 조작은 Rating이 소유합니다. 색상은 `--ids-rating-color`로 재정의할 수 있습니다.

```tsx
<Rating variant="custom" max={3}>
  {[0, 1, 2].map((index) => (
    <Rating.Item key={index} index={index} asChild>
      <CustomIcon />
    </Rating.Item>
  ))}
</Rating>
```
