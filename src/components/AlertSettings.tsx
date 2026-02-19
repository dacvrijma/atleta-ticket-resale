"use client"

import { useAlertSettings } from "@/hooks/useAlertSettings"

export function AlertSettings() {
  const { query, autoOpen, setQuery, setAutoOpen } = useAlertSettings()

  return (
    <div className="border-t border-gray-200 p-4 space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Alert Settings
      </h3>
      <div>
        <label
          htmlFor="alert-query"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Match Query
        </label>
        <input
          id="alert-query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. GYMRACE"
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">
          Matches ticket title or promotion (case-insensitive).
        </p>
      </div>
      <div className="flex items-center justify-between">
        <label
          htmlFor="alert-auto-open"
          className="text-xs font-medium text-gray-600 cursor-pointer"
        >
          Auto Open
        </label>
        <input
          id="alert-auto-open"
          type="checkbox"
          checked={autoOpen}
          onChange={(e) => setAutoOpen(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>
    </div>
  )
}
