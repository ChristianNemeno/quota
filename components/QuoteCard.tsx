import FavoriteButton from "@/components/FavoriteButton";
import TagBadge from "@/components/TagBadge";
import type { Quote } from "@/lib/types";

type Props = {
  quote: Quote;
};

export default function QuoteCard({ quote }: Props) {
  return (
    <article className="vn-textbox vn-fadein relative px-6 py-6 sm:px-10 sm:py-8 transition-transform duration-200 hover:-translate-y-1">
      {/* Preload hover PNG to prevent flicker */}
      <span
        className="hidden"
        style={{ backgroundImage: "url('/gui/button/choice_hover_background.png')" }}
        aria-hidden="true"
      />

      <div className="absolute right-6 top-5 sm:right-8 sm:top-6">
        <FavoriteButton quoteId={quote.id} />
      </div>

      <div className="mb-3 select-none text-5xl leading-none text-[#c9a84c]/60">
        &ldquo;
      </div>

      <blockquote className="space-y-5">
        <p className="pr-12 font-serif text-xl italic leading-8 text-[#f5ead8]">
          {quote.text}
        </p>

        <footer className="inline-flex flex-col items-start gap-0.5">
          <span className="text-sm font-medium uppercase tracking-[0.18em] text-[#c9a84c]">
            {quote.author}
          </span>
          <span className="vn-namebox-underline" aria-hidden="true" />
        </footer>
      </blockquote>

      <div className="mt-5 flex flex-wrap gap-2">
        {quote.tags.map((tag) => (
          <TagBadge key={tag.id} name={tag.name} />
        ))}
      </div>

      <div className="vn-ctc absolute bottom-4 right-6 hidden sm:block" aria-hidden="true" />
    </article>
  );
}
