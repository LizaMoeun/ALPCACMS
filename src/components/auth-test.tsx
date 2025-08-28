"use client"

import { useAuth } from "@/lib/auth"

export function AuthTest() {
  const { user, isLoading } = useAuth()

  console.log("[v0] Auth test - user:", user, "isLoading:", isLoading)

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3>Auth Test Component</h3>
      <p>User: {user ? user.name : "Not logged in"}</p>
      <p>Loading: {isLoading ? "Yes" : "No"}</p>
    </div>
  )
}
