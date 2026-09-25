import Link from "next/link";
import { Instagram, MapPin, Clock } from "lucide-react";

type Settings = {
  name: string;
  welcomeMessage: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagramUrl: string | null;
  address: string | null;
  workingHours: string | null;
};

export default function Footer({ settings }: { settings: Settings }) {
  const hasContactInfo = settings.phone || settings.whatsapp || settings.address || settings.workingHours;

  return (
    <footer className="mt-16 border-t border-line bg-blush/40 pb-24 pt-10 md:pb-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">{settings.name}</h3>
            {settings.welcomeMessage && (
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-2">{settings.welcomeMessage}</p>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-caramel-dark"
              >
                <Instagram size={18} /> تابعونا على انستغرام
              </a>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">روابط سريعة</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-2">
              <li>
                <Link href="/" className="hover:text-caramel-dark">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-caramel-dark">
                  الأقسام
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-caramel-dark">
                  المفضلة
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-caramel-dark">
                  السلة
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-caramel-dark">
                  الحساب
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">تواصل معنا</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-2">
              {settings.phone && <li>{settings.phone}</li>}
              {settings.whatsapp && <li>واتساب: {settings.whatsapp}</li>}
              {settings.address && (
                <li className="flex items-start gap-1.5">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  {settings.address}
                </li>
              )}
              {settings.workingHours && (
                <li className="flex items-start gap-1.5">
                  <Clock size={16} className="mt-0.5 shrink-0" />
                  {settings.workingHours}
                </li>
              )}
              {!hasContactInfo && <li className="text-ink-2/60">تابعونا على انستغرام لأحدث الأخبار</li>}
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-line/70 pt-6 text-center text-xs text-ink-2/60">
          © {new Date().getFullYear()} {settings.name} — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
