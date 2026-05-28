"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { api, removeToken, isAuthenticated, getToken } from "@/lib/api";
import { formatLimit, formatPrice, PLANS } from "@/lib/plans";

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface Subscription {
  plan: string;
  status: string;
}

interface UsageData {
  MESSAGES: number;
  CHANNELS: number;
  CONNECTIONS: number;
  NOTIFICATIONS: number;
}

interface ApiKey {
  id: string;
  name: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [limits, setLimits] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    const [meRes, usageRes, keysRes] = await Promise.all([
      api.me(),
      api.usage(),
      api.listApiKeys(),
    ]);

    if (meRes.ok && meRes.data) {
      setUser(meRes.data.user);
      setSubscription(meRes.data.subscription);
    } else {
      removeToken();
      router.push("/login");
      return;
    }

    if (usageRes.ok && usageRes.data) {
      setUsage(usageRes.data.usage);
      setLimits(usageRes.data.limits);
    }

    if (keysRes.ok && keysRes.data) {
      setApiKeys(keysRes.data.keys);
    }

    setLoading(false);
  }

  async function handleCreateKey() {
    if (!newKeyName.trim()) return;
    const res = await api.createApiKey(newKeyName.trim());
    if (res.ok && res.data) {
      setNewKey(res.data.key);
      setNewKeyName("");
      loadData();
    }
  }

  async function handleDeleteKey(id: string) {
    await api.deleteApiKey(id);
    loadData();
  }

  function handleLogout() {
    removeToken();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48" />
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const currentPlan = PLANS.find((p) => p.tier === (subscription?.plan || "FREE")) || PLANS[0];

  const metrics = usage
    ? [
        { label: "Mensagens", current: usage.MESSAGES, limit: limits?.messages || currentPlan.limits.messages, key: "messages" },
        { label: "Canais", current: usage.CHANNELS, limit: limits?.channels || currentPlan.limits.channels, key: "channels" },
        { label: "Conexões", current: usage.CONNECTIONS, limit: limits?.connections || currentPlan.limits.connections, key: "connections" },
        { label: "Notificações", current: usage.NOTIFICATIONS, limit: limits?.notifications || currentPlan.limits.notifications, key: "notifications" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Bem-vindo, <span className="font-medium text-gray-900 dark:text-white">{user?.username}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition text-sm"
          >
            Sair
          </button>
        </div>

        {/* Plan Card */}
        <div className="mb-8 p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Plano atual</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentPlan.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {currentPlan.priceMonthly === 0 ? "Grátis" : `${formatPrice(currentPlan.priceMonthly)}/mês`}
              </p>
            </div>
            {currentPlan.tier !== "ENTERPRISE" && (
              <a
                href="/#pricing"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Upgrade
              </a>
            )}
          </div>
        </div>

        {/* Usage Metrics */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Uso este mês
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => {
              const pct = m.limit === -1 ? 0 : Math.min((m.current / m.limit) * 100, 100);
              const isNearLimit = pct >= 80;
              return (
                <div
                  key={m.key}
                  className="p-5 rounded-xl border border-gray-200 dark:border-gray-800"
                >
                  <p className="text-sm text-gray-500 mb-2">{m.label}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {m.current.toLocaleString()}
                    </span>
                    <span className="text-gray-400">
                      / {formatLimit(m.limit)}
                    </span>
                  </div>
                  {m.limit !== -1 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isNearLimit ? "bg-orange-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* API Keys */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            API Keys
          </h2>

          {/* Create new key */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Nome da key (ex: Produção)"
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
            <button
              onClick={handleCreateKey}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Criar Key
            </button>
          </div>

          {/* New key alert */}
          {newKey && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">
                API Key criada! Copie agora — não será exibida novamente.
              </p>
              <code className="block p-3 bg-gray-900 text-green-400 rounded text-sm break-all">
                {newKey}
              </code>
            </div>
          )}

          {/* Keys list */}
          <div className="space-y-3">
            {apiKeys.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">
                Nenhuma API key criada ainda.
              </p>
            ) : (
              apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {key.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {key.isActive ? "Ativa" : "Revogada"}
                      {key.lastUsedAt && ` · Último uso: ${new Date(key.lastUsedAt).toLocaleDateString("pt-BR")}`}
                      {` · Criada: ${new Date(key.createdAt).toLocaleDateString("pt-BR")}`}
                    </p>
                  </div>
                  {key.isActive && (
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      Revogar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Start */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Primeiros passos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/docs"
              className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition"
            >
              <div className="text-2xl mb-3">📖</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Documentação</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Veja como integrar a API em 5 minutos.
              </p>
            </a>
            <a
              href="/#pricing"
              className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition"
            >
              <div className="text-2xl mb-3">💳</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Planos</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Veja os planos e faça upgrade.
              </p>
            </a>
            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="text-2xl mb-3">🔑</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">JWT Token</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Use este token para testar:
              </p>
              <code className="block p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs break-all text-gray-700 dark:text-gray-300">
                {getToken()?.slice(0, 40)}...
              </code>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
