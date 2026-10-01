# Agent

Storybook `Blocks/Agent/*`. AI 에이전트 화면 네 가지입니다.

| 구현      | 화면                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `Run`     | 실행 하나. 요청, 실행 기록(읽은 파일, 도구 호출, 견준 결과), 승인 요청, 진행 중 표시, 결과물. 옆에 계획과 문맥. |
| `Builder` | 에이전트 만들기. 이름, 모델, 지시문, 도구(물어보고 쓰는 도구 표시), 지식 문서, 대화 시작 문장, 미리 보기.        |
| `Queue`   | 에이전트 작업 목록. 하는 중, 기다리는 중, 끝남 탭. 승인 대기는 맨 위에 알리고 줄에서 바로 승인한다.             |
| `Ask`     | 대화 안에서 에이전트가 묻는 질문 셋. 고르거나 직접 적거나 건너뛰고, 끝나면 고른 답을 모아 보이고 이어서 일한다. |

- **쓰인 컴포넌트.** Breadcrumb, Badge, Button, IconButton, Item, Accordion, Table, Alert, Spinner, Card, Stepper, Progress, TextArea, TextField, Select, Switch, FileField, ChipField, Chip, Avatar, Tabs, Menu, RadioGroup, Field, Divider, Spacer, toast
- **대신 쓴 것.** shadcn/ui 와 AI Elements 의 에이전트 파트가 IDS 에는 아직 없습니다.
  - 계획(Plan), 할 일(Task): `Stepper` 의 진행 표시. 지금 단계가 현재 하는 일이다.
  - 실행 기록의 상태 줄(Marker): 아이콘을 둔 `Item size="tiny"`.
  - 도구 호출(Tool): `Accordion variant="soft"`. 넘긴 값은 `Table`.
  - 승인 요청(Confirmation): `Alert colorScheme="warning"` 과 `Alert.Actions`. 고른 뒤에는 success 나 neutral Alert 로 바뀐다.
  - 결과물(Artifact): 내려받기 버튼을 단 `Card`.
  - 문맥 사용량(Context): `Progress.Label` 과 `Progress.Value`.
  - 작업 목록(Queue): `Item.Group` 과 `Spinner`, `Progress`.
  - 질문지(Questionnaire): `RadioGroup` 을 `Item asChild` 로 그린 `<label>` 카드, 직접 적는 `TextField`, 이전, 건너뛰기, 다음 버튼.
- **알아둘 것.**
  - Run 의 계획은 넓은 화면에서 오른쪽에 붙어 따라오고, 좁은 화면에서는 실행 기록 위로 올라옵니다(`order-first lg:order-none`).
  - 물어보고 쓰는 도구는 Builder 와 Run 모두 warning 배지로 같은 말("물어보고 써요")을 씁니다.
  - Ask 는 문항이 바뀌면 `key` 로 RadioGroup 을 새로 그려 앞 문항의 선택이 남지 않게 합니다.
