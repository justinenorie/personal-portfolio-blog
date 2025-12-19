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
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "a-z" | "z-a">("newest");

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
          selectedTags.every((tag : any) => post.data.tags?.includes(tag));
        return matchesSearch && matchesTags;
      })
      .sort((a, b) => {
        if (sortOrder === "newest") {
          return new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime();
        } else if (sortOrder === "oldest") {
          return new Date(a.data.pubDate).getTime() - new Date(b.data.pubDate).getTime();
        } else if (sortOrder === "a-z") {
          return a.data.title.localeCompare(b.data.title);
        } else {
          return b.data.title.localeCompare(a.data.title);
        }
      });
  }, [posts, search, selectedTags, sortOrder]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev: any) =>
      prev.includes(tag) ? prev.filter((t: any) => t !== tag) : [...prev, tag]
    );
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "....";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar - Left Side */}
      <aside className="w-full lg:w-1/4 flex flex-col gap-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 h-4 w-4" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border text-foreground/60 bg-background focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4" /> Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
           <h3 className="font-semibold mb-3 flex items-center gap-2">
            Sort By
          </h3>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full p-2 rounded-lg border border-border bg-background text-foreground/60"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
          </select>
        </div>

        <div className="text-sm text-foreground/60 font-medium">
          Showing {filteredPosts.length} posts
        </div>
      </aside>

      {/* Main Content - Right Side */}
      <div className="w-full lg:w-3/4 flex flex-col gap-6">
        {filteredPosts.map((post) => (
          <a
            key={post.id}
            href={`/blog/${post.id}/`}
            className="group flex flex-col md:flex-row gap-6 p-4 rounded-xl border border-transparent hover:border-border hover:bg-secondary/10 transition-all duration-300"
          >
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                {post.data.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {truncateDescription(post.data.description)}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
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
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.data.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-secondary rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:w-48 h-32 shrink-0 overflow-hidden rounded-lg">
              {post.data.heroImage ? (
                <img
                  src={post.data.heroImage.src}
                  alt={post.data.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center text-gray-400">
                   <span className="text-xs">No Image</span>
                </div>
              )}
            </div>
          </a>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No posts found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
