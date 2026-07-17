import type { PublicHostelRoomItem } from "@beaconu/types";

interface HostelRoomsSectionProps {
  title?: string;
  totalIntakeLabel?: string;
  items: PublicHostelRoomItem[];
}

export function HostelRoomsSection({
  title,
  totalIntakeLabel,
  items,
}: HostelRoomsSectionProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight">
          {title || "Rooms & Types"}
        </h2>
        {totalIntakeLabel ? (
          <span className="text-sm text-muted-foreground">
            {totalIntakeLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((room) => (
          <div
            key={room.id}
            className="rounded-2xl border border-border/60 p-4"
          >
            <p className="text-sm font-semibold">{room.name}</p>
            {room.description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {room.description}
              </p>
            ) : null}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {room.availability_label}
              </span>
              <span className="text-sm font-semibold">
                {room.currency}
                {room.price}
                <span className="font-normal text-muted-foreground">
                  {room.period}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
