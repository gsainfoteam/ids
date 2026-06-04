export function Spacer({ className }: Spacer.Props) {
  return <div className={`flex-1 ${className ?? ''}`} />;
}

export namespace Spacer {
  export type Props = {
    className?: string;
  };
}
