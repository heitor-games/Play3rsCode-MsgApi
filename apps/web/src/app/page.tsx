import Header from "@/components/Header";
import PricingCard from "@/components/PricingCard";
import FeatureComparison from "@/components/FeatureComparison";
import Footer from "@/components/Footer";
import { PLANS } from "@/lib/plans";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          API de Chat em Tempo Real
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
          Chat em tempo real
          <br />
          <span className="text-blue-600">pague pelo uso</span>
        </h1>

        <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Integre chat privado, canais públicos e notificações push no seu app
          em minutos. Sem custos fixos — escale conforme cresce.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-lg"
          >
            Começar Grátis
          </a>
          <a
            href="#docs"
            className="px-8 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition text-lg"
          >
            Ver Documentação
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">99.9%</div>
            <div className="text-sm text-gray-500 mt-1">Uptime SLA</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">&lt;50ms</div>
            <div className="text-sm text-gray-500 mt-1">Latência</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">100k+</div>
            <div className="text-sm text-gray-500 mt-1">Msgs/seg</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">4</div>
            <div className="text-sm text-gray-500 mt-1">Métricas</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tudo que você precisa
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Uma API completa para comunicação em tempo real, com billing modular
            integrado ao Stripe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Chat Privado",
              description: "Mensagens diretas entre usuários com delivery garantido e histórico persistente.",
              icon: "💬",
            },
            {
              title: "Canais Públicos",
              description: "Salas de discussão com gestão de membros, roles e permissões granulares.",
              icon: "📢",
            },
            {
              title: "Notificações Push",
              description: "Integração com Firebase e Twilio para alertas por push e SMS.",
              icon: "🔔",
            },
            {
              title: "Presença Online",
              description: "Tracking de status em tempo real com Redis para performance escalável.",
              icon: "🟢",
            },
            {
              title: "API REST + WebSocket",
              description: "Socket.IO para tempo real + REST para operações CRUD e histórico.",
              icon: "⚡",
            },
            {
              title: "Autenticação JWT",
              description: "Login seguro com JWT + API keys para integração server-to-server.",
              icon: "🔐",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Preços simples e transparentes
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Pague apenas pelo que usar. Sem taxas ocultas, sem compromisso.
            Cancele quando quiser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <FeatureComparison />
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Como funciona o billing
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Cobrança modular baseada em 4 métricas de uso real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              metric: "Mensagens",
              description: "Cada mensagem enviada via API ou WebSocket é contabilizada.",
              example: "1 mensagem = 1 unidade",
            },
            {
              metric: "Canais",
              description: "Cada canal criado conta como 1 unidade no período.",
              example: "1 canal = 1 unidade/mês",
            },
            {
              metric: "Conexões",
              description: "Conexões WebSocket simultâneas rastreadas em tempo real.",
              example: "1 socket = 1 conexão",
            },
            {
              metric: "Notificações",
              description: "Cada push notification ou SMS enviado é contabilizado.",
              example: "1 notificação = 1 unidade",
            },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">{i + 1}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {item.metric}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {item.description}
              </p>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {item.example}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-blue-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white">
            Pronto para começar?
          </h2>
          <p className="mt-4 text-blue-100 max-w-xl mx-auto">
            Crie sua conta grátis e comece a integrar chat em tempo real no seu app hoje mesmo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Criar Conta Grátis
            </a>
            <a
              href="#docs"
              className="px-8 py-3 border border-blue-400 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Ver Documentação
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
