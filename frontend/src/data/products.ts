export const PRODUCT_CATEGORIES = [
  { id: "Bread", label: "Artisan Bread", description: "Slow-fermented, naturally leavened loaves baked on stone.", image: "https://images.pexels.com/photos/30826792/pexels-photo-30826792.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { id: "Pastry", label: "Pastries", description: "Flaky croissants, viennoiserie and hand-rolled bakes.", image: "https://images.pexels.com/photos/20002837/pexels-photo-20002837.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { id: "Cakes", label: "Cakes & Desserts", description: "Celebration cakes and indulgent desserts made to order.", image: "https://images.pexels.com/photos/32916204/pexels-photo-32916204.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { id: "Cookies", label: "Cookies & Treats", description: "Gooey cookies and wholesome biscuits, baked all day.", image: "https://images.pexels.com/photos/27355747/pexels-photo-27355747.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
  { id: "Coffee", label: "Coffee & Drinks", description: "Single-origin espresso, flat whites and seasonal drinks.", image: "https://images.pexels.com/photos/5427261/pexels-photo-5427261.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
];

export type ProductItem = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  featured: boolean;
  tags?: string;
  isSpecial?: boolean;
};

const images = {
  bread1: "https://images.pexels.com/photos/30826792/pexels-photo-30826792.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  bread2: "https://images.pexels.com/photos/30350350/pexels-photo-30350350.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  bread3: "https://images.pexels.com/photos/30890566/pexels-photo-30890566.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  bread4: "https://images.pexels.com/photos/30666735/pexels-photo-30666735.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  pastry1: "https://images.pexels.com/photos/20002837/pexels-photo-20002837.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  pastry2: "https://images.pexels.com/photos/3850387/pexels-photo-3850387.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  pastry3: "https://images.pexels.com/photos/16192282/pexels-photo-16192282.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  cake1: "https://images.pexels.com/photos/32916204/pexels-photo-32916204.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  cake2: "https://images.pexels.com/photos/31928755/pexels-photo-31928755.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  cake3: "https://images.pexels.com/photos/30233153/pexels-photo-30233153.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  cake4: "https://images.pexels.com/photos/31928753/pexels-photo-31928753.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  cookie1: "https://images.pexels.com/photos/27355747/pexels-photo-27355747.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  cookie2: "https://images.pexels.com/photos/12947814/pexels-photo-12947814.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  coffee1: "https://images.pexels.com/photos/5427261/pexels-photo-5427261.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  coffee2: "https://images.pexels.com/photos/21370678/pexels-photo-21370678.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  coffee3: "https://images.pexels.com/photos/11076843/pexels-photo-11076843.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

export const fallbackProducts: ProductItem[] = [
  { id: 1, name: "Classic Sourdough", category: "Bread", description: "Naturally leavened and fermented for 24 hours for a deep, tangy flavour.", price: 4.5, image: images.bread1, featured: true, tags: "sourdough,artisan" },
  { id: 2, name: "Butter Croissant", category: "Pastry", description: "Golden and flaky with over 100 layers of French butter.", price: 2.9, image: images.pastry1, featured: true, tags: "croissant,flaky" },
  { id: 3, name: "Signature Victoria Sponge", category: "Cakes", description: "Light sponge with fresh raspberry jam and silky vanilla buttercream.", price: 28.0, image: images.cake1, featured: true, tags: "cake,classic" },
  { id: 4, name: "Chocolate Chunk Cookies", category: "Cookies", description: "Chewy and chocolate-drenched with crunchy sea salt.", price: 2.8, image: images.cookie1, featured: true, tags: "cookie,chocolate" },
  { id: 5, name: "Flat White", category: "Coffee", description: "Double ristretto with velvet-smooth micro-foam.", price: 3.4, image: images.coffee1, featured: true, tags: "coffee,espresso" },
  { id: 6, name: "Almond Croissant", category: "Pastry", description: "Frangipane-filled and topped with toasted almonds.", price: 3.8, image: images.pastry3, featured: true, tags: "almond,french" },
  { id: 7, name: "Country Rye", category: "Bread", description: "A hearty dark rye loaf with toasted seeds and a dense, moist crumb.", price: 4.8, image: images.bread2, featured: false, tags: "rye,seeded" },
  { id: 8, name: "Boule de Campagne", category: "Bread", description: "A rustic French country loaf with a soft open crumb.", price: 4.2, image: images.bread3, featured: false, tags: "french,rustic" },
  { id: 9, name: "Harvest Seed Loaf", category: "Bread", description: "Sunflower, linseed and pumpkin seeds for a crunchy crust.", price: 5.2, image: images.bread4, featured: false, tags: "seeded,healthy" },
  { id: 10, name: "Pain au Chocolat", category: "Pastry", description: "Flaky pastry wrapped around rich dark chocolate.", price: 3.4, image: images.pastry2, featured: false, tags: "chocolate,french" },
  { id: 11, name: "Vanilla Cheesecake", category: "Cakes", description: "Creamy baked cheesecake on a golden biscuit base.", price: 5.5, image: images.cake2, featured: false, tags: "cheesecake,dessert" },
  { id: 12, name: "Fresh Cream Cakes", category: "Cakes", description: "Delicate mini cream cakes with silky icing and fresh toppings.", price: 4.2, image: images.cake1, featured: false, tags: "cream,cake" },
  { id: 13, name: "Berry Pavlova", category: "Cakes", description: "Crisp meringue, whipped cream and fresh berries.", price: 6.2, image: images.cake4, featured: false, tags: "meringue,dessert" },
  { id: 14, name: "Cappuccino", category: "Coffee", description: "Perfectly balanced espresso crowned with frothed milk.", price: 3.3, image: images.coffee2, featured: false, tags: "coffee,classic" },
  { id: 15, name: "Caffè Latte", category: "Coffee", description: "Smooth espresso, steamed milk and latte art.", price: 3.6, image: images.coffee3, featured: false, tags: "latte,coffee" },
  { id: 16, name: "Cappuccino & Pastry Duo", category: "Coffee", description: "Our classic cappuccino with a fresh golden croissant.", price: 5.8, image: images.coffee2, featured: false, tags: "combo,breakfast" },
];

export const CONTACT_INFO = {
  address: "24 Crown Lane, London N19 4NP",
  phone: "+44 20 7946 0958",
  email: "hello@houseofbreadlondon.co.uk",
  hours: [
    { day: "Monday – Friday", time: "7:00 AM – 6:00 PM" },
    { day: "Saturday", time: "8:00 AM – 6:00 PM" },
    { day: "Sunday", time: "8:00 AM – 3:00 PM" },
  ],
};

export const GALLERY_IMAGES = [
  { src: "https://images.pexels.com/photos/30826792/pexels-photo-30826792.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", alt: "Artisan sourdough loaves on display", caption: "Our morning sourdough bake" },
  { src: "https://images.pexels.com/photos/20002837/pexels-photo-20002837.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", alt: "Fresh golden croissants", caption: "Laminated to perfection" },
  { src: "https://images.pexels.com/photos/32916204/pexels-photo-32916204.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", alt: "Mini cream cakes", caption: "Small cakes, big flavour" },
  { src: "https://images.pexels.com/photos/27355747/pexels-photo-27355747.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", alt: "Chocolate chip cookies with coffee", caption: "Cookies ready for their coffee" },
  { src: "https://images.pexels.com/photos/29380155/pexels-photo-29380155.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", alt: "Cozy bakery interior", caption: "Our shop at peak freshness" },
  { src: "https://images.pexels.com/photos/5947593/pexels-photo-5947593.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", alt: "Hands kneading dough", caption: "Every loaf, hand-shaped" },
  { src: "https://images.pexels.com/photos/21370678/pexels-photo-21370678.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", alt: "Cappuccino and croissants", caption: "The perfect pairing" },
  { src: "https://images.pexels.com/photos/30666735/pexels-photo-30666735.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", alt: "Bread basket with herbs", caption: "Rustic bakes, seasonal herbs" },
  { src: "https://images.pexels.com/photos/30233153/pexels-photo-30233153.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", alt: "Elegant celebration cake", caption: "Celebration cakes, made to order" },
  { src: "https://images.pexels.com/photos/5403020/pexels-photo-5403020.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", alt: "Kneading dough with flour dust", caption: "Flour on, craft in" },
];
