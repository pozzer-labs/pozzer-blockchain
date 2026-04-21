import { Rocket } from 'lucide-react';
import { Button } from '@/react-app/components/ui/button';
import { useLanguage } from '@/react-app/hooks/useLanguage';

export default function TestnetBanner() {
  const { t } = useLanguage();

  return (
    <div className="relative border border-cyan-500/30 rounded-2xl p-6 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 mb-8">
      <div className="flex items-start gap-4">
        <Rocket className="w-8 h-8 text-emerald-300 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <svg className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-bold text-emerald-300" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t('explorer.banner.title')}
            </h2>
          </div>
          <p className="text-muted-foreground">
            {t('explorer.banner.desc')}
          </p>
        </div>
        <Button variant="outline" className="border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10">
          [ {t('explorer.banner.cta')} ]
        </Button>
      </div>
    </div>
  );
}
