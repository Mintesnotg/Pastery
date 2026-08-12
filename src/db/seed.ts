import { db } from "@/db";
import { products, testimonials } from "@/db/schema";

const productData = [
  // Artisan Bread
  {
    name: "Classic Sourdough",
    category: "Bread",
    description:
      "Our signature naturally leavened sourdough, fermented for 24 hours for a deep, tangy flavour and crisp, crackling crust.",
    price: "4.50",
    image:
      "https://images.pexels.com/photos/30826792/pexels-photo-30826792.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: true,
    tags: "sourdough,artisan,best-seller",
  },
  {
    name: "Country Rye",
    category: "Bread",
    description:
      "A hearty dark rye loaf with toasted seeds and a moist, dense crumb. Perfect with smoked fish or sharp cheese.",
    price: "4.80",
    image:
      "https://images.pexels.com/photos/30350350/pexels-photo-30350350.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "rye,seeded,artisan",
  },
  {
    name: "Boule de Campagne",
    category: "Bread",
    description:
      "A rustic French country loaf with a soft open crumb and a lightly nutty flavour from stone-milled flour.",
    price: "4.20",
    image:
      "https://images.pexels.com/photos/30890566/pexels-photo-30890566.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "french,rustic",
  },
  {
    name: "Harvest Seed Loaf",
    category: "Bread",
    description:
      "Packed with sunflower, linseed and pumpkin seeds for a crunchy crust and nutritious, flavourful crumb.",
    price: "5.20",
    image:
      "https://images.pexels.com/photos/30666735/pexels-photo-30666735.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: true,
    tags: "seeded,healthy",
  },
  {
    name: "Stone-Milled White Tin",
    category: "Bread",
    description:
      "A soft, pillowy white loaf baked in a traditional tin with stone-milled flour for a superior flavour.",
    price: "3.80",
    image:
      "https://images.pexels.com/photos/13247705/pexels-photo-13247705.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "white,sandwich",
  },
  {
    name: "Multigrain Bloomer",
    category: "Bread",
    description:
      "A generously sized bloomer packed with five different grains and seeds for daily goodness.",
    price: "4.60",
    image:
      "https://images.pexels.com/photos/10202985/pexels-photo-10202985.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "multigrain,seeded",
  },
  // Pastries
  {
    name: "Butter Croissant",
    category: "Pastry",
    description:
      "A golden, flaky croissant laminated with over 100 layers of French butter. Melt-in-the-mouth perfection.",
    price: "2.90",
    image:
      "https://images.pexels.com/photos/20002837/pexels-photo-20002837.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: true,
    tags: "croissant,flaky,best-seller",
  },
  {
    name: "Pain au Chocolat",
    category: "Pastry",
    description:
      "Flaky puff pastry wrapped around two sticks of rich dark chocolate. A Parisian morning favourite.",
    price: "3.40",
    image:
      "https://images.pexels.com/photos/3850387/pexels-photo-3850387.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "chocolate,french",
  },
  {
    name: "Almond Croissant",
    category: "Pastry",
    description:
      "Day-fresh croissant filled with frangipane, topped with toasted almonds and a dusting of icing sugar.",
    price: "3.80",
    image:
      "https://images.pexels.com/photos/16192282/pexels-photo-16192282.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: true,
    tags: "almond,french",
  },
  {
    name: "Traditional Bagels",
    category: "Pastry",
    description:
      "Hand-rolled, boiled and baked bagels with a glossy crust. Choose plain, sesame or everything.",
    price: "2.20",
    image:
      "https://images.pexels.com/photos/7405059/pexels-photo-7405059.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "bagel,baked",
  },
  // Cakes & Desserts
  {
    name: "Signature Victoria Sponge",
    category: "Cakes",
    description:
      "Light vanilla sponge layered with fresh raspberry jam and silky vanilla buttercream. A true British classic.",
    price: "28.00",
    image:
      "https://images.pexels.com/photos/32916204/pexels-photo-32916204.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: true,
    tags: "cake,classic,celebration",
  },
  {
    name: "Vanilla Cheesecake",
    category: "Cakes",
    description:
      "Creamy baked cheesecake on a golden biscuit base, finished with fresh seasonal fruit.",
    price: "5.50",
    image:
      "https://images.pexels.com/photos/31928755/pexels-photo-31928755.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "cheesecake,dessert",
  },
  {
    name: "Wedding & Celebration Cakes",
    category: "Cakes",
    description:
      "Bespoke celebration cakes made to order. Every layer is hand-crafted for your special day. Contact us to discuss.",
    price: "65.00",
    image:
      "https://images.pexels.com/photos/30233153/pexels-photo-30233153.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "wedding,bespoke,custom",
  },
  {
    name: "Berry Pavlova",
    category: "Cakes",
    description:
      "Crisp meringue, whipped cream and a riot of fresh berries. Light, indulgent and utterly delicious.",
    price: "6.20",
    image:
      "https://images.pexels.com/photos/31928753/pexels-photo-31928753.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "meringue,dessert,fruity",
  },
  {
    name: "Blue Velvet Cupcake",
    category: "Cakes",
    description:
      "Velvety blue sponge topped with a generous swirl of cream-cheese frosting. A show-stopping treat.",
    price: "3.60",
    image:
      "https://images.pexels.com/photos/12927171/pexels-photo-12927171.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "cupcake,velvet",
  },
  // Cookies & Treats
  {
    name: "Chocolate Chunk Cookies",
    category: "Cookies",
    description:
      "Chewy, chocolate-drenched cookies with crunchy sea salt. Baked throughout the day while stocks last.",
    price: "2.80",
    image:
      "https://images.pexels.com/photos/27355747/pexels-photo-27355747.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: true,
    tags: "cookie,chocolate",
  },
  {
    name: "Triple Choc Stack",
    category: "Cookies",
    description:
      "Three layers of triple-chocolate delight — the perfect companion to our flat whites and lattes.",
    price: "3.10",
    image:
      "https://images.pexels.com/photos/12947814/pexels-photo-12947814.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "chocolate,indulgent",
  },
  {
    name: "Oat & Berry Biscuits",
    category: "Cookies",
    description:
      "Hearty oat biscuits studded with chewy dried berries — a wholesome bake for any time of day.",
    price: "2.40",
    image:
      "https://images.pexels.com/photos/6748971/pexels-photo-6748971.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "oats,berries,healthy",
  },
  {
    name: "Matcha & Dark Choc Cookies",
    category: "Cookies",
    description:
      "Earthy Japanese matcha meets rich dark chocolate in our most adventurous cookie yet.",
    price: "3.20",
    image:
      "https://images.pexels.com/photos/33313174/pexels-photo-33313174.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "matcha,special",
  },
  // Coffee & Drinks
  {
    name: "Flat White",
    category: "Coffee",
    description:
      "Double ristretto with velvet-smooth micro-foam, made with our single-origin espresso beans.",
    price: "3.40",
    image:
      "https://images.pexels.com/photos/5427261/pexels-photo-5427261.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: true,
    tags: "coffee,espresso",
  },
  {
    name: "Cappuccino",
    category: "Coffee",
    description:
      "A perfectly balanced espresso crowned with generous frothed milk and a dusting of cocoa.",
    price: "3.30",
    image:
      "https://images.pexels.com/photos/21370678/pexels-photo-21370678.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "coffee,classic",
  },
  {
    name: "Caffè Latte",
    category: "Coffee",
    description:
      "Smooth espresso stretched with steamed milk and finished with latte art. Comfort in a cup.",
    price: "3.60",
    image:
      "https://images.pexels.com/photos/11076843/pexels-photo-11076843.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "latte,coffee",
  },
  {
    name: "Cappuccino & Pastry Duo",
    category: "Coffee",
    description:
      "Our classic cappuccino served with your choice of a fresh golden croissant. The London breakfast.",
    price: "5.80",
    image:
      "https://images.pexels.com/photos/4128502/pexels-photo-4128502.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    featured: false,
    tags: "combo,breakfast",
  },
];

const testimonialData = [
  {
    name: "Sarah Jenkins",
    role: "Local Customer",
    content:
      "The sourdough from House of Bread is genuinely the best I've had outside of Paris. The crackle when you cut the crust, the soft tangy crumb — absolute perfection. We're here every weekend!",
    rating: 5,
  },
  {
    name: "James Okafor",
    role: "Regular since 2019",
    content:
      "Their almond croissants are dangerously good. The team always remembers my order and greets me by name. A true gem in North London.",
    rating: 5,
  },
  {
    name: "Emily Chen",
    role: "Wedding Customer",
    content:
      "How delighted our family wedding looked with the bespoke cake House of Bread made. Beautiful, delicious and delivered exactly on time. Five stars all the way.",
    rating: 5,
  },
  {
    name: "Marcus Reed",
    role: "Coffee Enthusiast",
    content:
      "Excellent flat whites and the chocolate chunk cookies are the perfect pairing. The atmosphere is warm and the staff genuinely care. It's become my daily ritual.",
    rating: 4,
  },
];

export async function seed() {
  console.log("Seeding products...");
  await db.insert(products).values(productData).onConflictDoNothing();

  console.log("Seeding testimonials...");
  await db.insert(testimonials).values(testimonialData).onConflictDoNothing();

  console.log("Seed complete.");
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
