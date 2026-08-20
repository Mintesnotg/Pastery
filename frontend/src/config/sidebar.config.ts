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
    permission: "view_chatbot",
  },
  {
    name: "Account Management",
    icon: Shield,
    permission: "view_account_management",
    children: [
      {
        name: "Users",
        route: "/users",
        icon: Users,
        permission: "view_users",
      },
      {
        name: "Roles",
        route: "/roles",
        icon: UserCog,
        permission: "view_roles",
      },
      {
        name: "Permissions",
        route: "/permissions",
        icon: LockKeyhole,
        permission: "view_permissions",
      },
    ],
  },
  {
    name: "Doc Management",
    icon: FolderTree,
    permission: "view_doc_management",
    children: [
      {
        name: "Doc Categories",
        icon: FolderClosedIcon,
        route: "/docs/categories",
        permission: "view_docs_categories",
      },
      {
        name: "HR Documents",
        icon: FolderOpen,
        permission: "view_hr_docs",
        children: [
          {
            name: "All HR Documents",
            route: "/docs/hr/",
            icon: FileText,
            permission: "view_requirement_doc",
          },
        ],
      },
      {
        name: "IT Documents",
        icon: ShieldCheck,
        permission: "view_it_docs",
        children: [
          {
            name: "All IT Documents",
            route: "/docs/it",
            icon: KeyRound,
            permission: "view_access_docs",
          },
        ],
      },
    ],
  },
];
