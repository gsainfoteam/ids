'use client';

import { Chip } from '../../../data/chip';
import { useInternalChip } from '../context';

const cancelChipFocusMove = (event: Chip.RemoveEvent) => event.preventDefault();

export function ChipValues() {
  const c = useInternalChip('Chips');
  return c.field.state.selected.map((item) => {
    const option = c.options.find((candidate) => candidate.value === item);
    const label = option?.label ?? item;
    const removable = !c.field.state.blocked && !option?.disabled;
    return (
      <Chip
        key={item}
        size={c.size}
        disabled={option?.disabled}
        data-chip-field-chip=""
        className={c.styles.chip()}
        onRemove={
          removable
            ? (event) => {
                cancelChipFocusMove(event);
                c.field.handlers.onChipRemove(item);
              }
            : undefined
        }
      >
        {label}
        {removable && (
          <Chip.Close
            tabIndex={-1}
            aria-label={c.removeLabel(label)}
            data-chip-field-remove={item}
            data-field-input=""
            className={c.styles.chipRemove()}
            onKeyDown={(event) => c.field.handlers.onChipKeyDown(event, item)}
          />
        )}
      </Chip>
    );
  });
}
