"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEvents } from "@/context/EventsContext";

export function Sidebar() {
  const { events, addEvent } = useEvents();
  const pathname = usePathname();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [curlCommand, setCurlCommand] = useState("");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !curlCommand.trim() || !projectId.trim()) {
      setError("All fields are required.");
      return;
    }
    addEvent({ name: name.trim(), curlCommand, projectId: projectId.trim() });
    setName("");
    setCurlCommand("");
    setProjectId("");
    setError("");
    setShowForm(false);
  }

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-700">Events</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Event"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border-b border-gray-200 p-4 space-y-3">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div>
            <label htmlFor="event-name" className="block text-xs font-medium text-gray-600 mb-1">
              Name
            </label>
            <input
              id="event-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="curl-command" className="block text-xs font-medium text-gray-600 mb-1">
              Curl Command
            </label>
            <textarea
              id="curl-command"
              value={curlCommand}
              onChange={(e) => setCurlCommand(e.target.value)}
              rows={3}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="project-id" className="block text-xs font-medium text-gray-600 mb-1">
              Project ID
            </label>
            <input
              id="project-id"
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Event
          </button>
        </form>
      )}

      <nav className="flex-1 overflow-y-auto p-2">
        {events.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-400">
            No events yet. Add one to get started.
          </p>
        ) : (
          <ul className="space-y-1">
            {events.map((event) => {
              const isActive = pathname === `/events/${event.id}`;
              return (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className={`block rounded px-3 py-2 text-sm ${
                      isActive
                        ? "bg-blue-100 font-medium text-blue-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {event.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}
