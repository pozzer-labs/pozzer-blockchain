import { BrowserRouter as Router, Routes, Route } from "react-router";
import { LanguageProvider } from "@/react-app/hooks/useLanguage";
import { ThemeProvider } from "@/react-app/hooks/useTheme";
import { WalletProvider } from "@/react-app/hooks/useWallet";
import { Web3ModalProvider } from "@/react-app/providers/Web3ModalProvider";
import HomePage from "@/react-app/pages/Home";
import ExplorerPage from "@/react-app/pages/Explorer";
import TransactionDetailsPage from "@/react-app/pages/TransactionDetails";
import RoadmapPage from "@/react-app/pages/Roadmap";
import TokenomicsPage from "@/react-app/pages/Tokenomics";
import TestnetPage from "@/react-app/pages/Testnet";
import AdminPage from "@/react-app/pages/Admin";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Web3ModalProvider>
          <WalletProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explorer" element={<ExplorerPage />} />
                <Route path="/explorer/tx/:hash" element={<TransactionDetailsPage />} />
                <Route path="/roadmap" element={<RoadmapPage />} />
                <Route path="/tokenomics" element={<TokenomicsPage />} />
                <Route path="/testnet" element={<TestnetPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </Router>
          </WalletProvider>
        </Web3ModalProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
