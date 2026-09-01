"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  consumeMapReturnPending,
  hasMapDetailReferrer,
  isMapDetailPath,
  markMapReturnPending,
} from "./mapReturnNavigation";

export type HomeExperiencePhase = "intro" | "exiting" | "ready";

type HomeExperienceContextValue = {
  isHome: boolean;
  phase: HomeExperiencePhase;
  startExit: () => void;
  completeExit: () => void;
};

const HomeExperienceContext = createContext<HomeExperienceContextValue>({
  isHome: false,
  phase: "ready",
  startExit: () => undefined,
  completeExit: () => undefined,
});

function HomeExperienceSession({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  const isHome = pathname === "/";
  const previousPathRef = useRef(pathname);
  const [phase, setPhase] = useState<HomeExperiencePhase>(
    isHome ? "intro" : "ready"
  );

  useLayoutEffect(() => {
    const previousPath = previousPathRef.current;
    const pendingMapReturn = isHome ? consumeMapReturnPending() : false;
    const detailReferrer = isHome ? hasMapDetailReferrer() : false;

    if (isHome && previousPath !== "/") {
      const returningFromMapDetail =
        isMapDetailPath(previousPath) || pendingMapReturn || detailReferrer;
      setPhase(returningFromMapDetail ? "ready" : "intro");
    } else if (isHome && (pendingMapReturn || detailReferrer)) {
      setPhase("ready");
    } else if (!isHome) {
      setPhase("ready");
    }

    if (!isHome) {
      if (isMapDetailPath(pathname)) {
        markMapReturnPending();
      } else {
        consumeMapReturnPending();
      }
    }

    previousPathRef.current = pathname;
  }, [isHome, pathname]);

  const startExit = useCallback(() => {
    if (!isHome) return;
    setPhase((current) => (current === "intro" ? "exiting" : current));
  }, [isHome]);

  const completeExit = useCallback(() => {
    if (!isHome) return;
    setPhase("ready");
  }, [isHome]);

  const value = useMemo<HomeExperienceContextValue>(
    () => ({
      isHome,
      phase: isHome ? phase : "ready",
      startExit,
      completeExit,
    }),
    [completeExit, isHome, phase, startExit]
  );

  return (
    <HomeExperienceContext.Provider value={value}>
      {children}
    </HomeExperienceContext.Provider>
  );
}

export function HomeExperienceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <HomeExperienceSession pathname={pathname}>
      {children}
    </HomeExperienceSession>
  );
}

export function useHomeExperience(): HomeExperienceContextValue {
  return useContext(HomeExperienceContext);
}
