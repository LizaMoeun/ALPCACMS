"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Home, Plus, FileText, Calendar, MoreHorizontal, User, LogOut } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import Image from "next/image"
import { CreatePostForm } from "@/components/ui/create-post-form"
import  AdminPostsList from "@/components/admin-posts-list"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

type Post = {
  id: string
  title: string
  content: string
  type: "club" | "events"
  date: string | null
  time: string | null
  status: "draft" | "published"
  author: string | null
  image: string | null
}


export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("dashboard")
  const { user, logout } = useAuth()
  const router = useRouter()
  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const renderContent = () => {
    switch (activeNav) {
      case "create":
        return <CreatePostForm />
      case "posts":
        return <AdminPostsList />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-secondary/20 border-r border-border p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-lg text-primary">ALPCA  </span>
        </div>
        <nav className="space-y-2">
          <Button
            variant={activeNav === "dashboard" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveNav("dashboard")}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeNav === "create" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveNav("create")}
          >
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
          <Button
            variant={activeNav === "posts" ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => setActiveNav("posts")}
          >
            <FileText className="h-4 w-4" />
            View Posts Page
          </Button>
        </nav>

        <div className="mt-auto pt-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{user?.email}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.role === "admin" ? "Admin User" : "User"}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/*mainnn cicr;le */}
      <div className="flex-1 p-6">{renderContent()}</div>
    </div>
  )
}

function DashboardOverview() {
  const [posts, setPosts] = useState<Post[]>([])
  const [chartData, setChartData] = useState<{ day: string; posts: number; visitors: number }[]>([])
  const [loading, setLoading] = useState(true)

const [searchTerm, setSearchTerm] = useState("")

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Get posts
      let query = supabase
        .from("posts")
        .select("id, title, content, type, status, date, time, image, created_at, author")

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      }

      const { data: postsData, error: postsError } = await query

      if (postsError) {
        console.error(postsError)
        return
      }
      type RawPost = {
        id: string
        title: string
        content: string
        type: "club" | "events"
        date: string | null
        time: string | null
        status: "draft" | "published"
        author?: string | null
        image?: string | null
      }

      setPosts(
        ((postsData ?? []) as RawPost[]).map((p) => ({
          id: p.id,
          title: p.title,
          content: p.content,
          type: p.type,
          date: p.date,
          time: p.time,
          status: p.status,
          author: p.author ?? null,
          image: p.image ?? null,
        }))
      )

      // 2. Get visitors (optional table)
      const { data: visitorsData, error: visitorsError } = await supabase
        .from("visitors")
        .select("id, created_at")

      if (visitorsError) console.error(visitorsError)

      // 3. Weekly stats
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

      const weekData = days.map((day) => {
        const postsCount =
          postsData?.filter(
            (p) =>
              new Date(p.created_at!).toLocaleDateString("en-US", {
                weekday: "short",
              }) === day
          ).length || 0

        const visitorsCount =
          visitorsData?.filter(
            (v) =>
              new Date(v.created_at).toLocaleDateString("en-US", {
                weekday: "short",
              }) === day
          ).length || 0

        return { day, posts: postsCount, visitors: visitorsCount }
      })

      setChartData(weekData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [searchTerm])

  const drafts = posts.filter((p) => p.status === "draft")
  const events = posts.filter((p) => p.type === "events" && p.status === "published")
  const publishedPosts = posts.filter((p) => p.status === "published")

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Posts</p>
                <p className="text-2xl font-bold">{publishedPosts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{drafts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly View Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Weekly View
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: "#e546e5ff" }}></div>
                <span>VISITORS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: "#b9107bff" }}></div>
                <span>POSTS</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Bar dataKey="visitors" fill="#e546e5ff" />
                <Bar dataKey="posts" fill="#b9107bff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottam Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Events */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{event.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{event.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Drafts */}
        <Card>
          <CardHeader>
            <CardTitle>Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drafts.map((draft) => (
                <div key={draft.id} className="flex gap-3 p-3 border rounded-lg">
                  <Image
                    src={draft.image || "/placeholder.svg"}
                    alt="Draft preview"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{draft.title}</h4>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{draft.date}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{draft.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

