"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Vote, Calendar, Users, CheckCircle, Clock, Award } from "lucide-react"

interface Election {
  _id: string
  title: string
  description: string
  positions: string[]
  startDate: string
  endDate: string
  status: "active" | "completed" | "draft"
  totalVotes: number
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

interface VoteData {
  [position: string]: string
}

export default function AlumniVoting() {
  const [elections, setElections] = useState<Election[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedElection, setSelectedElection] = useState<Election | null>(null)
  const [votes, setVotes] = useState<VoteData>({})
  const [votingDialogOpen, setVotingDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userVotes, setUserVotes] = useState<string[]>([])

  useEffect(() => {
    fetchElections()
    fetchUserVotes()
  }, [])

  const fetchElections = async () => {
    try {
      const response = await fetch("/api/alumni/elections")
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

  const fetchCandidates = async (electionId: string) => {
    try {
      const response = await fetch(`/api/alumni/elections/${electionId}/candidates`)
      if (response.ok) {
        const data = await response.json()
        setCandidates(data)
      }
    } catch (error) {
      console.error("Error fetching candidates:", error)
    }
  }

  const fetchUserVotes = async () => {
    try {
      const response = await fetch("/api/alumni/votes")
      if (response.ok) {
        const data = await response.json()
        setUserVotes(data.map((vote: any) => vote.electionId))
      }
    } catch (error) {
      console.error("Error fetching user votes:", error)
    }
  }

  const startVoting = async (election: Election) => {
    setSelectedElection(election)
    await fetchCandidates(election._id)
    setVotes({})
    setVotingDialogOpen(true)
  }

  const submitVotes = async () => {
    if (!selectedElection) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/alumni/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          electionId: selectedElection._id,
          votes,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your votes have been submitted successfully!",
        })
        setVotingDialogOpen(false)
        setConfirmDialogOpen(false)
        fetchElections()
        fetchUserVotes()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit votes")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit votes",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getCandidatesByPosition = (position: string) => {
    return candidates.filter((candidate) => candidate.position === position)
  }

  const isElectionActive = (election: Election) => {
    const now = new Date()
    const start = new Date(election.startDate)
    const end = new Date(election.endDate)
    return election.status === "active" && now >= start && now <= end
  }

  const hasVoted = (electionId: string) => {
    return userVotes.includes(electionId)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Alumni Elections</h1>
        <p className="text-gray-600">Participate in alumni elections and make your voice heard</p>
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
                    election.status === "active" ? "default" : election.status === "completed" ? "secondary" : "outline"
                  }
                >
                  {election.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    {new Date(election.startDate).toLocaleDateString()} -{" "}
                    {new Date(election.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{election.positions.length} positions</span>
                </div>
                <div className="flex items-center">
                  <Vote className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{election.totalVotes} total votes</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Positions:</h4>
                <div className="flex flex-wrap gap-1">
                  {election.positions.map((position) => (
                    <Badge key={position} variant="outline" className="text-xs">
                      {position}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                {hasVoted(election._id) ? (
                  <div className="flex items-center justify-center py-2 text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">You have voted</span>
                  </div>
                ) : isElectionActive(election) ? (
                  <Button className="w-full" onClick={() => startVoting(election)}>
                    <Vote className="w-4 h-4 mr-2" />
                    Vote Now
                  </Button>
                ) : election.status === "completed" ? (
                  <Button variant="outline" className="w-full bg-transparent">
                    <Award className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                ) : (
                  <div className="flex items-center justify-center py-2 text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">{election.status === "draft" ? "Not started" : "Voting closed"}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {elections.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Elections Available</h3>
            <p className="text-gray-500">There are currently no elections available for voting.</p>
          </CardContent>
        </Card>
      )}

      {/* Voting Dialog */}
      <Dialog open={votingDialogOpen} onOpenChange={setVotingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedElection?.title}</DialogTitle>
            <DialogDescription>Select your preferred candidates for each position</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {selectedElection?.positions.map((position) => (
              <Card key={position}>
                <CardHeader>
                  <CardTitle className="text-lg">{position}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={votes[position] || ""}
                    onValueChange={(value) => setVotes({ ...votes, [position]: value })}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getCandidatesByPosition(position).map((candidate) => (
                        <div key={candidate._id} className="flex items-start space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value={candidate._id} id={candidate._id} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={candidate._id} className="cursor-pointer">
                              <div className="flex items-start space-x-3">
                                {candidate.photo ? (
                                  <img
                                    src={candidate.photo || "/placeholder.svg"}
                                    alt={candidate.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="font-medium">{candidate.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{candidate.bio}</p>
                                  {candidate.qualifications.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs font-medium text-gray-500">Qualifications:</p>
                                      <ul className="text-xs text-gray-600 mt-1">
                                        {candidate.qualifications.map((qual, index) => (
                                          <li key={index}>• {qual}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVotingDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => setConfirmDialogOpen(true)}
              disabled={Object.keys(votes).length !== selectedElection?.positions.length}
            >
              Submit Votes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Votes</DialogTitle>
            <DialogDescription>
              Please review your selections before submitting. Once submitted, votes cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {Object.entries(votes).map(([position, candidateId]) => {
              const candidate = candidates.find((c) => c._id === candidateId)
              return (
                <div key={position} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{position}:</span>
                  <span className="text-gray-700">{candidate?.name}</span>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Review
            </Button>
            <Button onClick={submitVotes} disabled={submitting}>
              {submitting ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
