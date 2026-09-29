import { InputRoot, type InputProps } from './root';

export function Input(props: InputProps) {
  return <InputRoot {...props} />;
}

export namespace Input {
  export type Props = InputProps;
}

export { type InputProps } from './root';
