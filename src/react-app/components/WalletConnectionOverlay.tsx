import { Button } from "@/react-app/components/ui/button";

interface WalletConnectionOverlayProps {
  onConnect: () => void;
  isConnecting?: boolean;
}

export default function WalletConnectionOverlay({ onConnect, isConnecting = false }: WalletConnectionOverlayProps) {
  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-card p-6 text-center">
        <h2 className="text-2xl font-bold mb-2 text-emerald-300">Connect Wallet</h2>
        <p className="text-muted-foreground mb-6">
          Connect your wallet to access the testnet features.
        </p>
        <Button onClick={onConnect} className="w-full" disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect"}
        </Button>
      </div>
    </div>
  );
}
