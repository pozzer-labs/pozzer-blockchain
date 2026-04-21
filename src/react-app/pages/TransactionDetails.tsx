import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import LanguageSwitcher from "@/react-app/components/LanguageSwitcher";

interface TransactionDetail {
  tx_hash: string;
  tx_type: string;
  timestamp: number;
  status: string;
  block_number?: number;
}

export default function TransactionDetailsPage() {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!hash) return;
      try {
        const res = await fetch(`/api/search?q=${hash}`);
        const data = await res.json();
        setTransaction(data?.data ?? null);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [hash]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-950/20">
      <header className="border-b border-white/10 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <Link to="/" className="font-bold text-emerald-300">POZZER</Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/explorer")} className="mb-4">Voltar</Button>
        <Card className="p-6">
          {loading ? (
            <div>Loading...</div>
          ) : transaction ? (
            <div className="space-y-2">
              <div><strong>Hash:</strong> {transaction.tx_hash}</div>
              <div><strong>Type:</strong> {transaction.tx_type}</div>
              <div><strong>Status:</strong> {transaction.status}</div>
              <div><strong>Block:</strong> {transaction.block_number ?? "-"}</div>
            </div>
          ) : (
            <div>Transaction not found.</div>
          )}
        </Card>
      </main>
    </div>
  );
}
