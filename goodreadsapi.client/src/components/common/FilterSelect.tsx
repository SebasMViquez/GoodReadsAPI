import { ChevronDown } from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface FilterSelectOption<T extends string> {
  value: T;
  label: string;
}

interface FilterSelectProps<T extends string> {
  options: Array<FilterSelectOption<T>>;
  value: T;
  onChange: (value: T) => void;
  icon?: ReactNode;
  ariaLabel: string;
  compact?: boolean;
}

export function FilterSelect<T extends string>({
  options,
  value,
  onChange,
  icon,
  ariaLabel,
  compact = false,
}: FilterSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = useId();
  const selectedIndex = useMemo(
    () => Math.max(0, options.findIndex((option) => option.value === value)),
    [options, value],
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveIndex(selectedIndex);
    window.requestAnimationFrame(() => {
      optionRefs.current[selectedIndex]?.focus();
    });
  }, [open, selectedIndex]);

  const closeMenu = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveActiveIndex = (nextIndex: number) => {
    const normalizedIndex = (nextIndex + options.length) % options.length;
    setActiveIndex(normalizedIndex);
    optionRefs.current[normalizedIndex]?.focus();
  };

  const openMenu = (targetIndex = selectedIndex) => {
    setActiveIndex(targetIndex);
    setOpen(true);
  };

  return (
    <div
      ref={rootRef}
      className={`filter-select${compact ? ' filter-select--compact' : ''}${open ? ' filter-select--open' : ''}`}
    >
      <button
        type="button"
        className="filter-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => {
          if (open) {
            closeMenu();
            return;
          }

          openMenu();
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openMenu((selectedIndex + 1) % options.length);
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            openMenu((selectedIndex - 1 + options.length) % options.length);
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openMenu();
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
          }
        }}
        ref={triggerRef}
      >
        {icon ? <span className="filter-select__icon">{icon}</span> : null}
        <span className="filter-select__label">{selectedOption?.label}</span>
        <ChevronDown size={16} className="filter-select__chevron" />
      </button>

      {open ? (
        <div
          className="filter-select__menu"
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={`${listId}-option-${options[activeIndex]?.value ?? selectedOption?.value}`}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              id={`${listId}-option-${option.value}`}
              aria-selected={option.value === value}
              className={
                option.value === value
                  ? 'filter-select__option filter-select__option--active'
                  : 'filter-select__option'
              }
              onClick={() => {
                onChange(option.value);
                closeMenu();
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  moveActiveIndex(index + 1);
                }

                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  moveActiveIndex(index - 1);
                }

                if (event.key === 'Home') {
                  event.preventDefault();
                  moveActiveIndex(0);
                }

                if (event.key === 'End') {
                  event.preventDefault();
                  moveActiveIndex(options.length - 1);
                }

                if (event.key === 'Escape') {
                  event.preventDefault();
                  closeMenu();
                }

                if (event.key === 'Tab') {
                  setOpen(false);
                }

                if ((event.key === 'Enter' || event.key === ' ') && option.value !== value) {
                  event.preventDefault();
                  onChange(option.value);
                  closeMenu();
                }
              }}
              tabIndex={index === activeIndex ? 0 : -1}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
