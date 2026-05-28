"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { api, isAuthenticated, setToken } from "@/lib/api";
import { PLANS, formatPrice } from "@/lib/plans";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planTier = searchParams.get("plan") || "STARTER";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const plan = PLANS.find((p) => p.tier === planTier) || PLANS[1];

  useEffect(() => {
    if (isAuthenticated()) {
      handleCheckout();
    }
  }, []);

  async function handleCheckout() {
    setLoading(true);
    setError("");

    const res = await api.checkout(planTier);

    if (res.ok && res.data?.url) {
      window.location.href = res.data.url;
    } else {
      setError(res.message || "Erro ao criar sessão de pagamento");
      setLoading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    const res = isLogin
      ? await api.login({ email, password })
      : await api.register({ email, username: email.split("@")[0], password });

    if (res.ok && res.data) {
      setToken(res.data.token);
      handleCheckout();
    } else {
      setError(res.message || "Erro na autenticação");
      setAuthLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-md mx-auto text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Redirecionando para o pagamento...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Você será redirecionado para o Stripe.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              Checkout
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Assinar {plan.name}
            </h1>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              {formatPrice(plan.priceMonthly)}/mês — cancele quando quiser.
            </p>
          </div>

          <div className="mb-8 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-gray-900 dark:text-white">Plano {plan.name}</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(plan.priceMonthly)}<span className="text-sm font-normal text-gray-500">/mês</span>
              </span>
            </div>
            <ul className="space-y-2">
              {plan.features.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {!isAuthenticated() ? (
            <>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Senha
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 caracteres"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition text-lg"
                >
                  {authLoading ? "Processando..." : isLogin ? "Entrar e Assinar" : "Criar Conta e Assinar"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
                <button
                  onClick={() => { setIsLogin(!isLogin); setError(""); }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isLogin ? "Criar conta" : "Fazer login"}
                </button>
              </p>
            </>
          ) : (
            <button
              onClick={handleCheckout}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-lg"
            >
              Assinar {plan.name} — {formatPrice(plan.priceMonthly)}/mês
            </button>
          )}

          <p className="mt-6 text-center text-xs text-gray-500">
            Pagamento seguro via Stripe. Pode cancelar a qualquer momento.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
