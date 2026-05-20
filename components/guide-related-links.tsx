import Link from "next/link";
import type { GuideCollectionLink } from "@/lib/types";

export function GuideRelatedCollections({ collections }: { collections: GuideCollectionLink[] }) {
  if (collections.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {collections.map((collection) => (
        <Link
          key={collection.path}
          href={collection.path}
          className="rounded-full border border-graphite/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-graphite transition hover:border-graphite hover:bg-lime"
        >
          {collection.title}
        </Link>
      ))}
    </div>
  );
}
