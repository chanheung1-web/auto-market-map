"use client";

import { useState } from "react";
import { LAYER_LABELS, LAYER_ORDER, type Company } from "@/lib/companies";
import { REGION_ORDER } from "@/lib/regions";

type HiddenCompany = { id: string; name: string };

type Props = {
  onAdded: (
    companies: Company[],
    addedIds: string[],
    hidden: HiddenCompany[],
  ) => void;
};

export function AddCompanyForm({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [layer, setLayer] = useState<string>(LAYER_ORDER[0]);
  const [region, setRegion] = useState<string>("日本");
  const [position, setPosition] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code, layer, region, position }),
    })
      .then((res) => res.json())
      .then(
        (data: {
          ok: boolean;
          error?: string;
          companies?: Company[];
          addedIds?: string[];
          hidden?: HiddenCompany[];
        }) => {
          if (!data.ok) {
            setError(data.error ?? "追加できませんでした");
            return;
          }
          onAdded(data.companies ?? [], data.addedIds ?? [], data.hidden ?? []);
          setName("");
          setCode("");
          setPosition("");
          setOpen(false);
        },
      )
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "追加できませんでした");
      })
      .finally(() => setBusy(false));
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 transition hover:bg-zinc-800"
      >
        ＋ 銘柄を追加
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-2 rounded-lg border border-zinc-700 bg-zinc-900 p-3"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-0.5 block text-[11px] text-zinc-400">銘柄名</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 東海理化"
            required
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-sky-500"
          />
        </label>

        <label className="block">
          <span className="mb-0.5 block text-[11px] text-zinc-400">
            Yahoo シンボル（日本株は .T が必要）
          </span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="例: 6995.T"
            required
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-sky-500"
          />
        </label>

        <label className="block">
          <span className="mb-0.5 block text-[11px] text-zinc-400">階層</span>
          <select
            value={layer}
            onChange={(e) => setLayer(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-sky-500"
          >
            {LAYER_ORDER.map((l) => (
              <option key={l} value={l}>
                {LAYER_LABELS[l]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-0.5 block text-[11px] text-zinc-400">地域</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-sky-500"
          >
            {REGION_ORDER.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-0.5 block text-[11px] text-zinc-400">
          ひとこと説明（任意）
        </span>
        <input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="例: スイッチ・シフト・スマートキー"
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-sky-500"
        />
      </label>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded border border-sky-600 bg-sky-900/60 px-3 py-1 text-xs text-sky-100 transition hover:bg-sky-800/60 disabled:opacity-50"
        >
          {busy ? "確認中…" : "追加"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-xs text-zinc-400 hover:underline"
        >
          やめる
        </button>
        <span className="text-[11px] text-zinc-500">
          保存前に Yahoo で株価が引けるか確認します
        </span>
      </div>
    </form>
  );
}
