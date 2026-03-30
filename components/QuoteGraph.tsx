"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

import TagBadge from "@/components/TagBadge";
import type { GraphLink, GraphNode, Quote } from "@/lib/types";

const TAG_COLORS: Record<string, string> = {
  philosophy: "#6366f1",
  stoicism: "#8b5cf6",
  motivation: "#f59e0b",
  humor: "#10b981",
  science: "#3b82f6",
  literature: "#ec4899",
  creativity: "#f97316",
  wisdom: "#14b8a6",
};

const DEFAULT_COLOR = "#94a3b8";

type Props = {
  quotes: Quote[];
};

type Size = {
  width: number;
  height: number;
};

export default function QuoteGraph({ quotes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = quotes.map((quote) => ({
      id: quote.id,
      text: quote.text,
      author: quote.author,
      tags: quote.tags,
      primaryTag: quote.tags[0]?.name ?? null,
    }));

    const links: GraphLink[] = [];

    for (let i = 0; i < quotes.length; i += 1) {
      for (let j = i + 1; j < quotes.length; j += 1) {
        const tagsI = new Set(quotes[i].tags.map((tag) => tag.name));
        const sharedTags = quotes[j].tags
          .map((tag) => tag.name)
          .filter((tag) => tagsI.has(tag));

        if (sharedTags.length > 0) {
          links.push({
            source: quotes[i].id,
            target: quotes[j].id,
            sharedTags,
          });
        }
      }
    }

    return { nodes, links };
  }, [quotes]);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) return;

      setSize({
        width: entry.contentRect.width,
        height: Math.max(480, entry.contentRect.height),
      });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedNode) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedNode(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode]);

  return (
    <>
      <div
        ref={containerRef}
        className="h-full min-h-[560px] w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
      >
        <ForceGraph2D
          graphData={graphData}
          width={size.width}
          height={size.height}
          nodeRelSize={6}
          nodeColor={(node) =>
            TAG_COLORS[(node as GraphNode).primaryTag ?? ""] ?? DEFAULT_COLOR
          }
          nodeLabel={(node) => {
            const current = node as GraphNode;
            return `${current.author}: ${current.text.slice(0, 60)}...`;
          }}
          linkColor={() => "#e2e8f0"}
          onNodeClick={(node) => setSelectedNode(node as GraphNode)}
          cooldownTicks={80}
        />
      </div>

      {selectedNode ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-10"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl dark:bg-neutral-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-5">
              <p className="font-serif text-2xl leading-9 text-neutral-950 dark:text-neutral-50">
                {selectedNode.text}
              </p>

              <p className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                {selectedNode.author}
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedNode.tags.map((tag) => (
                  <TagBadge key={tag.id} name={tag.name} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
