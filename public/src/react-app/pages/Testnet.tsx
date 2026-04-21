import Navigation from "@/react-app/components/Navigation";
import Footer from "@/react-app/components/Footer";
import WalletConnectionOverlay from "@/react-app/components/WalletConnectionOverlay";
import { useWallet } from "@/react-app/hooks/useWallet";
import { useLanguage } from "@/react-app/hooks/useLanguage";

export default function TestnetPage() {
  const { t } = useLanguage();
  const { isConnected, isConnecting, connectEVM } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {!isConnected && (
        <WalletConnectionOverlay onConnect={connectEVM} isConnecting={isConnecting} />
      )}
      <main className={`max-w-6xl mx-auto px-6 pt-28 pb-16 ${!isConnected ? "blur-sm pointer-events-none" : ""}`}>
        <h1 className="text-4xl font-bold mb-3">{t("testnet.hero.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("testnet.hero.subtitle")}</p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-card border border-border">XP Missions</div>
          <div className="p-5 rounded-xl bg-card border border-border">Leaderboard</div>
          <div className="p-5 rounded-xl bg-card border border-border">Referral Program</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
