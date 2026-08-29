"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { sidebarConfig, type SidebarItem } from "@/config/sidebar.config";
import { apiUrl } from "@/lib/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function hasPermission(permissions: Set<string>, permission: string): boolean {
  return permissions.has(permission);
}

function filterSidebar(
  items: SidebarItem[],
  permissions: Set<string>,
): SidebarItem[] {
  return items.reduce<SidebarItem[]>((acc, item) => {
    if (!hasPermission(permissions, item.permission)) return acc;
    if (item.children) {
      const filtered = filterSidebar(item.children, permissions);
      if (filtered.length > 0) {
        acc.push({ ...item, children: filtered });
      }
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

// ─── sub-components ─────────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  depth = 0,
  onNavigate,
}: {
  item: SidebarItem;
  depth?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const Icon = item.icon;

  const isActive = item.route
    ? pathname === `/admin${item.route}` ||
      pathname.startsWith(`/admin${item.route}/`)
    : false;

  const hasChildren = item.children && item.children.length > 0;

  useEffect(() => {
    if (hasChildren && item.children) {
      const anyChildActive = item.children.some(
        (child) =>
          child.route &&
          (pathname === `/admin${child.route}` ||
            pathname.startsWith(`/admin${child.route}/`)),
      );
      if (anyChildActive) setOpen(true);
    }
  }, [pathname, hasChildren, item.children]);

  const paddingLeft = 12 + depth * 16;

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{ paddingLeft }}
          className="flex w-full items-center gap-3 rounded-lg py-2 pr-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.name}</span>
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
        {open && (
          <div className="mt-0.5 space-y-0.5">
            {item.children!.map((child) => (
              <SidebarNavItem
                key={child.name}
                item={child}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={`/admin${item.route}`}
      style={{ paddingLeft }}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg py-2 pr-3 text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.name}</span>
    </Link>
  );
}

function Sidebar({
  items,
  onNavigate,
}: {
  items: SidebarItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {items.map((item) => (
        <SidebarNavItem key={item.name} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [fullName, setFullName] = useState("Staff Portal");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/auth/me"), { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) router.replace("/admin/login");
        else {
          const data = await res.json() as { permissions?: string[]; fullName?: string | null; full_name?: string | null };
          setPermissions(new Set(data.permissions ?? []));
          setFullName(data.fullName ?? data.full_name ?? "Staff Portal");
          setAuthChecked(true);
        }
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  const handleSignOut = async () => {
    await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
    router.replace("/admin/login");
  };

  if (!authChecked) return null;

  const visibleItems = filterSidebar(sidebarConfig, permissions);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <span className="text-base font-semibold text-gray-800"> Welcome, {fullName}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Sidebar items={visibleItems} onNavigate={() => setMobileOpen(false)} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-80 shrink-0 border-r  border-gray-200 bg-white lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 transform border-r border-gray-200 bg-white transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="min-w-0 flex-2">
 
          </div>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex items-center hover:cursor-pointer gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
