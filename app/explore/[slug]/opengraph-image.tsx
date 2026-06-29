import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";
import { SITE_NAME } from "@/lib/site";

export const alt = "Blog post on Sunny's Portscrollio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  const { data } = await supabase
    .from("posts")
    .select("title, thumbnail_url")
    .eq("slug", slug)
    .single();
  const title = (data?.title as string) ?? "Blog post";
  const thumbnailUrl = (data?.thumbnail_url as string) ?? null;

  if (thumbnailUrl) {
    const res = await fetch(thumbnailUrl);
    if (res.ok) {
      return new Response(res.body, {
        headers: {
          "Content-Type": res.headers.get("content-type") ?? "image/webp",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#0b1326",
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(78, 222, 163, 0.22) 0%, transparent 45%), radial-gradient(circle at 100% 100%, rgba(173, 198, 255, 0.18) 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "#4edea3",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#dae2fd",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#adc6ff",
          }}
        >
          Learning, optimizing, and building things for a change.
        </div>
      </div>
    ),
    { ...size }
  );
}
