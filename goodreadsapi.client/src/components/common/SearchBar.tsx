import { Search } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface SearchBarProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder,
}: SearchBarProps) {
  const { t, ui } = useLanguage();
  const resolvedPlaceholder = placeholder ?? t(ui.common.searchPlaceholder);

  return (
    <label className="search-bar">
      <Search size={18} />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={resolvedPlaceholder}
        aria-label={resolvedPlaceholder}
      />
    </label>
  );
}
