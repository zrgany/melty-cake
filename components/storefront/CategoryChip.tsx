import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CategoryChip({
  name,
  slug,
  active = false,
}: {
  name: string;
  slug: string;
  active?: boolean;
}) {
  return (
    <Link href={`/category/${slug}`} className={cn("chip whitespace-nowrap", active && "chip-active")}>
      {name}
    </Link>
  );
}
