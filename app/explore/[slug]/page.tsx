import fs from "fs/promises";
import path from "path";
import { cache } from "react";
import type { Metadata } from "next";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/mock-data";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/site";
import { PostCard } from "@/components/explore/PostCard";
import { ImageLightbox } from "@/components/explore/ImageLightbox";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data } = await supabase.from("posts").select("slug, id");
  return (data ?? [])
    .map((p: { slug?: string | null; id: string }) => ({
      slug: p.slug ?? p.id,
    }))
    .filter((p) => Boolean(p.slug));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getPost = cache(async (slug: string): Promise<Post | null> => {
  const { data } = await supabase.from("posts").select("*").eq("slug", slug).single();
  return (data as Post) ?? null;
});

const getRawMarkdown = cache(async (slug: string): Promise<string | null> => {
  try {
    return await fs.readFile(path.join(process.cwd(), "content", `${slug}.md`), "utf-8");
  } catch {
    return null;
  }
});

function toExcerpt(markdown: string, max = 155): string {
  const body = markdown
    .replace(/^\s*\*[^*\n]+\*\s*/, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return body.length > max ? `${body.slice(0, max).trimEnd()}...` : body;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };

  const raw = await getRawMarkdown(slug);
  const description = raw ? toExcerpt(matter(raw).content) : SITE_DESCRIPTION;
  const url = `/explore/${post.slug ?? post.id}`;
  const tags = (post.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);

  // og:image and twitter:image come from the colocated opengraph-image route,
  // which Next.js wires up automatically and overrides any images set here.
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      publishedTime: post.published_at,
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

async function getRelatedPosts(post: Post): Promise<Post[]> {
  const forwardSlugs = (post.related ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [forward, reverse] = await Promise.all([
    forwardSlugs.length > 0
      ? supabase.from("posts").select("*").in("slug", forwardSlugs)
      : { data: [] },
    post.slug
      ? supabase.from("posts").select("*").ilike("related", `%${post.slug}%`)
      : { data: [] },
  ]);

  const seen = new Set<string>();
  const result: Post[] = [];
  for (const p of [...(reverse.data ?? []), ...(forward.data ?? [])] as Post[]) {
    if (p.slug === post.slug || !p.slug || seen.has(p.slug)) continue;
    seen.add(p.slug);
    result.push(p);
  }
  return result;
}

async function getMarkdown(slug: string): Promise<string | null> {
  const raw = await getRawMarkdown(slug);
  if (!raw) return null;
  const { content } = matter(raw);
  const result = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content);
  return result.toString();
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) notFound();
  const [html, relatedPosts] = await Promise.all([
    getMarkdown(slug),
    getRelatedPosts(post),
  ]);

  const canonical = `${SITE_URL}/explore/${post.slug ?? post.id}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: { "@type": "Person", name: "Sunny", url: SITE_URL },
    image: post.thumbnail_url ?? `${SITE_URL}/autoronto_computer.jpg`,
    url: canonical,
    mainEntityOfPage: canonical,
    keywords: post.tags,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Explore", item: `${SITE_URL}/explore` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };
  const structuredData = [articleLd, breadcrumbLd];

  if (!html && post.video_url) {
    const videoId = post.video_url.match(
      /(?:shorts\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
    )?.[1];

    return (
      <div className="min-h-dvh pt-14 lg:pt-0 pb-16 lg:pb-0 flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-6 w-full">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
            }}
          />
          <Breadcrumb title={post.title} />
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-on-surface leading-tight tracking-tight">
            {post.title}
          </h1>
          {videoId && (
            <div className="mt-8 aspect-video w-full rounded-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
          {relatedPosts.length > 0 && (
            <RelatedSection posts={relatedPosts} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pt-14 lg:pt-0 pb-16 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      {/* Hero */}
      <div className="relative h-48 lg:h-64 w-full overflow-hidden">
        {post.thumbnail_url && (
          <Image src={post.thumbnail_url} alt="" fill sizes="(min-width: 1024px) calc(100vw - 17.5rem), 100vw" className="object-cover" priority />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${post.bg_from} 0%, ${post.bg_to} 100%)`,
            opacity: post.thumbnail_url ? 0.55 : 1,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: "linear-gradient(to top, #0b1326 0%, transparent 100%)" }}
          aria-hidden="true"
        />
      </div>

      {/* Article */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 mb-12 relative z-10">
        <Breadcrumb title={post.title} />
        <h1 className="font-display font-bold text-3xl lg:text-4xl text-on-surface leading-tight tracking-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap gap-2 mt-4 mb-8">
          {(post.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-surface-container-high text-secondary text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <ImageLightbox>
          <article
            className="prose prose-invert prose-sm lg:prose-base max-w-none
              prose-headings:font-display prose-headings:text-on-surface prose-headings:font-bold
              prose-p:text-on-surface/80 prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-on-surface
              prose-code:text-secondary prose-code:bg-surface-container prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-surface-container-low prose-pre:rounded-xl
              prose-blockquote:border-primary prose-blockquote:text-outline
              prose-img:max-h-80 prose-img:w-auto prose-img:mx-auto prose-img:rounded-xl
              prose-table:border-collapse prose-th:bg-surface-container prose-th:text-on-surface prose-th:px-4 prose-th:py-2
              prose-td:px-4 prose-td:py-2 prose-td:text-on-surface/80
              prose-tr:border-b prose-tr:border-outline-variant/15
              prose-del:text-outline"
            dangerouslySetInnerHTML={{ __html: html ?? "" }}
          />
        </ImageLightbox>
        {relatedPosts.length > 0 && (
          <RelatedSection posts={relatedPosts} />
        )}
      </div>
    </div>
  );
}

function Breadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex items-center gap-1 text-xs text-on-surface/60">
        <li>
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/explore" className="hover:text-primary transition-colors">
            Explore
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="truncate max-w-[20ch] lg:max-w-[40ch]">
          {title}
        </li>
      </ol>
    </nav>
  );
}

function RelatedSection({ posts }: { posts: Post[] }) {
  return (
    <section className="my-12">
      <h2 className="font-display font-bold text-xl text-on-surface mb-6">
        	&gt;&gt;&nbsp; For the curious
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
