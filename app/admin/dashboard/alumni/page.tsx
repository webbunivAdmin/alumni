"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Eye, Check, X, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase } from "lucide-react"

interface Alumni {
  _id: string
  studentId: string
  verificationCode: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    dateOfBirth?: string
    gender?: string
    nationality?: string
  }
  academicInfo: {
    graduationYear: number
    school: string
    degree: string
    gpa?: number
    honors?: string
  }
  professionalInfo: {
    currentPosition?: string
    company?: string
    industry?: string
    workExperience?: number
    location?: string
    linkedIn?: string
  }
  metadata: {
    registrationDate: string
    status: "pending" | "approved" | "rejected"
    verificationStatus: string
  }
}

export default function AlumniManagement() {
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [actionReason, setActionReason] = useState("")

  useEffect(() => {
    fetchAlumni()
  }, [])

  const fetchAlumni = async () => {
    try {
      const response = await fetch("/api/admin/alumni")
      if (response.ok) {
        const data = await response.json()
        setAlumni(data)
      }
    } catch (error) {
      console.error("Error fetching alumni:", error)
      toast({
        title: "Error",
        description: "Failed to fetch alumni data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedAlumni || !actionType) return

    try {
      const response = await fetch(`/api/admin/alumni/${selectedAlumni._id}/${actionType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: actionReason }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Alumni ${actionType}d successfully`,
        })
        fetchAlumni()
        setActionDialogOpen(false)
        setActionReason("")
        setSelectedAlumni(null)
        setActionType(null)
      } else {
        throw new Error("Failed to update alumni status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update alumni status",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Alumni>[] = [
    {
      accessorKey: "personalInfo.firstName",
      header: "Name",
      cell: ({ row }) => {
        const alumni = row.original
        return (
          <div>
            <div className="font-medium">
              {alumni.personalInfo.firstName} {alumni.personalInfo.lastName}
            </div>
            <div className="text-sm text-gray-500">{alumni.personalInfo.email}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "studentId",
      header: "Student ID",
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("studentId")}</span>,
    },
    {
      accessorKey: "academicInfo.school",
      header: "School",
    },
    {
      accessorKey: "academicInfo.graduationYear",
      header: "Graduation Year",
    },
    {
      accessorKey: "metadata.status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("metadata.status") as string
        return (
          <Badge variant={status === "approved" ? "default" : status === "pending" ? "secondary" : "destructive"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "metadata.registrationDate",
      header: "Registration Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("metadata.registrationDate"))
        return date.toLocaleDateString()
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const alumni = row.original
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedAlumni(alumni)
                setViewDialogOpen(true)
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
            {alumni.metadata.status === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    setSelectedAlumni(alumni)
                    setActionType("approve")
                    setActionDialogOpen(true)
                  }}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedAlumni(alumni)
                    setActionType("reject")
                    setActionDialogOpen(true)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )
      },
    },
  ]

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Alumni Management</CardTitle>
          <CardDescription>Manage alumni registrations and approvals</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={alumni}
            searchKey="personalInfo.firstName"
            searchPlaceholder="Search alumni..."
          />
        </CardContent>
      </Card>

      {/* View Alumni Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Alumni Details</DialogTitle>
          </DialogHeader>
          {selectedAlumni && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                    <p className="text-gray-900">
                      {selectedAlumni.personalInfo.firstName} {selectedAlumni.personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{selectedAlumni.personalInfo.email}</p>
                    </div>
                  </div>
                  {selectedAlumni.personalInfo.phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone</Label>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">{selectedAlumni.personalInfo.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedAlumni.personalInfo.dateOfBirth && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">
                          {new Date(selectedAlumni.personalInfo.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedAlumni.personalInfo.gender && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Gender</Label>
                      <p className="text-gray-900 capitalize">{selectedAlumni.personalInfo.gender}</p>
                    </div>
                  )}
                  {selectedAlumni.personalInfo.nationality && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nationality</Label>
                      <p className="text-gray-900">{selectedAlumni.personalInfo.nationality}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Student ID</Label>
                    <p className="text-gray-900 font-mono">{selectedAlumni.studentId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">School/Faculty</Label>
                    <p className="text-gray-900">{selectedAlumni.academicInfo.school}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Degree</Label>
                    <p className="text-gray-900">{selectedAlumni.academicInfo.degree}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Graduation Year</Label>
                    <p className="text-gray-900">{selectedAlumni.academicInfo.graduationYear}</p>
                  </div>
                  {selectedAlumni.academicInfo.gpa && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">GPA</Label>
                      <p className="text-gray-900">{selectedAlumni.academicInfo.gpa}</p>
                    </div>
                  )}
                  {selectedAlumni.academicInfo.honors && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Honors</Label>
                      <p className="text-gray-900">{selectedAlumni.academicInfo.honors}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAlumni.professionalInfo.currentPosition && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Current Position</Label>
                      <p className="text-gray-900">{selectedAlumni.professionalInfo.currentPosition}</p>
                    </div>
                  )}
                  {selectedAlumni.professionalInfo.company && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Company</Label>
                      <p className="text-gray-900">{selectedAlumni.professionalInfo.company}</p>
                    </div>
                  )}
                  {selectedAlumni.professionalInfo.industry && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Industry</Label>
                      <p className="text-gray-900">{selectedAlumni.professionalInfo.industry}</p>
                    </div>
                  )}
                  {selectedAlumni.professionalInfo.location && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Location</Label>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="text-gray-900">{selectedAlumni.professionalInfo.location}</p>
                      </div>
                    </div>
                  )}
                  {selectedAlumni.professionalInfo.workExperience && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Work Experience</Label>
                      <p className="text-gray-900">{selectedAlumni.professionalInfo.workExperience} years</p>
                    </div>
                  )}
                  {selectedAlumni.professionalInfo.linkedIn && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">LinkedIn</Label>
                      <a
                        href={selectedAlumni.professionalInfo.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Information */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Status Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Registration Status</Label>
                    <Badge
                      variant={
                        selectedAlumni.metadata.status === "approved"
                          ? "default"
                          : selectedAlumni.metadata.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {selectedAlumni.metadata.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Verification Status</Label>
                    <Badge variant="outline">{selectedAlumni.metadata.verificationStatus}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Registration Date</Label>
                    <p className="text-gray-900">
                      {new Date(selectedAlumni.metadata.registrationDate).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve Alumni" : "Reject Alumni"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This will approve the alumni registration and send a confirmation email."
                : "This will reject the alumni registration and send a notification email."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">
                {actionType === "approve" ? "Approval Notes (Optional)" : "Rejection Reason"}
              </Label>
              <Textarea
                id="reason"
                placeholder={
                  actionType === "approve"
                    ? "Add any notes for this approval..."
                    : "Please provide a reason for rejection..."
                }
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                required={actionType === "reject"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              variant={actionType === "approve" ? "default" : "destructive"}
              disabled={actionType === "reject" && !actionReason.trim()}
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
