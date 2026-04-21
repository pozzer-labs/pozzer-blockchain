import { Link } from "react-router";
import { useLanguage } from "@/react-app/hooks/useLanguage";
import LanguageSwitcher from "@/react-app/components/LanguageSwitcher";
import Footer from "@/react-app/components/Footer";
import ConsensusVisualization from "@/react-app/components/ConsensusVisualization";
import { useTestnetPolling } from "@/react-app/hooks/useTestnetPolling";
import { Card } from "@/react-app/components/ui/card";

export default function ExplorerPage() {
  const { t } = useLanguage();
  const { blocks, stats, isConnected } = useTestnetPolling();
  const currentBlock = blocks[0]?.height ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-950/20">
      <header className="border-b border-white/10 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-emerald-300">POZZER</Link>
          <div className="flex items-center gap-4 text-sm">
            <span className={isConnected ? "text-emerald-300" : "text-muted-foreground"}>
              {isConnected ? t("explorer.testnetOnline") : t("explorer.disconnectedStatus")}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("explorer.liveNetwork")}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">{t("explorer.blocksValidated")}</div>
            <div className="text-2xl font-bold">{currentBlock.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">{t("explorer.nodes")}</div>
            <div className="text-2xl font-bold">{stats?.active_nodes ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">{t("explorer.uptime")}</div>
            <div className="text-2xl font-bold">{(stats?.network_uptime ?? 0).toFixed(2)}%</div>
          </Card>
        </div>
        <ConsensusVisualization />
      </main>

      <Footer />
    </div>
  );
}
