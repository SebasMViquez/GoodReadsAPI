import { EmptyState } from '@/components/common/EmptyState';
import { useLanguage } from '@/context/LanguageContext';

export function NotFoundPage() {
  const { t, ui } = useLanguage();

  return (
    <section className="section page-top-spacing">
      <div className="container">
        <EmptyState
          title={t(ui.common.pageNotFoundTitle)}
          description={t(ui.common.pageNotFoundDescription)}
          actionLabel={t(ui.common.returnHome)}
          actionTo="/"
        />
      </div>
    </section>
  );
}
