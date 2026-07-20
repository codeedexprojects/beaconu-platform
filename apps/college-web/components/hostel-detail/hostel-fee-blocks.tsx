import type {
  PublicHostelFeeBlock,
  PublicHostelParkingBlock,
  PublicHostelPlan,
  PublicHostelSimplePlanBlock,
} from "@beaconu/types";

function PlanCard({ plan }: { plan: PublicHostelPlan }) {
  const tags = [...(plan.feature_tags ?? []), ...(plan.meal_tags ?? [])];

  return (
    <div className="rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{plan.name}</p>
        {plan.subtitle ? (
          <span className="text-xs text-muted-foreground">{plan.subtitle}</span>
        ) : null}
      </div>
      <p className="mt-2 text-lg font-bold tracking-tight">
        {plan.currency}
        {plan.price}
        <span className="text-sm font-normal text-muted-foreground">
          {" "}
          {plan.period}
        </span>
      </p>
      {tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {plan.additional_charges?.length ? (
        <ul className="mt-2 space-y-1 border-t border-border/60 pt-2">
          {plan.additional_charges.map((charge, i) => (
            <li key={i} className="text-xs text-muted-foreground">
              {charge}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function HostelFeesBlock({ fees }: { fees: PublicHostelFeeBlock }) {
  const roomTypes = fees.room_types ?? [];
  if (roomTypes.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {fees.title}
      </p>
      <div className="mt-3 space-y-5">
        {roomTypes.map((rt, i) => (
          <div key={i}>
            <p className="text-sm font-medium">{rt.room_type_label}</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {rt.plans?.map((plan, j) => (
                <PlanCard key={j} plan={plan} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {fees.note ? (
        <p className="mt-3 text-xs text-muted-foreground">{fees.note}</p>
      ) : null}
    </div>
  );
}

export function SimplePlanBlock({
  block,
}: {
  block: PublicHostelSimplePlanBlock;
}) {
  const plans = block.plans ?? [];
  if (plans.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {block.title}
        </p>
        {block.status_badge ? (
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background">
            {block.status_badge}
          </span>
        ) : null}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {plans.map((plan, i) => (
          <PlanCard key={i} plan={plan} />
        ))}
      </div>
      {block.note ? (
        <p className="mt-3 text-xs text-muted-foreground">{block.note}</p>
      ) : null}
    </div>
  );
}

export function ParkingBlock({ block }: { block: PublicHostelParkingBlock }) {
  const items = block.items ?? [];
  if (items.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {block.title}
      </p>
      <div className="mt-3 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span>{item.name}</span>
            <span className="font-medium">
              {item.currency}
              {item.price} {item.period}
            </span>
          </div>
        ))}
      </div>
      {block.note ? (
        <p className="mt-3 text-xs text-muted-foreground">{block.note}</p>
      ) : null}
    </div>
  );
}
