import PageHeader from "@/components/PageHeader";
import OrderCheckout from "@/components/order/OrderCheckout";
import { getProductCategories, getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Online",
};

export default async function OrderPageRoute() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getProductCategories(),
  ]);

  return (
    <>
      <PageHeader
        breadcrumb="Order Online"
        title="Order Fresh Bakes for Pickup"
        subtitle="Choose from today's menu, pick a pickup time, and we'll bake it fresh. Pay when you collect."
      />
      <OrderCheckout products={products} categories={categories} variant="public" />
    </>
  );
}
