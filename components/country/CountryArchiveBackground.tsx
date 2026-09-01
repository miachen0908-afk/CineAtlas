import type { ReactNode } from "react";
import { Aurora } from "@/components/backgrounds/Aurora";

type CountryArchiveBackgroundProps = {
  children: ReactNode;
  showAurora?: boolean;
};

export function CountryArchiveBackground({ children, showAurora = true }: CountryArchiveBackgroundProps) {
  return (
    <div className="country-archive-background relative isolate flex min-h-full flex-1 flex-col overflow-x-clip">
      {showAurora && <>
        <Aurora
          colorStops={["#75e680", "#9d55e0", "#2668e9"]}
          amplitude={0.4}
          blend={1}
          className="pointer-events-none fixed inset-0 -z-20"
        />
        <div className="country-archive-background__veil pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />
      </>}
      <div className="relative z-0 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
