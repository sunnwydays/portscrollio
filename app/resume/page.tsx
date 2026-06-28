import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ForYouIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "The PDF is a boring list. See what Sunny built and why on the For You feed.",
  alternates: { canonical: "/resume" },
  openGraph: {
    title: "Resume · SUNNY'S PORTSCROLLIO",
    description: "The PDF is a boring list. See what Sunny built and why.",
    url: "/resume",
  },
};

export default async function ResumePage() {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "resume_url")
    .single();

  const resumeUrl = data?.value ?? "";

  return (
    <div className="flex flex-col min-h-dvh pt-14 lg:pt-0 pb-14 lg:pb-0">

      {/* Top CTA — aggressive */}
      <div className="bg-surface-container-low px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-display font-bold text-lg text-on-surface leading-tight">
            A PDF is just words.
          </p>
          <p className="text-sm text-on-surface/85 mt-1">
            Hear me out - I&apos;m more than that.
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-primary to-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <ForYouIcon className="w-4 h-4" />
          Demos on For You →
        </Link>
      </div>

      {/* PDF embed — desktop/tablet only */}
      {resumeUrl && (
        <div className="hidden md:flex flex-1">
          <iframe
            src={resumeUrl}
            className="w-full h-full min-h-[70dvh]"
            title="Sunny Wu Resume"
          />
        </div>
      )}

      {/* Mobile fallback — PDF embed doesn't work on mobile browsers */}
      {resumeUrl && (
        <div className="md:hidden flex flex-col items-center gap-4 px-6 py-12 text-center">
          <p className="text-on-surface/85 text-sm">PDF preview is unsupported on mobile.</p>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl text-on-surface text-sm font-semibold border border-outline/20 hover:bg-surface-container transition-colors"
          >
            Open PDF in new tab →
          </a>
        </div>
      )}

      {/* Bottom CTA — aggressive */}
      <div className="bg-surface-container px-6 py-10 flex flex-col items-center gap-3 text-center">
        <p className="font-display font-bold text-2xl text-on-surface">
          Watch, don&apos;t read
        </p>
        <p className="text-on-surface/85 text-sm max-w-sm leading-relaxed">
          The resume is a boring list.{" "}
          <span className="text-on-surface font-medium">For You</span> <i>shows</i> what I made and why.
        </p>
        <Link
          href="/"
          className="mt-3 flex items-center gap-2 px-7 py-3 rounded-xl bg-linear-to-r from-primary to-primary-container text-on-primary text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <ForYouIcon className="w-4 h-4" />
          Go to For You
        </Link>
      </div>

    </div>
  );
}
