import type { PropsWithChildren } from 'react';

interface SidebarPanelProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function SidebarPanel({
  title,
  description,
  children,
}: SidebarPanelProps) {
  return (
    <aside className="sidebar-panel">
      <div className="sidebar-panel__header">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </aside>
  );
}
