import {
  FileText,
  FolderClosedIcon,
  FolderOpen,
  FolderTree,
  Image,
  KeyRound,
  LockKeyhole,
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
    permission: "view.account_management",
    children: [
      {
        name: "Users",
        route: "/users",
        icon: Users,
        permission: "view.users",
      },
      {
        name: "Roles",
        route: "/roles",
        icon: UserCog,
        permission: "view.roles",
      },
      {
        name: "Permissions",
        route: "/permissions",
        icon: LockKeyhole,
        permission: "view.permissions",
      },
    ],
  },
  {
    name: "Content Management",
    icon: FolderTree,
    permission: "view.content_management",
    children: [
      {
        name: "Banners",
        route: "/banner",
        icon: Image,
        permission: "view.banner",
      },
      {
        name: "Home page",
        icon: FolderClosedIcon,
        route: "/docs/categories",
        permission: "view.home_content",
      },
      {
        name: "Product page",
        icon: FolderOpen,
        permission: "view.product_content",
        children: [
          {
            name: "All Cakes",
            route: "/docs/hr/",
            icon: FileText,
            permission: "view.cake_content",
          },
        ],
      },
      {
        name: "Header Page",
        icon: ShieldCheck,
        permission: "view.it_docs",
        children: [
          {
            name: "All Header Contents",
            route: "/docs/it",
            icon: KeyRound,
            permission: "view.header_content",
          },
        ],
      },
    ],
  },
];
