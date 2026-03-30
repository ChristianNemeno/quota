"use client";

import { useState } from "react";

type Props = {
  initial?: {
    id: string;
    text: string;
    author: string;
    tags: string[];
  };
  onSuccess: () => void;
};

function serializeTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function AdminQuoteForm({ initial, onSuccess }: Props) {
  const [text, setText] = useState(initial?.text ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      text,
      author,
      tags: serializeTags(tags),
    };

    try {
      const response = await fetch(
        initial ? `/api/quotes/${initial.id}` : "/api/quotes",
        {
          method: initial ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save quote");
      }

      onSuccess();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to save quote",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="space-y-2">
        <label
          htmlFor="quote-text"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
        >
          Quote
        </label>
        <textarea
          id="quote-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-600"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="quote-author"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
        >
          Author
        </label>
        <input
          id="quote-author"
          type="text"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-600"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="quote-tags"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
        >
          Tags
        </label>
        <input
          id="quote-tags"
          type="text"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="stoicism, wisdom"
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-600"
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-wait disabled:opacity-70 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {submitting ? "Saving..." : initial ? "Save changes" : "Create quote"}
        </button>

        <button
          type="button"
          onClick={onSuccess}
          className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
