# TelField

Native `input type="tel"`에 국가 선택과 점진적인 번호 포맷을 제공합니다. 국제 전화번호 메타데이터와 포맷은 libphonenumber-js/min을 사용합니다.

```tsx
<Field>
  <Field.Label>전화번호</Field.Label>
  <TelField value={phone} onChange={setPhone} defaultCountry="KR" name="tel">
    <TelField.CountrySelect />
    <TelField.Input />
  </TelField>
</Field>
```

- value/defaultValue/onChange는 문자열입니다. auto는 지역 표시 문자열(예: 010-1234-5678), international 또는 CountrySelect 선언 시 국제 값(예: +821012345678)을 반환합니다. 입력 중에는 미완성 번호도 허용합니다. 완성도/유효성은 앱에서 검증하세요.
- format=none은 CountrySelect가 없을 때 입력을 그대로 유지합니다. 국가 선택이 있으면 국제 값 계약이 우선합니다. auto/international은 전각 숫자를 정규화하고 숫자 및 선행 +만 남깁니다.
- defaultCountry의 기본값은 SSR과 클라이언트가 동일한 KR입니다. 서비스의 locale에서 ISO alpha-2 코드를 구해 명시하세요. 국가 목록은 라이브러리가 지원하는 전체 국가이며 ISO 코드와 통화 코드를 검색합니다.
- 국가 변경 시 국가 번호를 바꾸고 나머지 유효숫자를 유지합니다. 실제 번호의 유효성이 보장되지는 않습니다. CountrySelect는 Select를 사용합니다.
- variant: outline/filled/unstyled. size: standard/tiny (Field 상속). disabled/readOnly는 입력과 국가 선택에 함께 적용됩니다.
- children 생략 시 Input 자동 생성. 명시 합성은 직접 자식/Fragment에 Input 한 개를 포함해야 합니다. Input asChild는 native input으로 props/ref를 전달해야 합니다. CountrySelect asChild는 button을 전달합니다.
- id/ref/ARIA/native 입력 속성은 실제 tel input에 전달됩니다. autoComplete=tel, inputMode=tel이 기본입니다. name/form은 정규화된 값 하나를 hidden input으로 제출합니다.
- IME 조합 종료 후 포맷합니다. 입력 중 커서의 숫자 위치를 보존하며 구분자 삭제가 반복 삽입으로 막히지 않게 처리합니다.
- native form.reset은 uncontrolled 기본값/국가로 돌아갑니다. controlled 값 변경은 부모가 관리합니다. 외부 value 업데이트로 onChange를 발생시키지 않습니다.
- RHF: 선택적 react-hook-form 엔트리의 Field에 `controlMode="value"`와 defaultValues `{phone:''}`를 지정하세요. Zod 또는 `registerOptions`로 검증하며 오류 시 ref가 실제 input에 포커스를 줍니다.
