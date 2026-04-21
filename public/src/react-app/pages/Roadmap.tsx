import Navigation from "@/react-app/components/Navigation";
import Footer from "@/react-app/components/Footer";
import { Card } from "@/react-app/components/ui/card";
import { useLanguage } from "@/react-app/hooks/useLanguage";

export default function RoadmapPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-emerald-950/20">
      <Navigation />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-4xl font-bold mb-3">{language === "pt" ? "Roadmap" : "Roadmap"}</h1>
        <p className="text-muted-foreground mb-8">
          {language === "pt"
            ? "Timeline transparente de desenvolvimento do ecossistema Pozzer."
            : "Transparent development timeline for the Pozzer ecosystem."}
        </p>
        <div className="grid gap-4">
          {[
            "Phase 1: Foundation",
            "Phase 2: Development",
            "Phase 3: Beta",
            "Phase 4: Mainnet Launch",
          ].map((phase) => (
            <Card key={phase} className="p-5">
              <div className="font-semibold">{phase}</div>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
