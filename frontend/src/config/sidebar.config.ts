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
    name: "Knowledge Assistant",
    route: "/chatbot",
    icon: MessageSquare,
    permission: "chatbot.view",
  },
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
    name: "Doc Management",
    icon: FolderTree,
    permission: "doc_management.view",
    children: [
      {
        name: "Doc Categories",
        icon: FolderClosedIcon,
        route: "/docs/categories",
        permission: "docs_categories.view",
      },
      {
        name: "HR Documents",
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
        name: "IT Documents",
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
