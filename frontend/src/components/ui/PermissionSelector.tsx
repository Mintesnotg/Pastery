"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export type PermissionSelectorItem = {
  id: number;
  name: string;
  key: string;
};

type PermissionSelectorProps = {
  permissions: PermissionSelectorItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
};

export function PermissionSelector({ permissions, selectedIds, onChange }: PermissionSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          p.key.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : permissions;

  const toggle = (id: number, checked: boolean) => {
    onChange(checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id));
  };

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search permissions..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <div className="max-h-44 overflow-y-auto space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
        {filtered.length === 0 ? (
          <p className="py-2 text-center text-sm text-gray-400">No permissions found.</p>
        ) : (
          filtered.map((perm) => (
            <label key={perm.id} className="flex cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(perm.id)}
                onChange={(e) => toggle(perm.id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-crust"
              />
              <span className="text-sm text-gray-700">{perm.name}</span>
              <span className="ml-auto text-xs text-gray-400">{perm.key}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
