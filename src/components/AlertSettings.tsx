"use client"

import { useState } from "react"
import { useAlertSettings } from "@/hooks/useAlertSettings"

function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied"
  return Notification.permission
}

export function AlertSettings() {
  const { query, autoOpen, playSound, sendNotification, setQuery, setAutoOpen, setPlaySound, setSendNotification } =
    useAlertSettings()

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>(getNotificationPermission)

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    if (permission !== "granted") {
      setSendNotification(false)
    }
  }

  const handleSendNotificationChange = (checked: boolean) => {
    if (checked && notificationPermission !== "granted") return
    setSendNotification(checked)
  }

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
      <div className="flex items-center justify-between">
        <label
          htmlFor="alert-play-sound"
          className="text-xs font-medium text-gray-600 cursor-pointer"
        >
          Play Sound
        </label>
        <input
          id="alert-play-sound"
          type="checkbox"
          checked={playSound}
          onChange={(e) => setPlaySound(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor="alert-send-notification"
            className={[
              "text-xs font-medium cursor-pointer",
              notificationPermission === "granted" ? "text-gray-600" : "text-gray-400",
            ].join(" ")}
          >
            Send Notification
          </label>
          <input
            id="alert-send-notification"
            type="checkbox"
            checked={sendNotification}
            onChange={(e) => handleSendNotificationChange(e.target.checked)}
            disabled={notificationPermission !== "granted"}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>
        {notificationPermission !== "granted" && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {notificationPermission === "denied"
                ? "Permission denied by browser."
                : "Permission required."}
            </p>
            {notificationPermission !== "denied" && (
              <button
                onClick={requestNotificationPermission}
                className="text-xs text-blue-600 hover:underline"
              >
                Grant
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
