'use client';

import { useId, type ComponentProps, type ReactElement, type ReactNode } from 'react';

import { SidebarGroupContext, useInternalSidebarContext } from '../context';
import { SidebarGroupLabel } from './group-label';
import { SidebarGroupTree } from './group-tree';
import { SidebarList } from './list';
import { useControllableState } from '../../../../hooks/use-controllable-state';
import { flattenFragments } from '../../../../utils';
import { Accordion } from '../../../data/accordion';
import { isType } from '../lib/is-type';

export type SidebarGroupCollapse = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type SidebarGroupProps = ComponentProps<'section'> & {
  collapse?: SidebarGroupCollapse;
};

const GROUP = 'group';
const NOT_COLLAPSIBLE: SidebarGroupCollapse = {};

function splitBody(nodes: ReactNode[]) {
  const body: ReactNode[] = [];
  let run: ReactNode[] = [];

  const closeRun = () => {
    if (run.length > 0) body.push(<SidebarList key={`list-${body.length}`}>{run}</SidebarList>);
    run = [];
  };

  for (const node of nodes) {
    if (isType(SidebarGroupTree)(node)) {
      closeRun();
      body.push(node);
    } else run.push(node);
  }
  closeRun();

  return body;
}

export function SidebarGroup({ collapse, className, children, ...props }: SidebarGroupProps) {
  const { styles, rail } = useInternalSidebarContext('Sidebar.Group');
  const labelId = useId();
  const nodes = flattenFragments(children);
  const label = nodes.find(isType(SidebarGroupLabel)) as ReactElement | undefined;
  const body = splitBody(nodes.filter((node) => node !== label));

  const { open, defaultOpen = true, onOpenChange } = collapse ?? NOT_COLLAPSIBLE;
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });
  const collapses = collapse !== undefined && label !== undefined && !rail;

  return (
    <section
      {...props}
      aria-labelledby={label !== undefined && !collapses ? labelId : props['aria-labelledby']}
      data-sidebar-group=""
      className={styles.group({ className })}
    >
      {collapses ? (
        <Accordion
          type="single"
          collapsible
          value={isOpen ? GROUP : null}
          onValueChange={(value) => setOpen(value === GROUP)}
          variant="ghost"
          size="tiny"
        >
          <Accordion.Item value={GROUP}>
            <Accordion.Header asChild>
              <div>
                <Accordion.Trigger className={styles.groupTrigger()}>
                  <SidebarGroupContext value={{ labelId, inTrigger: true }}>
                    {label}
                  </SidebarGroupContext>
                </Accordion.Trigger>
              </div>
            </Accordion.Header>
            <Accordion.Content className="p-0">{body}</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      ) : (
        <SidebarGroupContext value={{ labelId, inTrigger: false }}>
          {label}
          {body}
        </SidebarGroupContext>
      )}
    </section>
  );
}
