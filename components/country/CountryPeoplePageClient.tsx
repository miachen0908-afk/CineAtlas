"use client";

import Link from "next/link";
import { useEffect } from "react";

export function CountryPeoplePageClient({
  countryCode,
}: {
  countryCode: string;
}) {
  const destination = `/country/${countryCode}`;

  useEffect(() => {
    window.location.replace(`${destination}${window.location.search}`);
  }, [destination]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4 py-16 text-center">
      <div>
        <p className="text-sm text-white/45">正在返回国家电影史页面…</p>
        <Link
          href={destination}
          className="mt-5 inline-flex text-[#8be2d5]/80 hover:text-[#8be2d5]"
        >
          立即返回 →
        </Link>
      </div>
    </main>
  );
}
