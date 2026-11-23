'use client';

import { TemporalContext } from './context';
import { useInternalTemporalFieldRoot } from './hooks/use-temporal-field-root';
import { TemporalClear } from './parts/clear';
import { TemporalContent } from './parts/content';
import { TemporalTrigger } from './parts/trigger';
import { FormValue } from '../parts/form-value';

import type { TemporalConfig, TemporalFieldProps } from './lib/types';

export function TemporalField<V>({
  config,
  variant = 'outline',
  required = false,
  readOnly = false,
  disabled = false,
  name,
  className,
  style,
  ...props
}: TemporalFieldProps<V> & { config: TemporalConfig<V> }) {
  const { context, state, slots, resolvedSize, rootRef, controlRef, styles } =
    useInternalTemporalFieldRoot<V>({ ...props, config, variant, required, readOnly, disabled });

  return (
    <TemporalContext.Provider value={context}>
      <div
        ref={rootRef}
        {...{ [`data-${config.kind}-field`]: '' }}
        data-temporal-field={config.kind}
        data-size={resolvedSize}
        data-variant={variant}
        data-open={state.open ? '' : undefined}
        data-empty={state.empty ? '' : undefined}
        data-invalid={state.invalid ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-required={required ? '' : undefined}
        className={styles.root({
          className: typeof className === 'function' ? className(state) : className,
        })}
        style={typeof style === 'function' ? style(state) : style}
      >
        {slots.composed ? (
          <>
            {!slots.hasTrigger && !slots.hasInput && <TemporalTrigger />}
            {slots.shell}
            {!slots.hasTrigger && slots.hasInput && <TemporalTrigger />}
          </>
        ) : (
          <>
            <TemporalTrigger />
            <TemporalClear />
          </>
        )}
        <FormValue
          name={name}
          form={props.form}
          value={state.empty ? null : config.serialize(state.value)}
          required={required}
          disabled={disabled}
          anchor={controlRef}
        />
      </div>
      {slots.contents.length ? slots.contents : <TemporalContent />}
    </TemporalContext.Provider>
  );
}
