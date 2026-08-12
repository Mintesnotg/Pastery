import { db } from "./index.js";
import {
  messages,
  orderItems,
  orders,
  permissions,
  products,
  rolePermissions,
  roles,
  testimonials,
  userRoles,
  users,
} from "./schema.js";
import { hashPassword } from "../lib/auth.js";

async function main() {
  await db.execute(
    `TRUNCATE TABLE payment_events, payments, payment_intents, order_items, orders, role_permissions, user_roles, permissions, roles, users, messages, testimonials, products RESTART IDENTITY CASCADE`
  );

  const productRows = await db.insert(products).values([
    {
      name: "Country Sourdough",
      category: "Bread",
      description: "Slow-fermented sourdough with a caramelized crust and open crumb.",
      price: "6.50",
      image: "https://images.pexels.com/photos/30890566/pexels-photo-30890566.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      featured: true,
      tags: "sourdough,artisan,loaf",
    },
    {
      name: "All-Butter Croissant",
      category: "Pastry",
      description: "Shattered layers of butter and pastry baked fresh each morning.",
      price: "4.20",
      image: "https://images.pexels.com/photos/20002837/pexels-photo-20002837.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      featured: true,
      tags: "croissant,pastry,butter",
    },
    {
      name: "Victoria Sponge Slice",
      category: "Cake",
      description: "Classic layered sponge with raspberry jam and vanilla cream.",
      price: "5.40",
      image: "https://images.pexels.com/photos/32916204/pexels-photo-32916204.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      featured: true,
      tags: "cake,sponge,celebration",
    },
  ]).returning();

  await db.insert(testimonials).values([
    {
      name: "Sarah Jenkins",
      role: "Local Customer",
      content: "The sourdough is genuinely the best I've had outside of Paris.",
      rating: 5,
      active: true,
    },
    {
      name: "James Okafor",
      role: "Regular Since 2019",
      content: "Their almond croissants are dangerously good. The team always remembers my order.",
      rating: 5,
      active: true,
    },
  ]);

  const adminPassword = hashPassword("Bread@12345");
  const [adminUser] = await db.insert(users).values({
    email: "admin@houseofbread.local",
    fullName: "Bootstrap Admin",
    passwordHash: adminPassword.hash,
    passwordSalt: adminPassword.salt,
    active: true,
  }).returning();

  const [adminRole] = await db.insert(roles).values({
    key: "admin",
    name: "Administrator",
    description: "Full administrative access",
  }).returning();

  const permissionRows = await db.insert(permissions).values([
    { key: "orders.read", name: "Read Orders" },
    { key: "orders.write", name: "Update Orders" },
    { key: "orders.delete", name: "Delete Orders" },
    { key: "messages.read", name: "Read Messages" },
    { key: "messages.delete", name: "Delete Messages" },
    { key: "users.manage", name: "Manage Users" },
  ]).returning();

  await db.insert(userRoles).values({
    userId: adminUser.id,
    roleId: adminRole.id,
  });

  await db.insert(rolePermissions).values(permissionRows.map((permission) => ({
    roleId: adminRole.id,
    permissionId: permission.id,
  })));

  const [order] = await db.insert(orders).values({
    customerName: "Amina Yusuf",
    email: "amina@example.com",
    phone: "+44 7700 900111",
    pickupDate: "2026-08-14",
    pickupTime: "09:30",
    notes: "Please pack separately for the office team.",
    subtotal: "15.10",
    taxTotal: "0.00",
    discountTotal: "0.00",
    total: "15.10",
    currency: "GBP",
    status: "pending",
  }).returning();

  await db.insert(orderItems).values([
    {
      orderId: order.id,
      productId: productRows[0].id,
      productName: productRows[0].name,
      productSku: null,
      unitPrice: "6.50",
      quantity: 1,
      lineTotal: "6.50",
      metadata: { source: "seed" },
    },
    {
      orderId: order.id,
      productId: productRows[1].id,
      productName: productRows[1].name,
      productSku: null,
      unitPrice: "4.20",
      quantity: 2,
      lineTotal: "8.40",
      metadata: { source: "seed" },
    },
  ]);

  await db.insert(messages).values([
    {
      name: "Nadia",
      email: "nadia@example.com",
      subject: "Wedding cake enquiry",
      message: "Hi team, could we discuss a 3-tier celebration cake for September?",
      status: "new",
    },
    {
      name: "Omar",
      email: "omar@example.com",
      subject: "Allergen question",
      message: "Do your sourdough loaves contain sesame seeds?",
      status: "new",
    },
  ]);

  console.log("Seed completed successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
