import { useState } from 'react';

import { Button } from '../button';

import { Dialog } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>팟 입장</Button>
        <Dialog open={open} onOpenChange={setOpen} role="alertdialog">
          <Dialog.Header>
            <Dialog.Title>입장하시겠습니까?</Dialog.Title>
          </Dialog.Header>
          <Dialog.Content>
            <div className="text-label space-y-2">
              <p>
                <strong>노선</strong> 송정역 → 지스트
              </p>
              <p>
                <strong>날짜</strong> 2025년 12월 13일 토요일
              </p>
              <p>
                <strong>시간</strong> 23:30~01:00
              </p>
            </div>
          </Dialog.Content>
          <Dialog.Footer>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              아니요
            </Button>
            <Button onClick={() => setOpen(false)}>네</Button>
          </Dialog.Footer>
        </Dialog>
      </>
    );
  },
};
