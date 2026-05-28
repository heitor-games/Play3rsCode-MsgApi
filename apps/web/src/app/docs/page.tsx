import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_BASE = "https://api.seudominio.com";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              Documentação
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Começar a usar a API
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Integre chat em tempo real no seu app em 5 minutos.
            </p>
          </div>

          {/* Step 1 */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Crie sua conta
              </h2>
            </div>
            <div className="ml-[52px]">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Registre-se para obter suas credenciais de acesso.
              </p>
              <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-5 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{`curl -X POST ${API_BASE}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "voce@email.com",
    "username": "meuapp",
    "password": "senha123"
  }'`}</code>
                </pre>
              </div>
              <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-5 overflow-x-auto border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Resposta:</p>
                <pre className="text-sm text-gray-700 dark:text-gray-300">
                  <code>{`{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "voce@email.com",
    "username": "meuapp"
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Conecte via WebSocket
              </h2>
            </div>
            <div className="ml-[52px]">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Use o token JWT para autenticar a conexão Socket.IO.
              </p>
              <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-5 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{`import { io } from "socket.io-client";

const socket = io("${API_BASE}", {
  auth: { token: "SEU_JWT_TOKEN" }
});

socket.on("connect", () => {
  console.log("Conectado!", socket.id);
});`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Envie mensagens
              </h2>
            </div>
            <div className="ml-[52px]">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Envie mensagens privadas (DM) ou para canais públicos.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Mensagem privada (DM)
              </h3>
              <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-5 overflow-x-auto mb-6">
                <pre className="text-sm text-gray-300">
                  <code>{`// Enviar DM para outro usuário
socket.emit("message:send", {
  content: "Olá!",
  recipientId: "id-do-destinatario"
});`}</code>
                </pre>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Mensagem em canal
              </h3>
              <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-5 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{`// Criar um canal
socket.emit("channel:create", {
  name: "meu-canal",
  description: "Canal do meu app",
  isPublic: true
});

// Enviar mensagem no canal
socket.emit("message:send", {
  content: "Hello world!",
  channelId: "id-do-canal"
});`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white font-bold">4</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Receba mensagens
              </h2>
            </div>
            <div className="ml-[52px]">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Escute os eventos para receber mensagens em tempo real.
              </p>
              <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-5 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{`// Receber novas mensagens
socket.on("message:new", ({ message, sender }) => {
  console.log(sender.username + ": " + message.content);
});

// Indicador de digitação
socket.on("typing:indicator", ({ userId, isTyping }) => {
  console.log(userId, isTyping ? "está digitando..." : "parou");
});

// Status de presença
socket.on("user:online", ({ userId }) => {
  console.log(userId, "ficou online");
});`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white font-bold">5</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Use API Keys (server-to-server)
              </h2>
            </div>
            <div className="ml-[52px]">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Para integrações backend, use API Keys em vez de JWT.
              </p>
              <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-5 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{`// Criar uma API Key
curl -X POST ${API_BASE}/billing/api-keys \\
  -H "Authorization: Bearer SEU_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Produção" }'

// Usar a API Key em requests
curl ${API_BASE}/billing/usage \\
  -H "x-api-key: sk_live_sua_api_key"`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Events Reference */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Referência de Eventos
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Client → Server
            </h3>
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Evento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Payload</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Descrição</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4"><code className="text-blue-600">message:send</code></td>
                    <td className="py-3 px-4"><code>{`{ content, channelId?, recipientId? }`}</code></td>
                    <td className="py-3 px-4">Enviar mensagem</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4"><code className="text-blue-600">message:read</code></td>
                    <td className="py-3 px-4"><code>{`{ messageId }`}</code></td>
                    <td className="py-3 px-4">Marcar como lida</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4"><code className="text-blue-600">channel:create</code></td>
                    <td className="py-3 px-4"><code>{`{ name, description?, isPublic? }`}</code></td>
                    <td className="py-3 px-4">Criar canal</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4"><code className="text-blue-600">channel:join</code></td>
                    <td className="py-3 px-4"><code>{`{ channelId }`}</code></td>
                    <td className="py-3 px-4">Entrar em canal</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4"><code className="text-blue-600">channel:leave</code></td>
                    <td className="py-3 px-4"><code>{`{ channelId }`}</code></td>
                    <td className="py-3 px-4">Sair do canal</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="text-blue-600">typing:start</code></td>
                    <td className="py-3 px-4"><code>{`{ channelId?, recipientId? }`}</code></td>
                    <td className="py-3 px-4">Indicar digitação</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Server → Client
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Evento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Payload</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Descrição</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4"><code className="text-blue-600">message:new</code></td>
                    <td className="py-3 px-4"><code>{`{ message, sender }`}</code></td>
                    <td className="py-3 px-4">Nova mensagem</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4"><code className="text-blue-600">message:ack</code></td>
                    <td className="py-3 px-4"><code>{`{ messageId, status }`}</code></td>
                    <td className="py-3 px-4">Confirmação de envio</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4"><code className="text-blue-600">user:online</code></td>
                    <td className="py-3 px-4"><code>{`{ userId }`}</code></td>
                    <td className="py-3 px-4">Usuário ficou online</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4"><code className="text-blue-600">user:offline</code></td>
                    <td className="py-3 px-4"><code>{`{ userId }`}</code></td>
                    <td className="py-3 px-4">Usuário ficou offline</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4"><code className="text-blue-600">typing:indicator</code></td>
                    <td className="py-3 px-4"><code>{`{ userId, channelId?, isTyping }`}</code></td>
                    <td className="py-3 px-4">Status de digitação</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="text-blue-600">error</code></td>
                    <td className="py-3 px-4"><code>{`{ code, message }`}</code></td>
                    <td className="py-3 px-4">Erro</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-blue-600 rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold text-white">
              Pronto para começar?
            </h2>
            <p className="mt-3 text-blue-100">
              Crie sua conta grátis e comece a integrar agora.
            </p>
            <a
              href="/register"
              className="inline-block mt-6 px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Criar Conta Grátis
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
