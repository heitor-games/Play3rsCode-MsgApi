"use client";

import { useEffect, useState } from "react";
import { isAuthenticated, removeToken } from "@/lib/api";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P3</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Play3rsCode API
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
            Features
          </a>
          <a href="/#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
            Pricing
          </a>
          <a href="/docs" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
            Docs
          </a>
          {loggedIn ? (
            <a
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Dashboard
            </a>
          ) : (
            <>
              <a
                href="/login"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
              >
                Login
              </a>
              <a
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
