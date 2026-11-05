import { prisma } from "../db/index.js";
import { hashPassword } from "../shared/lib/auth.js";

const ADMIN_EMAIL = "admin@houseofbread.local";
const ADMIN_PASSWORD = "Bread@12345";

const roles = [
  { key: "admin", name: "Administrator", description: "Full administrative access" },
  { key: "customer", name: "Customer", description: "Default storefront customer account" },
  { key: "cafe", name: "Cafe", description: "Approved B2B cafe / wholesale account" },
] as const;

const permissions = [
  { key: "view.orders", name: "View Orders" },
  { key: "create.order", name: "Create Order" },
  { key: "view.profile", name: "View Profile" },
  { key: "edit.profile", name: "Edit Profile" },
  { key: "view.messages", name: "View Messages" },
  { key: "view.users", name: "View Users" },
  { key: "view.roles", name: "View Roles" },
  { key: "view.permissions", name: "View Permissions" },
  { key: "view.account_management", name: "View Account Management" },
  { key: "view.content_management", name: "View Content Management" },
  { key: "view.operational", name: "View Operational" },
  { key: "view.others", name: "View Others" },
  { key: "view.banner", name: "View Banners" },
  { key: "create.banner", name: "Create Banner" },
  { key: "update.banner", name: "Update Banner" },
  { key: "delete.banner", name: "Delete Banner" },
  { key: "view.product", name: "View Products" },
  { key: "create.product", name: "Create Product" },
  { key: "update.product", name: "Update Product" },
  { key: "delete.product", name: "Delete Product" },
  { key: "view.product_category", name: "View Product Categories" },
  { key: "create.product_category", name: "Create Product Category" },
  { key: "update.product_category", name: "Update Product Category" },
  { key: "delete.product_category", name: "Delete Product Category" },
  { key: "create.user", name: "Create User" },
  { key: "update.user", name: "Update User" },
  { key: "delete.user", name: "Delete User" },
  { key: "create.role", name: "Create Role" },
  { key: "update.role", name: "Update Role" },
  { key: "delete.role", name: "Delete Role" },
  { key: "create.permission", name: "Create Permission" },
  { key: "update.permission", name: "Update Permission" },
  { key: "delete.permission", name: "Delete Permission" },
  { key: "view.business_account", name: "View Own Business Account" },
  { key: "create.standing_order", name: "Create Standing Order" },
  { key: "view.invoices", name: "View Invoices" },
  { key: "view.business_accounts", name: "View Business Accounts" },
  { key: "approve.business_account", name: "Approve Business Account" },
  { key: "manage.credit", name: "Manage Credit" },
  { key: "create.invoice", name: "Create Invoice" },
  { key: "record.payment", name: "Record Invoice Payment" },
  { key: "manage.collections", name: "Manage Collections" },
  { key: "view.production", name: "View Production Board" },
  { key: "manage.standing_orders", name: "Manage Standing Orders" },
  { key: "manage.settings", name: "Manage App Settings" },
] as const;

const customerPermissionKeys = ["create.order", "view.profile", "edit.profile"] as const;
const cafePermissionKeys = [
  "create.order",
  "view.profile",
  "edit.profile",
  "view.business_account",
  "create.standing_order",
  "view.invoices",
] as const;

const settings = [
  { key: "order.timezone", value: "Europe/London" },
  { key: "order.cutoff_time", value: "14:00" },
  { key: "order.min_lead_days", value: "1" },
] as const;

export async function ensureAdmin() {
  let user = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } });
  if (!user) {
    const password = hashPassword(ADMIN_PASSWORD);
    user = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        firstName: "Bootstrap",
        lastName: "Admin",
        fullName: "Bootstrap Admin",
        passwordHash: password.hash,
        passwordSalt: password.salt,
        active: true,
        emailVerifiedAt: new Date(),
      },
    });
  }

  for (const role of roles) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: {},
      create: role,
    });
  }

  await prisma.permission.createMany({ data: [...permissions], skipDuplicates: true });

  const roleRows = await prisma.role.findMany({
    where: { key: { in: roles.map((role) => role.key) } },
  });
  const permissionRows = await prisma.permission.findMany({
    where: { key: { in: permissions.map((permission) => permission.key) } },
  });
  const roleId = (key: string) => {
    const role = roleRows.find((row) => row.key === key);
    if (!role) throw new Error(`Role ${key} was not created`);
    return role.id;
  };
  const permissionIds = (keys: readonly string[]) =>
    permissionRows.filter((permission) => keys.includes(permission.key)).map((permission) => permission.id);

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: roleId("admin") } },
    update: {},
    create: { userId: user.id, roleId: roleId("admin") },
  });

  const links = [
    { roleKey: "admin", keys: permissions.map((permission) => permission.key) },
    { roleKey: "customer", keys: customerPermissionKeys },
    { roleKey: "cafe", keys: cafePermissionKeys },
  ];
  await prisma.rolePermission.createMany({
    data: links.flatMap((link) =>
      permissionIds(link.keys).map((permissionId) => ({
        roleId: roleId(link.roleKey),
        permissionId,
      })),
    ),
    skipDuplicates: true,
  });

  for (const setting of settings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
}
