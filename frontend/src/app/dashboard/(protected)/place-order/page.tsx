import OrderCheckout from "@/components/order/OrderCheckout";
import { CartProvider } from "@/context/CartContext";
import { getProductCategories, getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Place Order",
};

export default async function PlaceOrderPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getProductCategories(),
  ]);

  return (
    <CartProvider>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Place Order</h1>
        <p className="mt-1 text-sm text-gray-500">
          Build your basket and schedule a pickup. After checkout you&apos;ll see your orders.
        </p>
      </div>
      <OrderCheckout products={products} categories={categories} variant="dashboard" />
    </CartProvider>
  );
}
