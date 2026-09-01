"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export type RoleSelectorRole = {
  id: number;
  name: string;
};

type RoleSelectorProps = {
  roles: RoleSelectorRole[] | { data?: RoleSelectorRole[] };
  selectedIds: number[];
  onChange: (ids: number[]) => void;
};

export function RoleSelector({ roles = [], selectedIds, onChange }: RoleSelectorProps) {
  debugger;
  const [search, setSearch] = useState("");
  const roleList = Array.isArray(roles) ? roles : Array.isArray(roles.data) ? roles.data : [];

  const filtered = search.trim()
    ? roleList.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()))
    : roleList;
  debugger;
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
          placeholder="Search roles..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <div className="max-h-44 overflow-y-auto space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
        {filtered.length === 0 ? (
          <p className="py-2 text-center text-sm text-gray-400">No roles found.</p>
        ) : (
          filtered.map((role) => (
            
            <label key={role.id} className="flex cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(role.id)}
                onChange={(e) => toggle(role.id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-crust"
              />
              <span className="text-sm text-gray-700">{role.name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
