import FavoriteButton from "@/components/FavoriteButton";
import TagBadge from "@/components/TagBadge";
import type { Quote } from "@/lib/types";

type Props = {
  quote: Quote;
};

export default function QuoteCard({ quote }: Props) {
  return (
    <article className="relative rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="absolute right-6 top-6">
        <FavoriteButton quoteId={quote.id} />
      </div>

      <div className="mb-4 text-6xl leading-none text-[#c9a84c]/30 dark:text-[#c9a84c]/20">
        &ldquo;
      </div>

      <blockquote className="space-y-6">
        <p className="pr-14 font-serif text-2xl italic leading-9 text-neutral-900 dark:text-neutral-100">
          {quote.text}
        </p>

        <footer className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {quote.author}
        </footer>
      </blockquote>

      <div className="mt-6 flex flex-wrap gap-2">
        {quote.tags.map((tag) => (
          <TagBadge key={tag.id} name={tag.name} />
        ))}
      </div>
    </article>
  );
}
