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

export function usePageContent(page: string) {
  const { data, isLoading, error } = trpc.content.list.useQuery(
    { page },
    { staleTime: 1000 * 60 * 5 } // Cache for 5 minutes
  );

  const sections = useMemo(() => {
    if (!data) return [];
    return data.filter((s: any) => s.isActive !== "0" && s.isActive !== false).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [data]);

  const getSection = useMemo(() => {
    return (sectionKey: string) => sections.find((s: any) => s.section === sectionKey) || null;
  }, [sections]);

  // Helper: get content with mobile fallback
  const cms = useMemo(() => {
    return (sectionKey: string, fallback: string) => {
      const section = sections.find((s: any) => s.section === sectionKey);
      return section?.content || fallback;
    };
  }, [sections]);

  // Helper: get mobile content with fallback to desktop
  const cmsMobile = useMemo(() => {
    return (sectionKey: string, fallback: string) => {
      const section = sections.find((s: any) => s.section === sectionKey);
      return section?.mobileContent || section?.content || fallback;
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
    content: section?.content || "",
    mobileContent: section?.mobileContent || section?.content || "",
    type: section?.type || "text",
    label: section?.label || "",
    isLoading,
    error,
  };
}
