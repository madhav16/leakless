/**
 * SubscriptionCard — business component stub.
 * Renders a single subscription's key info.
 * Will use ShadCN Card from @/ui/card.
 *
 * @param {{ subscription: object }} props
 */
export default function SubscriptionCard({ subscription }) {
  return (
    <div className="rounded-lg border border-white/5 bg-surface-200 p-4">
      <h3 className="font-semibold text-white">{subscription?.name}</h3>
      <p className="mt-1 text-sm text-slate-400">
        ${subscription?.cost} / {subscription?.billing_cycle}
      </p>
    </div>
  );
}
