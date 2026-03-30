"use client";

import { useEffect, useState } from "react";

import AdminQuoteForm from "@/components/AdminQuoteForm";
import TagBadge from "@/components/TagBadge";
import type { Quote } from "@/lib/types";

type EditableQuote = {
  id: string;
  text: string;
  author: string;
  tags: string[];
};

function toEditableQuote(quote: Quote): EditableQuote {
  return {
    id: quote.id,
    text: quote.text,
    author: quote.author,
    tags: quote.tags.map((tag) => tag.name),
  };
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}...`;
}

export default function AdminPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingQuote, setEditingQuote] = useState<EditableQuote | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  async function loadQuotes() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/quotes?limit=1000");

      if (!response.ok) {
        throw new Error("Failed to load quotes");
      }

      const data = (await response.json()) as Quote[];
      setQuotes(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to load quotes",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuotes();
  }, []);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this quote?");

    if (!confirmed) return;

    const response = await fetch(`/api/quotes/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Failed to delete quote");
      return;
    }

    await loadQuotes();
  }

  function handleFormSuccess() {
    setShowCreateForm(false);
    setEditingQuote(null);
    void loadQuotes();
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
            Admin
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            Manage quotes
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingQuote(null);
            setShowCreateForm(true);
          }}
          className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Add Quote
        </button>
      </div>

      {showCreateForm ? (
        <AdminQuoteForm onSuccess={handleFormSuccess} />
      ) : null}

      {editingQuote ? (
        <AdminQuoteForm initial={editingQuote} onSuccess={handleFormSuccess} />
      ) : null}

      {error ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
          Loading quotes...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead>
              <tr className="text-left text-sm text-neutral-500 dark:text-neutral-400">
                <th className="px-6 py-4 font-medium">Quote</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Tags</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {quotes.map((quote) => (
                <tr key={quote.id} className="align-top">
                  <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                    {truncate(quote.text, 60)}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                    {quote.author}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {quote.tags.map((tag) => (
                        <TagBadge
                          key={tag.id}
                          name={tag.name}
                          href={`/tags/${tag.name}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingQuote(toEditableQuote(quote));
                        }}
                        className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(quote.id)}
                        className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
