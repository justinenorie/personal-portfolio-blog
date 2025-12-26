import React, { useState, useMemo } from "react";
import { Search, Calendar, Tag, Clock } from "lucide-react";

interface Post {
  id: string;
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    heroImage?: any;
    tags?: string[];
  };
  readingTime: string;
}

interface BlogListProps {
  posts: Post[];
}

export default function BlogList({ posts }: BlogListProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "a-z" | "z-a"
  >("newest");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => {
      post.data.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesSearch =
          post.data.title.toLowerCase().includes(search.toLowerCase()) ||
          post.data.description.toLowerCase().includes(search.toLowerCase());
        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.some((tag) => post.data.tags?.includes(tag));
        return matchesSearch && matchesTags;
      })
      .sort((a, b) => {
        if (sortOrder === "newest") {
          return (
            new Date(b.data.pubDate).getTime() -
            new Date(a.data.pubDate).getTime()
          );
        } else if (sortOrder === "oldest") {
          return (
            new Date(a.data.pubDate).getTime() -
            new Date(b.data.pubDate).getTime()
          );
        } else if (sortOrder === "a-z") {
          return a.data.title.localeCompare(b.data.title);
        } else {
          return b.data.title.localeCompare(a.data.title);
        }
      });
  }, [posts, search, selectedTags, sortOrder]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev: any) =>
      prev.includes(tag) ? prev.filter((t: any) => t !== tag) : [...prev, tag],
    );
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "....";
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Sidebar - Left Side */}
      <aside className="flex w-full flex-col gap-6 lg:w-1/4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="text-foreground/60 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border text-foreground/60 bg-background focus:ring-primary w-full rounded-lg border py-2 pr-4 pl-10 focus:ring-2 focus:outline-none"
          />
        </div>

        {/* Filter */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            Sort By
          </h3>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="border-border bg-background text-foreground/60 w-full rounded-lg border p-2"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
          </select>
        </div>

        <div>
          <p className="text-foreground/80">
            Showing {filteredPosts.length} posts
          </p>
        </div>

        {/* Tags */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Tag className="h-4 w-4" /> Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 border-border text-foreground border"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content - Right Side */}
      <div className="flex w-full flex-col gap-6 lg:w-3/4">
        {filteredPosts.map((post) => (
          <a
            key={post.id}
            href={`/blog/${post.id}/`}
            className="group hover:border-border hover:bg-primary/10 flex flex-col gap-6 rounded-xl border border-transparent p-4 transition-all duration-300 md:flex-row"
          >
            <div className="flex flex-1 flex-col justify-center">
              <h2 className="group-hover:text-primary mb-2 text-2xl font-bold transition-colors">
                {post.data.title}
              </h2>
              <p className="text-foreground/80 mb-4">
                {truncateDescription(post.data.description)}
              </p>

              <div className="text-foreground/80 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.data.pubDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readingTime}
                </span>
              </div>

              {post.data.tags && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.data.tags.slice(0, 3).map((tag) => (
                    <small
                      key={tag}
                      className="text-foreground bg-primary/10 border-border rounded-md border px-2 py-1"
                    >
                      # {tag}
                    </small>
                  ))}
                </div>
              )}
            </div>

            <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg md:w-48">
              {post.data.heroImage ? (
                <img
                  src={post.data.heroImage.src}
                  alt={post.data.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="bg-border/80 text-foreground/80 flex h-full w-full items-center justify-center">
                  <span className="text-xs">No Image</span>
                </div>
              )}
            </div>
          </a>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-foreground/80 py-12 text-center">
            No posts found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
