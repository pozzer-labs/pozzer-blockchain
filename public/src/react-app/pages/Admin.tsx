import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Button } from "@/react-app/components/ui/button";

export default function AdminPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = sessionStorage.getItem("admin_token");
    if (t) setToken(t);
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setError("Invalid credentials");
      return;
    }
    const data = await res.json();
    sessionStorage.setItem("admin_token", data.token);
    setToken(data.token);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-emerald-950/20 to-gray-950">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-emerald-400">Admin Login</h1>
          <form onSubmit={login} className="space-y-4">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Email" required />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            {error ? <div className="text-sm text-red-400">{error}</div> : null}
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-950 via-emerald-950/20 to-gray-950">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-emerald-400">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={() => {
              sessionStorage.removeItem("admin_token");
              setToken(null);
              navigate("/admin");
            }}
          >
            Logout
          </Button>
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground">
            Admin autenticado. O painel completo pode ser expandido com estatisticas e revisao de missoes.
          </p>
        </Card>
      </div>
    </div>
  );
}
