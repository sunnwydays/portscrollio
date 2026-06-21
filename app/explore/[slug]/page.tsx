import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/mock-data";
import { PostCard } from "@/components/explore/PostCard";

interface PageProps {
  params: Promise<{ slug: string }>;
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
  try {
    const filePath = path.join(process.cwd(), "content", `${slug}.md`);
    const raw = await fs.readFile(filePath, "utf-8");
    const { content } = matter(raw);
    const result = await remark().use(remarkHtml, { sanitize: false }).process(content);
    return result.toString();
  } catch {
    return null;
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) notFound();

  const post = data as Post;
  const [html, relatedPosts] = await Promise.all([
    getMarkdown(slug),
    getRelatedPosts(post),
  ]);

  if (!html && post.video_url) {
    const videoId = post.video_url.match(
      /(?:shorts\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
    )?.[1];

    return (
      <div className="min-h-dvh pt-14 lg:pt-0 pb-16 lg:pb-0 flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-6 w-full">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary mb-3">
            {post.category}
          </p>
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
      {/* Hero */}
      <div className="relative h-48 lg:h-64 w-full overflow-hidden">
        {post.thumbnail_url && (
          <Image src={post.thumbnail_url} alt="" fill className="object-cover" priority />
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
      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary mb-3">
          {post.category}
        </p>
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

        <article
          className="prose prose-invert prose-sm lg:prose-base max-w-none
            prose-headings:font-display prose-headings:text-on-surface prose-headings:font-bold
            prose-p:text-on-surface/80 prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-on-surface
            prose-code:text-secondary prose-code:bg-surface-container prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-surface-container-low prose-pre:rounded-xl
            prose-blockquote:border-primary prose-blockquote:text-outline
            prose-img:max-h-80 prose-img:w-auto prose-img:mx-auto prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: html ?? "" }}
        />
        {relatedPosts.length > 0 && (
          <RelatedSection posts={relatedPosts} />
        )}
      </div>
    </div>
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
