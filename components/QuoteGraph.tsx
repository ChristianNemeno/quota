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
        if (quotes[i].author === quotes[j].author) {
          links.push({
            source: quotes[i].id,
            target: quotes[j].id,
            sharedTags: [],
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
        className="vn-frame h-full min-h-[560px] w-full overflow-hidden"
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
            className="vn-frame w-full max-w-2xl p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-5">
              <p className="font-serif text-lg italic leading-8 text-[#f5ead8]">
                {selectedNode.text}
              </p>

              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c9a84c]">
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
