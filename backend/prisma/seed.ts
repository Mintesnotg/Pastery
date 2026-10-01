import { prisma } from "../src/db/index.js";
import { hashPassword } from "../src/shared/lib/auth.js";

async function main() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE payment_events, payments, payment_intents, order_items, orders, role_permissions, user_roles, permissions, roles, users, messages, banners, testimonials, products, product_categories RESTART IDENTITY CASCADE`,
  );

  const categories = await Promise.all(
    [
      { name: "Cakes", description: "Celebration cakes and everyday slices." },
      { name: "Breads", description: "Slow-fermented artisan loaves." },
      { name: "Pastries", description: "Laminated viennoiserie and morning pastries." },
      { name: "Cookies", description: "Chewy cookies and wholesome biscuits." },
      { name: "Drinks", description: "Coffee, tea, and bakery drinks." },
    ].map((c) => prisma.productCategory.create({ data: c })),
  );

  const byName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  const productRows = await Promise.all([
    prisma.product.create({
      data: {
        name: "Classic Sourdough",
        description: "Naturally leavened loaf with a caramelized crust and open crumb.",
        price: "4.50",
        image:
          "https://images.pexels.com/photos/30890566/pexels-photo-30890566.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: true,
        categoryId: byName.Breads,
      },
    }),
    prisma.product.create({
      data: {
        name: "All-Butter Croissant",
        description: "Shattered layers of butter and pastry baked fresh each morning.",
        price: "3.80",
        image:
          "https://images.pexels.com/photos/20002837/pexels-photo-20002837.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: true,
        categoryId: byName.Pastries,
      },
    }),
    prisma.product.create({
      data: {
        name: "Signature Chocolate Cake",
        description: "Rich cocoa sponge with dark ganache and a soft crumb.",
        price: "32.00",
        image:
          "https://images.pexels.com/photos/32916204/pexels-photo-32916204.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: true,
        categoryId: byName.Cakes,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sea Salt Chocolate Cookie",
        description: "Chewy chocolate cookie finished with flaky sea salt.",
        price: "2.80",
        image:
          "https://images.pexels.com/photos/27355747/pexels-photo-27355747.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: true,
        categoryId: byName.Cookies,
      },
    }),
    prisma.product.create({
      data: {
        name: "Victoria Sponge Slice",
        description: "Raspberry jam, vanilla buttercream.",
        price: "4.20",
        image:
          "https://images.pexels.com/photos/31928755/pexels-photo-31928755.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: false,
        categoryId: byName.Cakes,
      },
    }),
    prisma.product.create({
      data: {
        name: "Country Rye",
        description: "Hearty dark rye with toasted seeds and a moist crumb.",
        price: "4.80",
        image:
          "https://images.pexels.com/photos/30350350/pexels-photo-30350350.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: false,
        categoryId: byName.Breads,
      },
    }),
    prisma.product.create({
      data: {
        name: "Pain au Chocolat",
        description: "Flaky pastry wrapped around rich dark chocolate.",
        price: "3.40",
        image:
          "https://images.pexels.com/photos/3850387/pexels-photo-3850387.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: false,
        categoryId: byName.Pastries,
      },
    }),
    prisma.product.create({
      data: {
        name: "Oat & Raisin Cookie",
        description: "Soft oat cookie with plump raisins and brown sugar.",
        price: "2.50",
        image:
          "https://images.pexels.com/photos/12947814/pexels-photo-12947814.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: false,
        categoryId: byName.Cookies,
      },
    }),
    prisma.product.create({
      data: {
        name: "Flat White",
        description: "Double ristretto with velvet-smooth microfoam.",
        price: "3.40",
        image:
          "https://images.pexels.com/photos/5427261/pexels-photo-5427261.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: false,
        categoryId: byName.Drinks,
      },
    }),
    prisma.product.create({
      data: {
        name: "Caffè Latte",
        description: "Smooth espresso, steamed milk, and latte art.",
        price: "3.60",
        image:
          "https://images.pexels.com/photos/21370678/pexels-photo-21370678.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: false,
        categoryId: byName.Drinks,
      },
    }),
    prisma.product.create({
      data: {
        name: "Berry Pavlova Slice",
        description: "Crisp meringue, whipped cream, and fresh berries.",
        price: "5.20",
        image:
          "https://images.pexels.com/photos/31928753/pexels-photo-31928753.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: false,
        categoryId: byName.Cakes,
      },
    }),
    prisma.product.create({
      data: {
        name: "Harvest Seed Loaf",
        description: "Sunflower, linseed, and pumpkin seeds for a crunchy crust.",
        price: "5.20",
        image:
          "https://images.pexels.com/photos/30666735/pexels-photo-30666735.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        isSpecial: false,
        categoryId: byName.Breads,
      },
    }),
  ]);

  await prisma.banner.createMany({
    data: [
      {
        title: "Summer Sourdough",
        altText: "Fresh sourdough loaves on a wooden board",
        imageUrl:
          "https://images.pexels.com/photos/30890566/pexels-photo-30890566.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        ctaLabel: "Order Now",
        ctaLink: "/order",
        overlayHeading: "Baked Fresh Daily",
        overlaySubheading: "Artisan bread from our North London kitchen",
        active: true,
        sortOrder: 1,
      },
      {
        title: "Morning Pastries",
        altText: "Golden croissants on a bakery counter",
        imageUrl:
          "https://images.pexels.com/photos/20002837/pexels-photo-20002837.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        ctaLabel: "View Menu",
        ctaLink: "/products",
        overlayHeading: "Fresh at 8 AM",
        overlaySubheading: "All-butter croissants and seasonal bakes",
        active: true,
        sortOrder: 2,
      },
      {
        title: "Celebration Cakes",
        altText: "Decorated celebration cake with fresh flowers",
        imageUrl:
          "https://images.pexels.com/photos/32916204/pexels-photo-32916204.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        ctaLabel: "Enquire",
        ctaLink: "/contact",
        overlayHeading: "Made to Order",
        overlaySubheading: "Custom cakes for weddings and special occasions",
        active: false,
        sortOrder: 3,
      },
    ],
  });

  await prisma.testimonial.createMany({
    data: [
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
    ],
  });

  const adminPassword = hashPassword("Bread@12345");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@houseofbread.local",
      firstName: "Bootstrap",
      lastName: "Admin",
      fullName: "Bootstrap Admin",
      passwordHash: adminPassword.hash,
      passwordSalt: adminPassword.salt,
      active: true,
      emailVerifiedAt: new Date(),
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      key: "admin",
      name: "Administrator",
      description: "Full administrative access",
    },
  });

  const customerRole = await prisma.role.create({
    data: {
      key: "customer",
      name: "Customer",
      description: "Default storefront customer account",
    },
  });

  const permissionKeys = [
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
  ];

  await prisma.permission.createMany({ data: permissionKeys });
  const permissionRows = await prisma.permission.findMany({
    where: { key: { in: permissionKeys.map((p) => p.key) } },
  });

  await prisma.userRole.create({
    data: { userId: adminUser.id, roleId: adminRole.id },
  });

  await prisma.rolePermission.createMany({
    data: permissionRows.map((permission) => ({
      roleId: adminRole.id,
      permissionId: permission.id,
    })),
  });

  const customerPermissionKeys = ["create.order", "view.profile", "edit.profile"] as const;
  const customerPermissions = permissionRows.filter((p) =>
    (customerPermissionKeys as readonly string[]).includes(p.key),
  );
  await prisma.rolePermission.createMany({
    data: customerPermissions.map((permission) => ({
      roleId: customerRole.id,
      permissionId: permission.id,
    })),
  });

  const order = await prisma.order.create({
    data: {
      userId: adminUser.id,
      customerName: "Amina Yusuf",
      email: "amina@example.com",
      phone: "+44 7700 900111",
      pickupDate: "2026-08-14",
      pickupTime: "09:30",
      notes: "Please pack separately for the office team.",
      total: "15.10",
      currency: "GBP",
      status: "pending",
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order.id,
        productId: productRows[0].id,
        productName: productRows[0].name,
        unitPrice: "4.50",
        quantity: 1,
        lineTotal: "4.50",
      },
      {
        orderId: order.id,
        productId: productRows[1].id,
        productName: productRows[1].name,
        unitPrice: "3.80",
        quantity: 2,
        lineTotal: "7.60",
      },
    ],
  });

  await prisma.message.createMany({
    data: [
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
    ],
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
