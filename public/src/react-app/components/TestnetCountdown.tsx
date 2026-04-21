import { useState, useEffect } from 'react';
import { useLanguage } from '@/react-app/hooks/useLanguage';
import { Button } from '@/react-app/components/ui/button';
import { Input } from '@/react-app/components/ui/input';
import DpossAICube from '@/react-app/components/DpossAICube';
import { Twitter, Send } from 'lucide-react';

interface TestnetCountdownProps {
  onUnlock: () => void;
}

export default function TestnetCountdown({ onUnlock }: TestnetCountdownProps) {
  const { t } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [unlockDate, setUnlockDate] = useState<Date | null>(null);

  useEffect(() => {
    // Check lock status
    fetch('/api/testnet/lock-status')
      .then(res => res.json())
      .then(data => {
        setIsLocked(data.locked);
        if (data.unlockDate) {
          setUnlockDate(new Date(data.unlockDate));
        }
        if (!data.locked) {
          onUnlock();
        }
      })
      .catch(console.error);
  }, [onUnlock]);

  useEffect(() => {
    if (!unlockDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = unlockDate.getTime();
      const distance = target - now;

      if (distance < 0) {
        setIsLocked(false);
        onUnlock();
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockDate, onUnlock]);

  const handlePasswordSubmit = async () => {
    setError('');
    try {
      const response = await fetch('/api/testnet/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLocked(false);
        onUnlock();
      } else {
        setError(t('testnet.countdown.wrongPassword'));
      }
    } catch (err) {
      setError(t('testnet.countdown.error'));
    }
  };

  if (!isLocked) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 3D Cube */}
        <div className="flex justify-center">
          <DpossAICube size={180} />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-300">
            {t('testnet.countdown.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('testnet.countdown.description')}
          </p>
        </div>

        {/* Countdown Timer */}
        {unlockDate && (
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
            {[
              { value: timeRemaining.days, label: t('testnet.countdown.days') },
              { value: timeRemaining.hours, label: t('testnet.countdown.hours') },
              { value: timeRemaining.minutes, label: t('testnet.countdown.minutes') },
              { value: timeRemaining.seconds, label: t('testnet.countdown.seconds') },
            ].map((item, idx) => (
              <div key={idx} className="bg-card border border-emerald-500/20 rounded-lg p-4">
                <div className="text-4xl font-bold text-emerald-300">{item.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Password Access */}
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-px bg-border my-8" />
          <p className="text-sm text-muted-foreground">
            {t('testnet.countdown.earlyAccess')}
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder={t('testnet.countdown.enterPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="bg-background border-emerald-500/20"
            />
            <Button onClick={handlePasswordSubmit} className="bg-emerald-600 hover:bg-emerald-700">
              {t('testnet.countdown.unlock')}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Social Links */}
        <div className="space-y-4 pt-8">
          <p className="text-sm text-muted-foreground">
            {t('testnet.countdown.followUs')}
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://x.com/pozzer_depin"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-card border border-emerald-500/20 rounded-lg hover:bg-emerald-500/10 transition-colors"
            >
              <Twitter className="w-5 h-5 text-emerald-300" />
            </a>
            <a
              href="https://t.me/pozzerpt"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-card border border-emerald-500/20 rounded-lg hover:bg-emerald-500/10 transition-colors"
            >
              <Send className="w-5 h-5 text-emerald-300" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
