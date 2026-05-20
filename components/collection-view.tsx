"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { getProducts } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

const categories = ["Support", "Carry", "Hydration", "Socks", "Sweat", "Recovery"];
const useCases = ["Run", "Train", "Court", "Recovery"];
const sizes = ["S", "M", "L", "XL", "S/M", "M/L", "L/XL", "One size", "22 oz"];
const colors = ["Graphite", "Steel", "Lime", "Signal Blue", "White"];

export function CollectionView({
  initialUseCase,
  initialCategory,
  initialSize,
  initialColor,
  initialPrice,
  initialSort,
  lockCategory = false,
  lockUseCase = false,
}: {
  initialUseCase?: string;
  initialCategory?: string;
  initialSize?: string;
  initialColor?: string;
  initialPrice?: number;
  initialSort?: string;
  lockCategory?: boolean;
  lockUseCase?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [category, setCategory] = useState(initialCategory ?? "");
  const [useCase, setUseCase] = useState(initialUseCase ?? "");
  const [size, setSize] = useState(initialSize ?? "");
  const [color, setColor] = useState(initialColor ?? "");
  const [maxPrice, setMaxPrice] = useState(initialPrice ?? 6000);
  const [sort, setSort] = useState(initialSort ?? "best");
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProducts({ category, useCase, size, color, priceMax: maxPrice, sort })
      .then((result) => {
        if (active) {
          setProducts(result);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
    return () => {
      active = false;
    };
  }, [category, useCase, size, color, maxPrice, sort]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (!lockCategory && category) params.set("category", category);
    if (!lockUseCase && useCase) params.set("useCase", useCase);
    if (size) params.set("size", size);
    if (color) params.set("color", color);
    if (maxPrice < 6000) params.set("price", String(maxPrice));
    if (sort !== "best") params.set("sort", sort);

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [category, color, lockCategory, lockUseCase, maxPrice, pathname, router, size, sort, useCase]);

  const filters = useMemo(
    () => (
      <Filters
        category={category}
        setCategory={setCategory}
        useCase={useCase}
        setUseCase={setUseCase}
        size={size}
        setSize={setSize}
        color={color}
        setColor={setColor}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        lockCategory={lockCategory}
        lockUseCase={lockUseCase}
      />
    ),
    [category, useCase, size, color, maxPrice, lockCategory, lockUseCase],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">{filters}</aside>
      <div>
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button variant="outline" className="lg:hidden" onClick={() => setDrawerOpen(true)}><SlidersHorizontal className="h-4 w-4" /> Filters</Button>
          <p className="text-sm font-bold text-muted">{products.length} products</p>
          <select className="rounded-full border border-graphite/10 bg-white px-4 py-3 text-sm font-bold" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="best">Best selling</option><option value="newest">Newest</option><option value="price-asc">Price low to high</option><option value="price-desc">Price high to low</option>
          </select>
        </div>
        {error ? <div className="rounded-3xl bg-white p-6 font-bold text-muted">{error}</div> : null}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 bg-graphite/50 lg:hidden">
          <div className="ml-auto h-full w-[86%] overflow-y-auto bg-warm p-5">
            <div className="mb-5 flex items-center justify-between"><p className="font-display text-3xl font-black uppercase">Filters</p><button onClick={() => setDrawerOpen(false)}><X /></button></div>
            {filters}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Filters(props: {
  category: string; setCategory: (value: string) => void; useCase: string; setUseCase: (value: string) => void; size: string; setSize: (value: string) => void; color: string; setColor: (value: string) => void; maxPrice: number; setMaxPrice: (value: number) => void;
  lockCategory: boolean;
  lockUseCase: boolean;
}) {
  return (
    <div className="rounded-[1.75rem] border border-graphite/10 bg-white p-5">
      {!props.lockCategory ? <FilterGroup title="Category" values={categories} value={props.category} setValue={props.setCategory} /> : null}
      {!props.lockUseCase ? <FilterGroup title="Use case" values={useCases} value={props.useCase} setValue={props.setUseCase} /> : null}
      <FilterGroup title="Size" values={sizes} value={props.size} setValue={props.setSize} />
      <FilterGroup title="Color" values={colors} value={props.color} setValue={props.setColor} />
      <div className="mt-6 border-t border-graphite/10 pt-5"><p className="text-xs font-bold uppercase tracking-[0.18em]">Price up to ${(props.maxPrice / 100).toFixed(0)}</p><input className="mt-4 w-full accent-lime" type="range" min="2000" max="6000" step="100" value={props.maxPrice} onChange={(event) => props.setMaxPrice(Number(event.target.value))} /></div>
    </div>
  );
}

function FilterGroup({ title, values, value, setValue }: { title: string; values: string[]; value: string; setValue: (value: string) => void }) {
  return (
    <div className="border-b border-graphite/10 py-5 first:pt-0 last:border-0"><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em]">{title}</p><div className="flex flex-wrap gap-2"><button onClick={() => setValue("")} className={`rounded-full px-3 py-2 text-xs font-bold ${value === "" ? "bg-lime" : "bg-warm"}`}>All</button>{values.map((item) => <button key={item} onClick={() => setValue(item)} className={`rounded-full px-3 py-2 text-xs font-bold ${value === item ? "bg-lime" : "bg-warm"}`}>{item}</button>)}</div></div>
  );
}
