import { Link } from "react-router";
import Navigation from "@/react-app/components/Navigation";
import Footer from "@/react-app/components/Footer";
import { Card } from "@/react-app/components/ui/card";

export default function TokenomicsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-emerald-950/20">
      <Navigation />
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-4xl font-bold mb-3">Tokenomics</h1>
        <p className="text-muted-foreground mb-8">
          Supply fixo de 200M PZR com distribuicao transparente.
        </p>
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            ["Total Supply", "200M PZR"],
            ["TGE Circulating", "22.5%"],
            ["Type", "Utility"],
            ["Blockchain", "Pozzer L1"],
          ].map(([label, value]) => (
            <Card key={label} className="p-5">
              <div className="text-sm text-muted-foreground">{label}</div>
              <div className="text-2xl font-bold">{value}</div>
            </Card>
          ))}
        </div>
        <Link to="/roadmap" className="text-emerald-300 hover:underline">Ver roadmap</Link>
      </main>
      <Footer />
    </div>
  );
}
