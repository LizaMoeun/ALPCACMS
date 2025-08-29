"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CalendarIcon, Upload, X, Minimize2, Maximize2 } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"

export function CreatePostForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [postType, setPostType] = useState("club")
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("11:36")
  const [image, setImage] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePublish = () => {
    console.log("[v0] Publishing post:", { title, content, postType, date, time, image })
    // Here you would typically send the data to your backend
    alert("Post published successfully!")
  }

  const handleSaveDraft = () => {
    console.log("[v0] Saving draft:", { title, content, postType, date, time, image })
    // Here you would typically save the draft to your backend
    alert("Draft saved successfully!")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Posts Page</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title Post:</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  className="mt-1"
                />
              </div>

              {/* Date & Time */}
              <div>
                <Label>Date & Time:</Label>
                <div className="flex gap-2 mt-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy") : "mm/dd/yyyy"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center gap-1">
                    <Input value={time} onChange={(e) => setTime(e.target.value)} className="w-20" />
                    <span className="text-sm text-muted-foreground">AM</span>
                    <span className="text-sm text-muted-foreground">PM</span>
                  </div>
                </div>
              </div>

              {/* Type of Post */}
              <div>
                <Label>Type of Post:</Label>
                <RadioGroup value={postType} onValueChange={setPostType} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="club" id="club" />
                    <Label htmlFor="club">Club</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="events" id="events" />
                    <Label htmlFor="events">Events</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Content:</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your content here..."
                  className="mt-1 min-h-[120px]"
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label>Image (Optional):</Label>
                <div className="mt-2">
                  {image ? (
                    <div className="relative inline-block">
                      <Image
                        src={image || "/placeholder.svg?height=96&width=96"}
                        alt="Upload preview"
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => setImage(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded cursor-pointer hover:border-muted-foreground/50">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">Add Image</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handlePublish} className="flex-1">
                  PUBLISH NOW
                </Button>
                <Button variant="outline" onClick={handleSaveDraft} className="flex-1 bg-transparent">
                  SAVE DRAFTS
                </Button>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Preview</h3>
              <div className="space-y-4">
                {title && (
                  <div>
                    <h4 className="font-medium">{title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {postType === "club" ? "Club" : "Event"} • {date ? format(date, "MMM d, yyyy") : "No date"} •{" "}
                      {time}
                    </p>
                  </div>
                )}
                {content && <p className="text-sm text-muted-foreground">{content}</p>}
                {image && (
                  <Image
                    src={image || "/placeholder.svg?height=200&width=300"}
                    alt="Post preview"
                    width={300}
                    height={200}
                    className="w-full max-w-xs rounded"
                  />
                )}
                {!title && !content && !image && (
                  <p className="text-sm text-muted-foreground italic">Start typing to see preview...</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Events/Post selection */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <div className="p-6 text-center space-y-4">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                setPostType("events")
                setShowModal(false)
              }}
            >
              Events
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                setPostType("club")
                setShowModal(false)
              }}
            >
              Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
