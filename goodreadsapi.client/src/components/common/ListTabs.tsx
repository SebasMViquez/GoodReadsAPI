import { useId, useRef } from 'react';

interface ListTabItem<T extends string> {
  value: T;
  label: string;
  helper?: string;
}

interface ListTabsProps<T extends string> {
  items: Array<ListTabItem<T>>;
  value: T;
  onChange: (value: T) => void;
}

export function ListTabs<T extends string>({
  items,
  value,
  onChange,
}: ListTabsProps<T>) {
  const tablistId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    const nextIndex = (index + items.length) % items.length;
    tabRefs.current[nextIndex]?.focus();
    onChange(items[nextIndex].value);
  };

  return (
    <div className="list-tabs" role="tablist" aria-label="Library views">
      {items.map((item, index) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          id={`${tablistId}-tab-${item.value}`}
          aria-selected={value === item.value}
          tabIndex={value === item.value ? 0 : -1}
          className={value === item.value ? 'list-tabs__item list-tabs__item--active' : 'list-tabs__item'}
          onClick={() => onChange(item.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
              event.preventDefault();
              focusTab(index + 1);
            }

            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
              event.preventDefault();
              focusTab(index - 1);
            }

            if (event.key === 'Home') {
              event.preventDefault();
              focusTab(0);
            }

            if (event.key === 'End') {
              event.preventDefault();
              focusTab(items.length - 1);
            }
          }}
          ref={(node) => {
            tabRefs.current[index] = node;
          }}
        >
          <span>{item.label}</span>
          {item.helper ? <small>{item.helper}</small> : null}
        </button>
      ))}
    </div>
  );
}
