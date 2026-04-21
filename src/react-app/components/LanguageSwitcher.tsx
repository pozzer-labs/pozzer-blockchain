import { useLanguage } from '@/react-app/hooks/useLanguage';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
      className="px-3 py-1 text-sm border border-cyan-500/30 rounded hover:border-cyan-500/60 hover:bg-cyan-500/10 transition-all"
    >
      {language === 'pt' ? 'EN' : 'PT'}
    </button>
  );
}
