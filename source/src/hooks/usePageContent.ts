import { trpc } from "@/providers/trpc";
import { useMemo } from "react";

export interface PageSection {
  id: number;
  page: string;
  section: string;
  type: "image" | "video" | "text" | "html";
  content: string;
  mobileContent: string | null;
  label: string | null;
  sortOrder: number;
  isActive: string | boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Add cache-busting query param to LOCAL file URLs based on updatedAt timestamp
// Skip external URLs (S3/R2, CDN, etc.)
function addCacheBust(url: string, updatedAt?: string | Date | null): string {
  if (!url) return url;
  // Don't modify external URLs (S3, CDN, etc.)
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Only add cache-busting to local file URLs
  if (!url.match(/\.(webp|png|jpg|jpeg|mp4|webm|mov|pdf|svg|gif)(\?|$)/i)) return url;
  const ts = updatedAt
    ? new Date(updatedAt).getTime()
    : Date.now();
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${ts}`;
}

export function usePageContent(page: string) {
  const { data, isLoading, error } = trpc.content.list.useQuery(
    { page },
    { staleTime: 0, refetchOnWindowFocus: true } // No stale time — always fetch fresh
  );

  const sections = useMemo(() => {
    if (!data) return [];
    return data.filter((s: any) => s.isActive !== "0" && s.isActive !== false).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [data]);

  const getSection = useMemo(() => {
    return (sectionKey: string) => sections.find((s: any) => s.section === sectionKey) || null;
  }, [sections]);

  // Helper: get content with cache-busting
  const cms = useMemo(() => {
    return (sectionKey: string, fallback: string) => {
      const section = sections.find((s: any) => s.section === sectionKey);
      return addCacheBust(section?.content || fallback, section?.updatedAt);
    };
  }, [sections]);

  // Helper: get mobile content (DEPRECATED: use cms() instead)
  // Kept for backward compatibility but falls back to content
  const cmsMobile = useMemo(() => {
    return (sectionKey: string, fallback: string) => {
      const section = sections.find((s: any) => s.section === sectionKey);
      const content = section?.content || fallback;
      return addCacheBust(content, section?.updatedAt);
    };
  }, [sections]);

  return {
    sections,
    getSection,
    cms,
    cmsMobile,
    isLoading,
    error,
  };
}

export function usePageSection(page: string, sectionKey: string) {
  const { getSection, cms, cmsMobile, isLoading, error } = usePageContent(page);
  const section = getSection(sectionKey);

  return {
    section,
    content: addCacheBust(section?.content || "", section?.updatedAt),
    mobileContent: addCacheBust(section?.mobileContent || section?.content || "", section?.updatedAt),
    type: section?.type || "text",
    label: section?.label || "",
    isLoading,
    error,
  };
}
