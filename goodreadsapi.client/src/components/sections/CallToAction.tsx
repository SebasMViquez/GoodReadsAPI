import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

export function CallToAction() {
  const { t } = useLanguage();

  return (
    <section className="section">
      <div className="container">
        <div className="cta-panel">
          <div>
            <span className="eyebrow">
              {t({
                en: 'Build your signature shelf',
                es: 'Construye tu estante distintivo',
              })}
            </span>
            <h2>
              {t({
                en: 'Track what you crave, what you are reading, and what changed you.',
                es: 'Sigue lo que deseas leer, lo que estas leyendo y lo que te transformo.',
              })}
            </h2>
            <p>
              {t({
                en: 'Save books into thoughtful lists, surface standout reviews, and make your reading identity feel as intentional as the stories you choose.',
                es: 'Guarda libros en listas cuidadas, destaca resenas potentes y haz que tu identidad lectora se sienta tan intencional como las historias que eliges.',
              })}
            </p>
          </div>
          <Link className="button button--primary" to="/library">
            {t({ en: 'Enter my library', es: 'Entrar a mi biblioteca' })}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
