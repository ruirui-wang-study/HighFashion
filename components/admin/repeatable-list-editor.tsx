"use client";

type RepeatableListEditorProps<T extends Record<string, string>> = {
  title: string;
  description?: string;
  items: T[];
  emptyItem: T;
  fields: Array<{ key: keyof T; label: string; multiline?: boolean }>;
  onChange: (items: T[]) => void;
};

export function RepeatableListEditor<T extends Record<string, string>>({
  title,
  description,
  items,
  emptyItem,
  fields,
  onChange,
}: RepeatableListEditorProps<T>) {
  function updateItem(index: number, key: keyof T, value: string) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function addItem() {
    onChange([...items, { ...emptyItem }]);
  }

  return (
    <section className="rounded-3xl bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">{title}</p>
          {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
        </div>
        <button type="button" onClick={addItem} className="rounded-full bg-graphite px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
          Add item
        </button>
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-2xl border border-graphite/10 bg-warm p-4">
            <div className="grid gap-3">
              {fields.map((field) =>
                field.multiline ? (
                  <label key={String(field.key)} className="grid gap-2 text-sm font-bold text-graphite">
                    {field.label}
                    <textarea
                      value={item[field.key]}
                      onChange={(event) => updateItem(index, field.key, event.target.value)}
                      className="min-h-28 rounded-2xl border border-graphite/10 bg-white px-4 py-3 text-sm font-normal outline-none"
                    />
                  </label>
                ) : (
                  <label key={String(field.key)} className="grid gap-2 text-sm font-bold text-graphite">
                    {field.label}
                    <input
                      value={item[field.key]}
                      onChange={(event) => updateItem(index, field.key, event.target.value)}
                      className="rounded-2xl border border-graphite/10 bg-white px-4 py-3 text-sm font-normal outline-none"
                    />
                  </label>
                ),
              )}
            </div>
            <button type="button" onClick={() => removeItem(index)} className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-red-700">
              Remove
            </button>
          </div>
        ))}
        {!items.length ? <p className="text-sm text-muted">No items yet.</p> : null}
      </div>
    </section>
  );
}
