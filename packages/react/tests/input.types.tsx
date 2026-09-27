import { Input, type InputProps } from '../src/components/form/input';
export const native = <Input type="email" onChange={(event) => event.target.value} />;
export const numeric = <Input type="number" onValueChange={(value) => value?.toFixed(2)} />;
export const numericEvent = <Input type="number" onChange={(event) => event.target.value} />;
export const phone = <Input type="tel" onValueChange={(value) => value.trim()} />;
export const phoneEvent = <Input type="tel" onChange={(event) => event.target.value} />;
export const config: InputProps = { type: 'number', value: null, step: 0.1 };
// @ts-expect-error NumberField expects a number, not a string.
export const badNumber = <Input type="number" value="12" />;
// @ts-expect-error TelField reports E.164 strings, not numbers.
export const badTel = <Input type="tel" onValueChange={(value: number) => value} />;
// @ts-expect-error Dates use the dedicated DateField.
export const badType = <Input type="date" />;
// @ts-expect-error Underline is a text-only variant.
export const badVariant = <Input type="password" variant="underline" />;
