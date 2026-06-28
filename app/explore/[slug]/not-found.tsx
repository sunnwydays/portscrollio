import { PlaceholderImage } from "@/components/explore/PlaceholderImage";

export default function NotFound() {
  return (
    <div className="min-h-dvh pt-14 lg:pt-0 pb-16 lg:pb-0 flex flex-col items-center justify-center px-6">
      <div className="mb-8">
        <PlaceholderImage />
      </div>
      <h1 className="font-display font-bold text-2xl lg:text-3xl text-on-surface text-center">
        This post doesn&apos;t exist (yet)
      </h1>
      <p className="text-on-surface/60 mt-3 text-center max-w-md">
        Check back later, I might be cooking something up
      </p>
    </div>
  );
}
