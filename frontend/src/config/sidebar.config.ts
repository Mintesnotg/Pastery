import {
  FileText,
  FolderTree,
  Image,
  LockKeyhole,
  Package,
  Shield,
  Tags,
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
        name: "Products",
        route: "/products",
        icon: Package,
        permission: "view.product",
      },
      {
        name: "Categories",
        route: "/product-categories",
        icon: Tags,
        permission: "view.product_category",
      },
      {
        name: "Home page",
        icon: FileText,
        route: "/docs/categories",
        permission: "view.home_content",
      },
    ],
  },
];
