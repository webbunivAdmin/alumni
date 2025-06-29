"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Plus, Calendar, Users, Vote, Settings, Eye, Edit, Trash2 } from "lucide-react"
import { UploadButton } from "@/lib/uploadthing"

interface Election {
  _id: string
  title: string
  description: string
  positions: string[]
  startDate: string
  endDate: string
  status: "draft" | "active" | "completed" | "cancelled"
  eligibleGraduationYears: number[]
  eligibleSchools: string[]
  totalVotes: number
  createdAt: string
}

interface Candidate {
  _id: string
  name: string
  position: string
  photo: string
  bio: string
  qualifications: string[]
  manifesto: string
  electionId: string
  votes: number
}

const SCHOOLS = [
  "School of Business",
  "School of Science and Technology",
  "School of Education",
  "School of Social Sciences",
  "School of Natural Sciences",
  "School of Graduate Studies",
  "School of Agriculture",
  "School of Health Sciences",
  "School of Theology",
]

const POSITIONS = [
  "President",
  "Vice President",
  "Secretary General",
  "Treasurer",
  "Public Relations Officer",
  "Sports Secretary",
  "Academic Secretary",
]

export default function ElectionManagement() {
  const [elections, setElections] = useState<Election[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [createElectionOpen, setCreateElectionOpen] = useState(false)
  const [addCandidateOpen, setAddCandidateOpen] = useState(false)
  const [selectedElection, setSelectedElection] = useState<Election | null>(null)

  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    positions: [] as string[],
    startDate: "",
    endDate: "",
    eligibleGraduationYears: [] as number[],
    eligibleSchools: [] as string[],
  })

  const [newCandidate, setNewCandidate] = useState({
    name: "",
    position: "",
    photo: "",
    bio: "",
    qualifications: "",
    manifesto: "",
    electionId: "",
  })

  useEffect(() => {
    fetchElections()
    fetchCandidates()
  }, [])

  const fetchElections = async () => {
    try {
      const response = await fetch("/api/admin/elections")
      if (response.ok) {
        const data = await response.json()
        setElections(data)
      }
    } catch (error) {
      console.error("Error fetching elections:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/admin/candidates")
      if (response.ok) {
        const data = await response.json()
        setCandidates(data)
      }
    } catch (error) {
      console.error("Error fetching candidates:", error)
    }
  }

  const createElection = async () => {
    try {
      const response = await fetch("/api/admin/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newElection),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Election created successfully",
        })
        fetchElections()
        setCreateElectionOpen(false)
        setNewElection({
          title: "",
          description: "",
          positions: [],
          startDate: "",
          endDate: "",
          eligibleGraduationYears: [],
          eligibleSchools: [],
        })
      } else {
        throw new Error("Failed to create election")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create election",
        variant: "destructive",
      })
    }
  }

  const addCandidate = async () => {
    try {
      const candidateData = {
        ...newCandidate,
        qualifications: newCandidate.qualifications.split(",").map((q) => q.trim()),
      }

      const response = await fetch("/api/admin/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Candidate added successfully",
        })
        fetchCandidates()
        setAddCandidateOpen(false)
        setNewCandidate({
          name: "",
          position: "",
          photo: "",
          bio: "",
          qualifications: "",
          manifesto: "",
          electionId: "",
        })
      } else {
        throw new Error("Failed to add candidate")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add candidate",
        variant: "destructive",
      })
    }
  }

  const updateElectionStatus = async (electionId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/elections/${electionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Election status updated successfully",
        })
        fetchElections()
      } else {
        throw new Error("Failed to update election status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update election status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Election Management</h1>
          <p className="text-gray-600">Manage alumni elections and candidates</p>
        </div>
        <Button onClick={() => setCreateElectionOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Election
        </Button>
      </div>

      {/* Elections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map((election) => (
          <Card key={election._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{election.title}</CardTitle>
                  <CardDescription className="mt-2">{election.description}</CardDescription>
                </div>
                <Badge
                  variant={
                    election.status === "active"
                      ? "default"
                      : election.status === "completed"
                        ? "secondary"
                        : election.status === "draft"
                          ? "outline"
                          : "destructive"
                  }
                >
                  {election.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Positions: {election.positions.length}</span>
                </div>
                <div className="flex items-center">
                  <Vote className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Votes: {election.totalVotes}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setSelectedElection(election)
                    setNewCandidate({ ...newCandidate, electionId: election._id })
                    setAddCandidateOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Candidate
                </Button>
                <Select value={election.status} onValueChange={(value) => updateElectionStatus(election._id, value)}>
                  <SelectTrigger className="w-24">
                    <Settings className="w-4 h-4" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Candidates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
          <CardDescription>Manage election candidates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate) => (
              <Card key={candidate._id} className="overflow-hidden">
                <div className="aspect-square relative">
                  {candidate.photo ? (
                    <img
                      src={candidate.photo || "/placeholder.svg"}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-gray-600">{candidate.position}</p>
                  <p className="text-xs text-gray-500 mt-1">Votes: {candidate.votes}</p>
                  <div className="mt-2 flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Election Dialog */}
      <Dialog open={createElectionOpen} onOpenChange={setCreateElectionOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Election</DialogTitle>
            <DialogDescription>Set up a new alumni election</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Election Title</Label>
              <Input
                id="title"
                value={newElection.title}
                onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                placeholder="e.g., Alumni Association Elections 2025"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newElection.description}
                onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                placeholder="Describe the election..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={newElection.startDate}
                  onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={newElection.endDate}
                  onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Positions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {POSITIONS.map((position) => (
                  <label key={position} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newElection.positions.includes(position)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewElection({
                            ...newElection,
                            positions: [...newElection.positions, position],
                          })
                        } else {
                          setNewElection({
                            ...newElection,
                            positions: newElection.positions.filter((p) => p !== position),
                          })
                        }
                      }}
                    />
                    <span className="text-sm">{position}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Eligible Schools</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                {SCHOOLS.map((school) => (
                  <label key={school} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newElection.eligibleSchools.includes(school)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewElection({
                            ...newElection,
                            eligibleSchools: [...newElection.eligibleSchools, school],
                          })
                        } else {
                          setNewElection({
                            ...newElection,
                            eligibleSchools: newElection.eligibleSchools.filter((s) => s !== school),
                          })
                        }
                      }}
                    />
                    <span className="text-xs">{school}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateElectionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createElection}>Create Election</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Candidate Dialog */}
      <Dialog open={addCandidateOpen} onOpenChange={setAddCandidateOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Candidate</DialogTitle>
            <DialogDescription>Add a new candidate to the election</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="candidateName">Candidate Name</Label>
              <Input
                id="candidateName"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                placeholder="Full name of the candidate"
              />
            </div>
            <div>
              <Label htmlFor="candidatePosition">Position</Label>
              <Select
                value={newCandidate.position}
                onValueChange={(value) => setNewCandidate({ ...newCandidate, position: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {selectedElection?.positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Candidate Photo</Label>
              <div className="mt-2">
                {newCandidate.photo ? (
                  <div className="space-y-2">
                    <img
                      src={newCandidate.photo || "/placeholder.svg"}
                      alt="Candidate"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <Button variant="outline" size="sm" onClick={() => setNewCandidate({ ...newCandidate, photo: "" })}>
                      Remove Photo
                    </Button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="candidateImage"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]) {
                        setNewCandidate({ ...newCandidate, photo: res[0].url })
                        toast({
                          title: "Success",
                          description: "Photo uploaded successfully",
                        })
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast({
                        title: "Error",
                        description: "Failed to upload photo",
                        variant: "destructive",
                      })
                    }}
                  />
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="candidateBio">Biography</Label>
              <Textarea
                id="candidateBio"
                value={newCandidate.bio}
                onChange={(e) => setNewCandidate({ ...newCandidate, bio: e.target.value })}
                placeholder="Brief biography of the candidate..."
              />
            </div>
            <div>
              <Label htmlFor="candidateQualifications">Qualifications</Label>
              <Input
                id="candidateQualifications"
                value={newCandidate.qualifications}
                onChange={(e) => setNewCandidate({ ...newCandidate, qualifications: e.target.value })}
                placeholder="Comma-separated qualifications"
              />
            </div>
            <div>
              <Label htmlFor="candidateManifesto">Manifesto</Label>
              <Textarea
                id="candidateManifesto"
                value={newCandidate.manifesto}
                onChange={(e) => setNewCandidate({ ...newCandidate, manifesto: e.target.value })}
                placeholder="Candidate's manifesto and vision..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCandidateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addCandidate}>Add Candidate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
