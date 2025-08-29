"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Clock, Trash2, Edit } from "lucide-react"
import Image from "next/image"

interface Post {
  id: string
  title: string
  content: string
  type: "club" | "events" | "draft"
  status: "published" | "draft"
  date: string
  time?: string
  image?: string
  author?: string
}

export default function AdminPostsList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      try {
        const response = await fetch("/api/posts")
        if (!response.ok) {
          throw new Error("Failed to fetch posts")
        }
        const data: Post[] = await response.json()
        setPosts(data)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || post.type === filterType
    return matchesSearch && matchesFilter
  })

  const handleDeletePost = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
  if (!supabase) return
  const { error } = await supabase.from("posts").delete().eq("id", postId)
      if (error) {
        alert("Failed to delete post")
      } else {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
      }
    }
  }

  const handleEditPost = (postId: string) => {
    // TODO: Implement the edit functionality
    console.log(`Edit post with id: ${postId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
      <h1 className="text-3xl font-bold mb-6">All Posts</h1>

      {/* Search and Filter */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background min-w-[150px]"
            >
              <option value="all">All Types</option>
              <option value="club">Clubs</option>
              <option value="events">Events</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={post.type === "events" ? "default" : "secondary"}>
                        {post.type}
                      </Badge>
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {post.image && (
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    width={500}
                    height={300}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                <p className="text-sm text-muted-foreground line-clamp-4 mb-4">{post.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date && new Date(post.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.time}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditPost(post.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredPosts.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
