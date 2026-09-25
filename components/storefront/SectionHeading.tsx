import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function SectionHeading({
  title,
  href,
  subtitle,
}: {
  title: string;
  href?: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-2/70">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="btn-ghost shrink-0">
          عرض الكل
          <ChevronLeft size={16} />
        </Link>
      )}
    </div>
  );
}
