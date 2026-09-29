import { Button, DateField, Dialog, Field, Menu, Select, TextField } from '@gsainfoteam/ids-react';

import { ToastButton } from './toast-button';

export default function Page() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 p-8">
      <h1 className="text-headline-h3-bold">IDS + Next.js App Router</h1>

      <section className="flex flex-wrap gap-2">
        <Button>저장</Button>
        <Button variant="glossy">구매</Button>
        <Button variant="outline">취소</Button>
        <ToastButton />
      </section>

      <Dialog>
        <Dialog.Trigger asChild>
          <Button variant="outline">프로필 수정</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>프로필 수정</Dialog.Title>
            <Dialog.Description>바꾼 내용은 저장을 눌러야 반영됩니다.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close>취소</Dialog.Close>
            <Dialog.Close asChild>
              <Button>저장</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <form className="flex flex-col gap-4">
        <Field>
          <Field.Label>이름</Field.Label>
          <TextField name="name" />
        </Field>
        <Field>
          <Field.Label>예약 날짜</Field.Label>
          <DateField name="date" />
        </Field>
        <Field>
          <Field.Label>과일</Field.Label>
          <Select name="fruit" placeholder="과일을 고르세요">
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="cherry">체리</Select.Item>
            <Select.Item value="grape">포도</Select.Item>
          </Select>
        </Field>
        <Button type="submit">보내기</Button>
      </form>

      <Menu>
        <Menu.Trigger asChild>
          <Button variant="outline">편집</Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item>복사</Menu.Item>
          <Menu.Item disabled>붙여넣기</Menu.Item>
          <Menu.Separator />
          <Menu.Item>삭제</Menu.Item>
        </Menu.Content>
      </Menu>
    </main>
  );
}
