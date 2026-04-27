import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  useCdn: false, // Sett til true for lynrask levering, false for ferske data hver gang
  apiVersion: "2026-04-27", // Bruk dagens dato
});