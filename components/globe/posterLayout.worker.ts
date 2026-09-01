/// <reference lib="webworker" />

import { computeCountryPosterLayout } from "@/lib/posterLayout";
import type { CountryPosterLayoutResult, LayoutRequest } from "@/lib/posterLayout";

type LayoutWorkerRequest = { requestId: number; requests: LayoutRequest[] };
type LayoutWorkerResponse = {
  requestId: number;
  layout: CountryPosterLayoutResult;
  complete: boolean;
};

self.onmessage = (event: MessageEvent<LayoutWorkerRequest>) => {
  const { requestId, requests } = event.data;
  requests.forEach((request, index) => {
    const response: LayoutWorkerResponse = {
      requestId,
      layout: computeCountryPosterLayout(request),
      complete: index === requests.length - 1,
    };
    self.postMessage(response);
  });
};

export {};
