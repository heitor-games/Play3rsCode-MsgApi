export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RT</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                RealTime Chat
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              API de chat em tempo real com WebSocket. Escalável, modular e fácil de integrar.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Produto</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#features" className="hover:text-gray-900 dark:hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-gray-900 dark:hover:text-white">Pricing</a></li>
              <li><a href="#docs" className="hover:text-gray-900 dark:hover:text-white">Documentação</a></li>
              <li><a href="#changelog" className="hover:text-gray-900 dark:hover:text-white">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#guides" className="hover:text-gray-900 dark:hover:text-white">Guias</a></li>
              <li><a href="#examples" className="hover:text-gray-900 dark:hover:text-white">Exemplos</a></li>
              <li><a href="#blog" className="hover:text-gray-900 dark:hover:text-white">Blog</a></li>
              <li><a href="#status" className="hover:text-gray-900 dark:hover:text-white">Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#privacy" className="hover:text-gray-900 dark:hover:text-white">Privacidade</a></li>
              <li><a href="#terms" className="hover:text-gray-900 dark:hover:text-white">Termos de Uso</a></li>
              <li><a href="#security" className="hover:text-gray-900 dark:hover:text-white">Segurança</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
          2024 RealTime Chat API. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
