# ColorField

색상 미리보기와 값 표시, Clear 버튼 및 색상 선택 팝업을 합성합니다.

```tsx
<Field>
  <Field.Label>브랜드 색상</Field.Label>
  <ColorField
    value={color}
    onChange={setColor}
    format="hex"
    alpha
    swatches={['#3B82F6', '#22C55E', '#F97316']}
  />
</Field>
```

- value/defaultValue/onChange는 문자열이며 빈 문자열은 선택 없음입니다. value를 생략하면 uncontrolled입니다. 팝업에서 편집하면 실시간 onChange, Esc/닫기/외부 클릭으로 닫습니다. Esc는 이미 변경한 색상을 되돌리지 않습니다.
- format: hex / rgb / hsl (기본 hex). alpha=true이면 #RRGGBBAA / rgba / hsla 형태로 값을 반환하고 투명도 슬라이더를 표시합니다. 정수 RGB 채널과 3자리 소수 alpha로 직렬화하므로 형식 간 변환에 반올림이 있습니다.
- HEX 3/4/6/8자리, rgb(a), hsl(a) 문자열 입력을 파싱합니다. CSS named color, var(), calc(), color()는 지원하지 않습니다. 불완전한 텍스트는 편집 중 유지하고 유효한 색만 콜백을 호출합니다. blur/Enter에서 형식을 정리합니다.
- variant는 색상 패널의 default / compact / swatchOnly입니다. default: 2D 채도/명도 + 색조 + 텍스트. compact는 2D 영역을 생략합니다. swatchOnly는 전달한 swatches만 보여줍니다. **표면 스타일은 surfaceVariant**=outline/filled/unstyled로 구분합니다.
- size는 standard/tiny이며 Field 크기를 상속합니다. default 영역 높이는 200/140px입니다.
- 2D 패널은 포인터 드래그와 방향키를 지원합니다. ←→ 채도, ↑↓ 명도, Shift는 10단위, Home/End는 채도 0/100입니다. 색조·투명도는 native range 키보드 동작을 사용합니다.
- Trigger/Value/Swatch/Content/Clear를 명시 합성하거나 자동 생성할 수 있습니다. asChild는 해당 element의 props/ref를 전달하는 단일 자식을 받습니다. **Clear는 Trigger의 형제**로 선언하세요. 버튼 안에 다른 버튼을 중첩하지 않습니다. Content의 사용자 children은 기본 패널을 대체합니다.
- Field의 id/ref/ARIA는 실제 trigger button에 연결됩니다. Clear는 값만 비우고 trigger에 초점을 돌려줍니다. disabled/readOnly는 팝업 열기·값 변경·지우기를 막습니다.
- mobileVariant=drawer는 640px 미만에서 하단 비모달 팝업입니다. 외부 포커스와 상호작용이 가능하며 배경 스크롤을 잠그지 않습니다. 기본은 anchor popover이며 지원 환경에서 native top layer를 사용합니다.
- name/form은 hidden input으로 정규화된 값 하나를 제출합니다. native reset은 uncontrolled 기본값으로 복원합니다. required는 ARIA 힌트입니다. button의 native constraint validation 대신 앱 검증을 사용하세요.
- RHF: `@gsainfoteam/ids-react/react-hook-form`의 Field에 `controlMode="value"`, defaultValues `{color:''}`를 지정하세요. Zod 또는 registerOptions로 검증하며 오류 시 trigger를 포커스합니다.
- 외부 value/format/alpha 변경은 표시를 정규화하지만 onChange를 호출하지 않습니다. 부모가 보관한 원본은 부모가 갱신하며 FormData는 표시 형식의 값을 제출합니다.
