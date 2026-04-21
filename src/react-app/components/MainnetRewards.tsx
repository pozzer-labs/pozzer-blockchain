import { useLanguage } from "@/react-app/hooks/useLanguage";

interface Tier {
  id: string;
  name: string;
  xp: number;
  icon: string;
  boost: string;
  rewards: string[];
  color: string;
  glowColor: string;
}

interface MainnetRewardsProps {
  currentXP: number;
}

export default function MainnetRewards({ currentXP }: MainnetRewardsProps) {
  const { t } = useLanguage();

  const tiers: Tier[] = [
    {
      id: "explorer",
      name: t("testnet.rewards.explorer"),
      xp: 500,
      icon: "🌱",
      boost: "1x",
      rewards: [
        t("testnet.rewards.explorerReward1"),
        t("testnet.rewards.explorerReward2"),
      ],
      color: "emerald",
      glowColor: "rgba(16, 185, 129, 0.3)",
    },
    {
      id: "operator",
      name: t("testnet.rewards.operator"),
      xp: 1500,
      icon: "⚡",
      boost: "1.3x",
      rewards: [
        t("testnet.rewards.operatorReward1"),
        t("testnet.rewards.operatorReward2"),
        t("testnet.rewards.operatorReward3"),
      ],
      color: "sky",
      glowColor: "rgba(14, 165, 233, 0.3)",
    },
    {
      id: "validator",
      name: t("testnet.rewards.validator"),
      xp: 3000,
      icon: "🔧",
      boost: "1.6x",
      rewards: [
        t("testnet.rewards.validatorReward1"),
        t("testnet.rewards.validatorReward2"),
        t("testnet.rewards.validatorReward3"),
        t("testnet.rewards.validatorReward4"),
      ],
      color: "violet",
      glowColor: "rgba(139, 92, 246, 0.3)",
    },
    {
      id: "genesis",
      name: t("testnet.rewards.genesis"),
      xp: 6000,
      icon: "💎",
      boost: "2x",
      rewards: [
        t("testnet.rewards.genesisReward1"),
        t("testnet.rewards.genesisReward2"),
        t("testnet.rewards.genesisReward3"),
        t("testnet.rewards.genesisReward4"),
        t("testnet.rewards.genesisReward5"),
      ],
      color: "amber",
      glowColor: "rgba(245, 158, 11, 0.3)",
    },
  ];

  const getCurrentTier = () => {
    if (currentXP >= 6000) return "genesis";
    if (currentXP >= 3000) return "validator";
    if (currentXP >= 1500) return "operator";
    if (currentXP >= 500) return "explorer";
    return null;
  };

  const currentTier = getCurrentTier();

  return (
    <div className="mb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {t("testnet.rewards.title")}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t("testnet.rewards.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const isActive = currentTier === tier.id;
            const isLocked = currentXP < tier.xp;

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border-2 p-6 transition-all duration-300 ${
                  isActive
                    ? `border-${tier.color}-500 bg-${tier.color}-500/10`
                    : isLocked
                    ? "border-zinc-800 bg-zinc-900/50 opacity-60"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }`}
                style={
                  isActive
                    ? {
                        boxShadow: `0 0 30px ${tier.glowColor}`,
                      }
                    : undefined
                }
              >
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-xs font-bold text-black">
                    {t("testnet.rewards.yourTier")}
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{tier.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {tier.name}
                  </h3>
                  <div className="text-sm text-gray-400">
                    {tier.xp.toLocaleString()} XP
                  </div>
                </div>

                <div className="mb-4 text-center">
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      isActive
                        ? `bg-${tier.color}-500 text-black`
                        : "bg-zinc-700 text-gray-300"
                    }`}
                  >
                    {tier.boost} {t("testnet.rewards.boost")}
                  </div>
                </div>

                <div className="space-y-2">
                  {tier.rewards.map((reward, idx) => (
                    <div
                      key={idx}
                      className="flex items-start text-sm text-gray-300"
                    >
                      <span
                        className={`mr-2 mt-0.5 ${
                          isActive ? `text-${tier.color}-400` : "text-gray-500"
                        }`}
                      >
                        •
                      </span>
                      <span>{reward}</span>
                    </div>
                  ))}
                </div>

                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🔒</div>
                      <div className="text-xs text-gray-400">
                        {t("testnet.rewards.needsXP").replace("{{xp}}", tier.xp.toLocaleString())}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/30">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="text-white font-bold mb-1">
                {t("testnet.rewards.tipTitle")}
              </h4>
              <p className="text-gray-300 text-sm">
                {t("testnet.rewards.tipDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
