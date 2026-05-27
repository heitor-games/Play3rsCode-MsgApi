import { PLANS, formatLimit, Plan } from "@/lib/plans";

const metrics = [
  { key: "messages" as const, label: "Mensagens/mês" },
  { key: "channels" as const, label: "Canais" },
  { key: "connections" as const, label: "Conexões simultâneas" },
  { key: "notifications" as const, label: "Notificações/mês" },
];

function hasFeature(plan: Plan, keyword: string): boolean {
  return plan.features.some((f) => f.toLowerCase().includes(keyword.toLowerCase()));
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function FeatureComparison() {
  return (
    <div className="mt-16 overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="text-left py-4 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Recurso
            </th>
            {PLANS.map((plan) => (
              <th
                key={plan.id}
                className={`text-center py-4 px-4 text-sm font-medium ${
                  plan.popular
                    ? "text-blue-600"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr
              key={metric.key}
              className="border-b border-gray-100 dark:border-gray-800"
            >
              <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                {metric.label}
              </td>
              {PLANS.map((plan) => (
                <td
                  key={plan.id}
                  className="text-center py-4 px-4 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {formatLimit(plan.limits[metric.key])}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
              Chat privado
            </td>
            {PLANS.map((plan) => (
              <td key={plan.id} className="text-center py-4 px-4">
                <CheckIcon />
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
              Chat público (canais)
            </td>
            {PLANS.map((plan) => (
              <td key={plan.id} className="text-center py-4 px-4">
                {hasFeature(plan, "público") ? <CheckIcon /> : <XIcon />}
              </td>
            ))}
          </tr>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
              API Access
            </td>
            {PLANS.map((plan) => (
              <td key={plan.id} className="text-center py-4 px-4">
                {hasFeature(plan, "api") ? <CheckIcon /> : <XIcon />}
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
              Webhooks
            </td>
            {PLANS.map((plan) => (
              <td key={plan.id} className="text-center py-4 px-4">
                {hasFeature(plan, "webhook") ? <CheckIcon /> : <XIcon />}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
