import CartView from "@/components/storefront/CartView";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">سلتك</h1>
      <CartView />
    </div>
  );
}
