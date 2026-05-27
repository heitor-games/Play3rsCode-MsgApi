import { Plan, formatPrice, formatLimit } from "@/lib/plans";

interface PricingCardProps {
  plan: Plan;
}

export default function PricingCard({ plan }: PricingCardProps) {
  return (
    <div
      className={`relative rounded-2xl border ${
        plan.popular
          ? "border-blue-600 shadow-lg shadow-blue-600/10"
          : "border-gray-200 dark:border-gray-800"
      } p-8 flex flex-col`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Mais Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {plan.name}
        </h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {formatPrice(plan.priceMonthly)}
          </span>
          {plan.priceMonthly > 0 && (
            <span className="text-gray-500 dark:text-gray-400">/mês</span>
          )}
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Mensagens</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatLimit(plan.limits.messages)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Canais</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatLimit(plan.limits.channels)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Conexões</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatLimit(plan.limits.connections)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Notificações</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatLimit(plan.limits.notifications)}
          </span>
        </div>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg
              className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={plan.priceMonthly === 0 ? "/register" : `/checkout?plan=${plan.tier}`}
        className={`w-full text-center py-3 px-4 rounded-lg font-medium transition ${
          plan.popular
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        }`}
      >
        {plan.priceMonthly === 0 ? "Começar Grátis" : "Assinar Agora"}
      </a>
    </div>
  );
}
