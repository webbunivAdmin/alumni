"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, GraduationCap, Briefcase, Vote, LogOut, Calendar, Mail, Phone, MapPin, Award } from "lucide-react"

interface AlumniData {
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
    status: string
    verificationStatus: string
  }
}

export default function AlumniDashboard() {
  const [alumniData, setAlumniData] = useState<AlumniData | null>(null)
  const [activeElections, setActiveElections] = useState([])
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem("alumni_session")
    if (!session) {
      router.push("/alumni/login")
      return
    }

    try {
      const data = JSON.parse(session)
      setAlumniData(data)
      fetchActiveElections()
    } catch (error) {
      console.error("Error parsing session:", error)
      router.push("/alumni/login")
    }
  }, [router])

  const fetchActiveElections = async () => {
    try {
      const response = await fetch("/api/elections/active")
      if (response.ok) {
        const elections = await response.json()
        setActiveElections(elections)
      }
    } catch (error) {
      console.error("Error fetching elections:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("alumni_session")
    router.push("/alumni/login")
  }

  if (!alumniData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Alumni Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {alumniData.personalInfo.firstName}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant={alumniData.metadata.status === "approved" ? "default" : "secondary"}>
                {alumniData.metadata.status}
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="voting">Voting</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">
                    {alumniData.personalInfo.firstName} {alumniData.personalInfo.lastName}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Student ID</label>
                  <p className="text-gray-900 font-mono">{alumniData.studentId}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <p className="text-gray-900">{alumniData.personalInfo.email}</p>
                  </div>
                </div>

                {alumniData.personalInfo.phone && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{alumniData.personalInfo.phone}</p>
                    </div>
                  </div>
                )}

                {alumniData.personalInfo.nationality && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Nationality</label>
                    <p className="text-gray-900">{alumniData.personalInfo.nationality}</p>
                  </div>
                )}

                {alumniData.personalInfo.gender && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900 capitalize">{alumniData.personalInfo.gender}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">School/Faculty</label>
                  <p className="text-gray-900">{alumniData.academicInfo.school}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Degree</label>
                  <p className="text-gray-900">{alumniData.academicInfo.degree}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Graduation Year</label>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <p className="text-gray-900">{alumniData.academicInfo.graduationYear}</p>
                  </div>
                </div>

                {alumniData.academicInfo.gpa && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">GPA</label>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{alumniData.academicInfo.gpa}</p>
                    </div>
                  </div>
                )}

                {alumniData.academicInfo.honors && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Honors</label>
                    <p className="text-gray-900">{alumniData.academicInfo.honors}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alumniData.professionalInfo.currentPosition && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Current Position</label>
                    <p className="text-gray-900">{alumniData.professionalInfo.currentPosition}</p>
                  </div>
                )}

                {alumniData.professionalInfo.company && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p className="text-gray-900">{alumniData.professionalInfo.company}</p>
                  </div>
                )}

                {alumniData.professionalInfo.industry && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Industry</label>
                    <p className="text-gray-900">{alumniData.professionalInfo.industry}</p>
                  </div>
                )}

                {alumniData.professionalInfo.location && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{alumniData.professionalInfo.location}</p>
                    </div>
                  </div>
                )}

                {alumniData.professionalInfo.workExperience && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Work Experience</label>
                    <p className="text-gray-900">{alumniData.professionalInfo.workExperience} years</p>
                  </div>
                )}

                {alumniData.professionalInfo.linkedIn && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">LinkedIn</label>
                    <a
                      href={alumniData.professionalInfo.linkedIn}
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
          </TabsContent>

          {/* Voting Tab */}
          <TabsContent value="voting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Vote className="w-5 h-5 mr-2" />
                  Alumni Elections
                </CardTitle>
                <CardDescription>Participate in alumni elections and voting</CardDescription>
              </CardHeader>
              <CardContent>
                {activeElections.length > 0 ? (
                  <div className="space-y-4">
                    {activeElections.map((election: any) => (
                      <div key={election._id} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{election.title}</h3>
                        <p className="text-gray-600 text-sm">{election.description}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <Badge variant="outline">Ends: {new Date(election.endDate).toLocaleDateString()}</Badge>
                          <Button size="sm">View Candidates</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active elections at the moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
