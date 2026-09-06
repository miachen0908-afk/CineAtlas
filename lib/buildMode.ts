export const isPublicStaticBuild =
  process.env.CINEATLAS_BUILD_MODE === "static";

export const isPublicDisplayMode =
  process.env.NEXT_PUBLIC_CINEATLAS_PUBLIC_MODE === "1";
