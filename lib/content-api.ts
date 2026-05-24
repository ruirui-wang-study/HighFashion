import { guides as fallbackGuides, getGuideBySlug as getFallbackGuideBySlug } from "@/data/guides";
import { apiFetch } from "./api-client";
import { mapPublishedGuideToGuide, type PublishedGuide } from "./content-types";

export async function getPublishedGuides() {
  try {
    const guides = await apiFetch<PublishedGuide[]>("/api/content/guides");
    return guides.map(mapPublishedGuideToGuide);
  } catch {
    return fallbackGuides;
  }
}

export async function getPublishedGuideBySlug(slug: string) {
  try {
    const guide = await apiFetch<PublishedGuide | null>(`/api/content/guides/${slug}`);
    return guide ? mapPublishedGuideToGuide(guide) : null;
  } catch {
    return getFallbackGuideBySlug(slug) ?? null;
  }
}
