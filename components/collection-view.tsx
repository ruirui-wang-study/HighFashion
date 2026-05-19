"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { products } from "@/data/products";
import { filterProducts, sortProducts, type ProductSort } from "@/lib/product-filters";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

const categories = Array.from(new Set(products.map((product) => product.category)));
const useCases = Array.from(new Set(products.flatMap((product) => product.useCases)));
const sizes = Array.from(new Set(products.flatMap((product) => product.sizes)));
const colors = Array.from(new Set(products.flatMap((product) => product.colors)));

export function CollectionView({ initialUseCase, initialCategory }: { initialUseCase?: string; initialCategory?: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [category, setCategory] = useState(initialCategory ?? "");
  const [useCase, setUseCase] = useState(initialUseCase ?? "");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [maxPrice, setMaxPrice] = useState(60);
  const [sort, setSort] = useState<ProductSort>("best");

  const filtered = useMemo(() => sortProducts(filterProducts(products, { category, useCase, size, color, maxPrice }), sort), [category, useCase, size, color, maxPrice, sort]);
  const filters = <Filters category={category} setCategory={setCategory} useCase={useCase} setUseCase={setUseCase} size={size} setSize={setSize} color={color} setColor={setColor} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">{filters}</aside>
      <div>
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button variant="outline" className="lg:hidden" onClick={() => setDrawerOpen(true)}><SlidersHorizontal className="h-4 w-4" /> Filters</Button>
          <p className="text-sm font-bold text-muted">{filtered.length} products</p>
          <select className="rounded-full border border-graphite/10 bg-white px-4 py-3 text-sm font-bold" value={sort} onChange={(event) => setSort(event.target.value as ProductSort)}>
            <option value="best">Best selling</option><option value="newest">Newest</option><option value="price-asc">Price low to high</option><option value="price-desc">Price high to low</option>
          </select>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
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
}) {
  return (
    <div className="rounded-[1.75rem] border border-graphite/10 bg-white p-5">
      <FilterGroup title="Category" values={categories} value={props.category} setValue={props.setCategory} />
      <FilterGroup title="Use case" values={useCases} value={props.useCase} setValue={props.setUseCase} />
      <FilterGroup title="Size" values={sizes} value={props.size} setValue={props.setSize} />
      <FilterGroup title="Color" values={colors} value={props.color} setValue={props.setColor} />
      <div className="mt-6 border-t border-graphite/10 pt-5"><p className="text-xs font-bold uppercase tracking-[0.18em]">Price up to ${props.maxPrice}</p><input className="mt-4 w-full accent-lime" type="range" min="20" max="60" value={props.maxPrice} onChange={(event) => props.setMaxPrice(Number(event.target.value))} /></div>
    </div>
  );
}

function FilterGroup({ title, values, value, setValue }: { title: string; values: string[]; value: string; setValue: (value: string) => void }) {
  return (
    <div className="border-b border-graphite/10 py-5 first:pt-0 last:border-0"><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em]">{title}</p><div className="flex flex-wrap gap-2"><button onClick={() => setValue("")} className={`rounded-full px-3 py-2 text-xs font-bold ${value === "" ? "bg-lime" : "bg-warm"}`}>All</button>{values.map((item) => <button key={item} onClick={() => setValue(item)} className={`rounded-full px-3 py-2 text-xs font-bold ${value === item ? "bg-lime" : "bg-warm"}`}>{item}</button>)}</div></div>
  );
}
