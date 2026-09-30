import { db } from "@/db";
import { creations } from "@/db/schema";
import { desc, eq, and, inArray, isNotNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Sparkles, ImageIcon } from "lucide-react";
import Link from "next/link";
import { CommunityFeed } from "@/components/community/CommunityFeed";

export const dynamic = "force-dynamic";

/**
 * Community Creations Hub (Server Component)
 * 
 * Public Visual Showcase: High-resolution AI images, diffusion art, and canvas inpaintings.
 * Personal articles and confidential documents are strictly private to user dashboards.
 */
export default async function CommunityPage() {
  const { userId } = await auth();

  // Fetch only image-based public creations (AI Images, Inpaintings, Object Removals)
  const publicCreations = await db.query.creations.findMany({
    where: and(
      eq(creations.publish, true),
      inArray(creations.type, ["image", "object-removal", "remove-background", "inpaint"]),
      isNotNull(creations.imageUrl)
    ),
    orderBy: [desc(creations.createdAt)],
    limit: 50,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Community Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            AI Visual Showcase
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Community Visual Gallery</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Explore public AI diffusion images and canvas inpaintings. Remix any visual prompt in 1-click.
          </p>
        </div>

        <Link
          href="/studio/image"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          Create AI Image
        </Link>
      </div>

      {/* Interactive Community Feed */}
      <CommunityFeed initialCreations={publicCreations} currentUserId={userId} />
    </div>
  );
}
