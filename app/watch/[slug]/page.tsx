import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getProjects } from "@/lib/feed";
import { FeedPage } from "@/components/for-you/FeedPage";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data } = await supabase.from("projects").select("id, slug");
  return (data ?? []).map((p: { id: string; slug: string | null }) => ({ slug: p.slug ?? p.id }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getProjects()).find((p) => (p.slug ?? p.id) === slug);
  if (!project) return { title: "Project not found", robots: { index: false } };

  const url = `/watch/${project.slug ?? project.id}`;
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: url },
    openGraph: {
      type: "video.other",
      title: project.title,
      description: project.description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
    },
  };
}

export default async function WatchPage({ params }: PageProps) {
  const { slug } = await params;
  const projects = await getProjects();

  if (!projects.some((p) => (p.slug ?? p.id) === slug)) notFound();

  return <FeedPage leadSlug={slug} />;
}
