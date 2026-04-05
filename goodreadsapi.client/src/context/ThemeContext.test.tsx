import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { preferencesStore } from '@/services/storage/preferencesStore';

vi.mock('@/services/storage/preferencesStore', () => ({
  preferencesStore: {
    getTheme: vi.fn(),
    setTheme: vi.fn(),
  },
}));

function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(preferencesStore.getTheme).mockReturnValue('light');
  });

  it('restores the saved theme and persists updates', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: 'light' });
    expect(document.documentElement.dataset.theme).toBe('light');

    fireEvent.click(button);

    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(preferencesStore.setTheme).toHaveBeenLastCalledWith('dark');
  });
});
