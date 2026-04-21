import { Link } from "react-router";
import { useLanguage } from "@/react-app/hooks/useLanguage";
import Navigation from "@/react-app/components/Navigation";
import Footer from "@/react-app/components/Footer";
import { Button } from "@/react-app/components/ui/button";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-950/20">
      <Navigation />
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-emerald-300 to-blue-500 bg-clip-text text-transparent">
            {t("hero.title")}
          </span>
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">{t("hero.subtitle")}</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/explorer">{t("hero.cta")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/testnet">Testnet</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
