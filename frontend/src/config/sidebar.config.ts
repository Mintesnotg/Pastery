import {
  FileText,
  FolderClosedIcon,
  FolderOpen,
  FolderTree,
  KeyRound,
  LockKeyhole,
  MessageSquare,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SidebarItem = {
  name: string;
  route?: string;
  icon: LucideIcon;
  permission: string;
  children?: SidebarItem[];
};

export const sidebarConfig: SidebarItem[] = [
 
  {
    name: "Account Management",
    icon: Shield,
    permission: "account_management.view",
    children: [
      {
        name: "Users",
        route: "/users",
        icon: Users,
        permission: "users.view",
      },
      {
        name: "Roles",
        route: "/roles",
        icon: UserCog,
        permission: "roles.view",
      },
      {
        name: "Permissions",
        route: "/permissions",
        icon: LockKeyhole,
        permission: "permissions.view",
      },
    ],
  },
  {
    name: "Content Management",
    icon: FolderTree,
    permission: "doc_management.view",
    children: [
      {
        name: "Home page",
        icon: FolderClosedIcon,
        route: "/docs/categories",
        permission: "docs_categories.view",
      },
      {
        name: "Product page",
        icon: FolderOpen,
        permission: "hr_docs.view",
        children: [
          {
            name: "All HR Documents",
            route: "/docs/hr/",
            icon: FileText,
            permission: "requirement_doc.view",
          },
        ],
      },
      {
        name: "Header Page",
        icon: ShieldCheck,
        permission: "it_docs.view",
        children: [
          {
            name: "All IT Documents",
            route: "/docs/it",
            icon: KeyRound,
            permission: "access_docs.view",
          },
        ],
      },
    ],
  },
];
