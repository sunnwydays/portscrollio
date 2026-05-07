import Link from "next/link";
import { NavLink } from "./NavLink";
import { ForYouIcon, ExploreIcon, GitCommitIcon, TrendingUpIcon, DumbbellIcon, GitHubIcon, LinkedInIcon, ResumeIcon } from "@/components/icons";
import { ProfileAvatar } from "./ProfileAvatar";

interface SidebarProps {
  settings: Record<string, string>;
  stats: { key: string; label: string; value: string }[];
  avatarCategories: string[][];
  postSlugs: string[];
}

export function Sidebar({ settings, stats, avatarCategories, postSlugs }: SidebarProps) {

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-70 flex-col bg-surface-container-low">
      {/* Profile */}
      <div className="px-6 pt-8 pb-6">
        <div className="relative w-14 h-14 mb-5">
          <ProfileAvatar categories={avatarCategories} postSlugs={postSlugs} />
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface-container-low animate-pulse" aria-hidden="true" />
        </div>
        <p className="font-display font-bold text-xl text-on-surface leading-tight">Sunny</p>
        <p className="text-sm text-outline mt-0.5">UofT Computer Engineering</p>

        {/* Status */}
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-1">Current Sprint</p>
          <p className="text-sm text-primary font-medium leading-snug">{settings.status}</p>
        </div>
      </div>

      {/* Nav */}
      <nav aria-label="Main navigation" className="px-4 space-y-1">
        <NavLink href="/" icon={<ForYouIcon className="w-full h-full" />}>For You</NavLink>
        <NavLink href="/explore" icon={<ExploreIcon className="w-full h-full" />}>Explore</NavLink>
      </nav>

      {/* Activity Feed */}
      <div className="flex-1 overflow-y-auto px-4 mt-8 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-outline px-1 mb-4">Activity Feed</p>

        {/* Latest commit */}
        {settings.latest_commit && (
          <div className="bg-surface-container rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitCommitIcon className="w-4 h-4 text-secondary shrink-0" />
              <span className="text-[10px] uppercase tracking-widest text-outline font-semibold">Last Commit</span>
            </div>
            <p className="text-sm text-primary font-medium leading-snug">&ldquo;{settings.latest_commit}&rdquo;</p>
          </div>
        )}

        {/* Dynamic stats */}
        {stats.map((stat) => {
          const isProgress = stat.value.includes("%");
          const progressVal = isProgress ? parseInt(stat.value) : 0;

          return (
            <div key={stat.key} className="bg-surface-container rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {isProgress ? (
                  <TrendingUpIcon className="w-4 h-4 text-secondary shrink-0" />
                ) : (
                  <DumbbellIcon className="w-4 h-4 text-secondary shrink-0" />
                )}
                <span className="text-[10px] uppercase tracking-widest text-outline font-semibold truncate">
                  {stat.label}
                </span>
              </div>
              {isProgress ? (
                <div className="space-y-1.5">
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-primary-container rounded-full transition-all duration-500"
                      style={{ width: `${progressVal}%` }}
                    />
                  </div>
                  <span className="text-xs text-outline">{stat.value}</span>
                </div>
              ) : (
                <p className="text-2xl font-display font-bold text-on-surface">{stat.value}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Connect */}
      <div className="px-6 py-6 border-t border-outline-variant/20">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-4">Connect</p>
        <div className="flex gap-5">
          {settings.github_url && (
            <a href={settings.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-outline hover:text-primary transition-colors">
              <GitHubIcon className="w-5 h-5" />
            </a>
          )}
          {settings.linkedin_url && (
            <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-outline hover:text-primary transition-colors">
              <LinkedInIcon className="w-5 h-5" />
            </a>
          )}
          {settings.resume_url && (
            <Link href="/resume" aria-label="Resume" className="text-outline hover:text-primary transition-colors">
              <ResumeIcon className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
