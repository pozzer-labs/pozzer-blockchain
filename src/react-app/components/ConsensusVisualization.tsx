import { useState, useEffect } from 'react';
import { Shield, Activity } from 'lucide-react';
import { useLanguage } from '@/react-app/hooks/useLanguage';

interface Validator {
  id: number;
  name: string;
  validator_address: string;
  location: string;
  status: string;
  is_active: number;
}

export default function ConsensusVisualization() {
  const { t } = useLanguage();
  const [validators, setValidators] = useState<Validator[]>([]);
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate dynamic consensus progress animation
  const [currentVotes, setCurrentVotes] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 33.33; // Simulate validator votes
      });
      // Simulate votes cycling 0 -> 1 -> 2 -> 0
      setCurrentVotes(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const validatorsRes = await fetch('/api/validators');
      const validatorsData = await validatorsRes.json();
      // Ensure we always have an array
      setValidators(Array.isArray(validatorsData) ? validatorsData : []);
    } catch (error) {
      console.error('Error fetching consensus data:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {t('explorer.consensus.title')}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">{t('explorer.consensus.subtitle')}</p>
      </div>

      <div className="mb-6">
        <div className="text-xs sm:text-sm text-muted-foreground mb-2">{t('explorer.consensus.progress')}</div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="text-sm sm:text-lg">
            <span className="font-bold text-emerald-300">{currentVotes}</span>
            <span className="text-muted-foreground"> / 2 {t('explorer.consensus.votes')}</span>
          </div>
          <div className="flex-1 h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-300 to-green-400 transition-all duration-500 rounded-full"
              style={{ width: `${(currentVotes / 2) * 100}%` }}
            />
          </div>
          <div className={`text-xs px-2 py-1 rounded w-fit ${currentVotes >= 2 ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'}`}>
            {currentVotes >= 2 ? t('explorer.consensus.finalized') : t('explorer.consensus.validating')}
          </div>
        </div>
      </div>

      {/* Validators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {validators.map((validator, index) => (
          <div key={validator.id} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-card/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 hover:border-cyan-500/30 transition-all">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base mb-1 truncate">{validator.name}</h3>
                  <div className="text-xs text-muted-foreground">{t('explorer.validator')} {index + 1}</div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-300" />
                <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-300 to-blue-500 transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, (localProgress + (index * 15)) % 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
