import PageHeader from "@/components/PageHeader";
import OrderPage from "./OrderPage";
import { getProducts, toProductItem } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Online",
};

export default async function OrderPageRoute() {
  const products = (await getProducts()).map(toProductItem);
  return (
    <>
      <PageHeader
        breadcrumb="Order Online"
        title="Order Fresh Bakes for Pickup"
        subtitle="Choose from today's menu, pick a pickup time, and we'll bake it fresh. Pay when you collect."
      />
      <OrderPage products={products} />
    </>
  );
}
