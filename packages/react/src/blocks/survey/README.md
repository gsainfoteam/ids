# Survey

Storybook `Blocks/Survey/*`. 설문 화면 두 가지입니다.

| 구현       | 화면                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| `Form`     | 강의 평가. 별점, 한 개 고르기, 여러 개 고르기, 난이도 슬라이더, 서술형을 한 페이지에 둔다.        |
| `OneByOne` | 학생식당 만족도 조사. 한 화면에 한 문항, 답을 골라야 다음으로 가고, 끝나면 고맙다는 화면이 된다. |

- **쓰인 컴포넌트.** Card, Badge, Progress, Rating, RadioGroup, CheckboxGroup, Slider, TextArea, Field, Label, Item, Empty, Button, toast
- **알아둘 것.**
  - 문항 카드의 `Card.Title` 에 id 를 주고, 각 컨트롤이 `aria-labelledby` 로 그 문항을 이름으로 씁니다.
  - 위의 진행 막대는 답한 문항 수를 셉니다. 슬라이더는 처음부터 값이 있어 답한 것으로 칩니다.
  - 슬라이더 눈금 라벨은 짧게 둡니다. 양 끝 라벨은 트랙 끝을 가운데로 놓여 긴 글자는 카드 밖으로 나갑니다.
  - OneByOne 의 선택지는 `Item asChild` 로 그린 `<label>` 에 Radio 를 담은 카드입니다. 문항이 바뀌면 `key` 로 RadioGroup 을 새로 그립니다.
