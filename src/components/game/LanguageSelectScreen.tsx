import React from 'react';
import { useI18n, Language, LANGUAGE_NAMES } from '@/utils/i18n';
import { getStoredFlag, setStoredFlag } from '@/utils/storage';

const FIRST_LAUNCH_KEY = 'neon_breaker_lang_chosen';

export const hasChosenLanguage = (): boolean => getStoredFlag(FIRST_LAUNCH_KEY, true);

const markChosen = () => setStoredFlag(FIRST_LAUNCH_KEY);

const OPTIONS: Language[] = ['en', 'hi', 'es', 'fr', 'pt', 'ar'];

interface Props {
  onDone: () => void;
}

const LanguageSelectScreen: React.FC<Props> = ({ onDone }) => {
  const { setLang } = useI18n();

  const choose = (lang: Language) => {
    setLang(lang);
    markChosen();
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6"
      style={{ background: 'radial-gradient(circle at 50% 30%, hsl(240,60%,12%), hsl(240,80%,3%))' }}
    >
      <h1 className="font-display text-3xl text-neon-cyan text-glow-cyan mb-2">🌐 Choose Language</h1>
      <p className="text-foreground/70 text-sm mb-8">Select your preferred language</p>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {OPTIONS.map(lang => (
          <button
            key={lang}
            onClick={() => choose(lang)}
            className="py-4 px-3 rounded-xl border border-neon-cyan/30 bg-card/60 hover:bg-card hover:border-neon-cyan transition-all font-display text-base text-foreground active:scale-95"
          >
            {LANGUAGE_NAMES[lang]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelectScreen;
