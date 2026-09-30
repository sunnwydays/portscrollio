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
    title: "Resume - SUNNY'S PORTSCROLLIO",
    description: "The PDF is a boring list. See what Sunny built and why.",
    url: "/resume",
  },
};

const VERSIONS = [
  { id: "software", label: "Software", key: "resume_url" },
  { id: "hardware", label: "Hardware", key: "resume_hardware_url" },
] as const;

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { v } = await searchParams;
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", VERSIONS.map((version) => version.key));

  const urls = new Map((data ?? []).map((row) => [row.key, row.value ?? ""]));
  const available = VERSIONS.filter((version) => urls.get(version.key));
  const active = available.find((version) => version.id === v) ?? available[0];
  const resumeUrl = active ? urls.get(active.key) ?? "" : "";

  return (
    <div className="flex flex-col min-h-dvh pt-14 lg:pt-0 pb-14 lg:pb-0">
      <h1 className="sr-only">Sunny&apos;s resume</h1>

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
            key={resumeUrl}
            src={resumeUrl}
            className="w-full h-full min-h-[70dvh]"
            title={`Sunny Wu ${active?.label ?? ""} Resume`}
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
      <div className="bg-surface-container px-6 py-6 flex flex-col items-center gap-3 text-center">
        {/* Version toggle shown when more than one resume is configured */}
        {available.length > 1 && (
          <nav aria-label="Resume version" className="self-center md:self-end flex gap-0.5 p-0.5 rounded-full bg-surface-container-high">
            {available.map((version) => {
              const isActive = version.id === active?.id;
              return (
                <Link
                  key={version.id}
                  href={version.id === available[0].id ? "/resume" : `/resume?v=${version.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-linear-to-r from-primary to-primary-container text-on-primary"
                      : "text-secondary hover:text-on-surface"
                  }`}
                >
                  {version.label}
                </Link>
              );
            })}
          </nav>
        )}
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
