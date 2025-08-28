"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Search, Users, Shield, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

type UserRow = {
  id: string
  email: string
  role: "admin" | "user"
  drafts: { id: string; title: string }[]
}

export default function UsersPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [draftFilter, setDraftFilter] = useState<"all" | "withDrafts" | "noDrafts">("all")

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }
    fetchUsers()
  }, [isAdmin, router])

  const fetchUsers = async () => {

    const { data, error } = await supabase
      .from("user_roles")
      .select("id, role, auth_users:auth.users(email)")

    if (error) {
      console.error("Error fetching users:", error)
      return
    }

    const usersWithDrafts: UserRow[] = await Promise.all(
      data.map(async (u: any) => {
        const { data: drafts } = await supabase
          .from("posts")
          .select("id, title")
          .eq("author", u.id)
          .eq("status", "draft")

        return {
          id: u.id,
          email: u.auth_users.email,
          role: u.role,
          drafts: drafts || [],
        }
      })
    )

    setUsers(usersWithDrafts)
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("id", userId)
    if (error) console.error("Error updating role:", error)
    else fetchUsers()
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      alert("You cannot delete your own account")
      return
    }
    if (confirm("Are you sure you want to delete this user?")) {
      const { error } = await supabase.from("user_roles").delete().eq("id", userId)
      if (error) console.error("Error deleting user:", error)
      else fetchUsers()
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.drafts.some((d) => d.title.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDraftFilter =
      draftFilter === "all" ||
      (draftFilter === "withDrafts" && u.drafts.length > 0) ||
      (draftFilter === "noDrafts" && u.drafts.length === 0)

    return matchesSearch && matchesDraftFilter
  })

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-primary text-primary-foreground p-6 min-h-screen">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">A</span>
            </div>
            <span className="text-xl font-bold">ALPACA</span>
          </div>

          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-primary-foreground hover:bg-white/10"
              onClick={() => router.push("/dashboard")}
            >
              <Users className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="secondary" className="w-full justify-start bg-white/20">
              <Shield className="w-4 h-4 mr-2" />
              View Posts
            </Button>
          </nav>
        </div>

        {/* main content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">View Posts</h1>
              <p className="text-muted-foreground">Manage user accounts, Post, and drafts</p>
            </div>

            {/*serach and f but it so hard  */}
            <Card className="mb-6">
              <CardContent className="p-6 flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={draftFilter} onValueChange={(val: "all" | "withDrafts" | "noDrafts") => setDraftFilter(val)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter drafts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="withDrafts">With Drafts</SelectItem>
                    <SelectItem value="noDrafts">No Drafts</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Users List */}
            <div className="grid gap-4">
              {filteredUsers.map((u) => (
                <Card key={u.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{u.email}</h3>
                          <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                          {u.drafts.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Drafts: {u.drafts.map((d) => d.title).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                          {u.role}
                        </Badge>

                        <Select
                          value={u.role}
                          onValueChange={(val: "admin" | "user") => handleRoleChange(u.id, val)}
                          disabled={u.id === user?.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user?.id}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No users found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or draft filter.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
