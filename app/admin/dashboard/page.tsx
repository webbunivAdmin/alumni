"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Vote, Settings, LogOut, UserCheck, Calendar, BarChart3, Plus, Eye } from "lucide-react"

interface AdminData {
  id: string
  identifier: string
  name: string
  email: string
  role: string
  permissions: string[]
}

interface AlumniStats {
  total: number
  approved: number
  pending: number
  rejected: number
}

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [alumniStats, setAlumniStats] = useState<AlumniStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  })
  const [recentAlumni, setRecentAlumni] = useState([])
  const [activeElections, setActiveElections] = useState([])
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem("admin_session")
    if (!session) {
      router.push("/admin/login")
      return
    }

    try {
      const data = JSON.parse(session)
      setAdminData(data)
      fetchDashboardData()
    } catch (error) {
      console.error("Error parsing session:", error)
      router.push("/admin/login")
    }
  }, [router])

  const fetchDashboardData = async () => {
    try {
      // Fetch alumni stats
      const statsResponse = await fetch("/api/admin/alumni/stats")
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        setAlumniStats(stats)
      }

      // Fetch recent alumni
      const recentResponse = await fetch("/api/admin/alumni/recent")
      if (recentResponse.ok) {
        const recent = await recentResponse.json()
        setRecentAlumni(recent)
      }

      // Fetch active elections
      const electionsResponse = await fetch("/api/admin/elections")
      if (electionsResponse.ok) {
        const elections = await electionsResponse.json()
        setActiveElections(elections)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_session")
    router.push("/admin/login")
  }

  if (!adminData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {adminData.name}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize">
                {adminData.role.replace("_", " ")}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Alumni</p>
                  <p className="text-2xl font-bold text-gray-900">{alumniStats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{alumniStats.approved}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{alumniStats.pending}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Elections</p>
                  <p className="text-2xl font-bold text-purple-600">{activeElections.length}</p>
                </div>
                <Vote className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alumni" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alumni">Alumni Management</TabsTrigger>
            <TabsTrigger value="elections">Elections</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Alumni Management Tab */}
          <TabsContent value="alumni" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Alumni Registrations</h2>
              <Button>
                <Eye className="w-4 h-4 mr-2" />
                View All Alumni
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          School
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentAlumni.map((alumni: any) => (
                        <tr key={alumni._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {alumni.personalInfo.firstName} {alumni.personalInfo.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{alumni.personalInfo.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {alumni.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {alumni.academicInfo.school}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                alumni.metadata.status === "approved"
                                  ? "default"
                                  : alumni.metadata.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {alumni.metadata.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {alumni.metadata.status === "pending" && (
                                <>
                                  <Button size="sm" variant="default">
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Elections Tab */}
          <TabsContent value="elections" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Election Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Election
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeElections.map((election: any) => (
                <Card key={election._id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{election.title}</CardTitle>
                    <CardDescription>{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <Badge variant={election.status === "active" ? "default" : "secondary"}>
                          {election.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Votes:</span>
                        <span className="font-medium">{election.totalVotes}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">End Date:</span>
                        <span className="font-medium">{new Date(election.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        View Results
                      </Button>
                      <Button size="sm" className="flex-1">
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Alumni Analytics
                </CardTitle>
                <CardDescription>Overview of alumni registration and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
