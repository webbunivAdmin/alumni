import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, Vote, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mx-auto mb-8 w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bugema University Alumni Management System</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with fellow alumni, participate in elections, and stay engaged with your university community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Alumni Login Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Alumni Portal</CardTitle>
              <CardDescription>
                Access your alumni dashboard, update your profile, and participate in voting
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/alumni/login">
                <Button size="lg" className="w-full">
                  <Users className="w-5 h-5 mr-2" />
                  Alumni Login
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-4">Use your Student ID and Verification Code</p>
            </CardContent>
          </Card>

          {/* Admin Login Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Admin Portal</CardTitle>
              <CardDescription>Manage alumni registrations, elections, and system administration</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/admin/login">
                <Button size="lg" variant="outline" className="w-full bg-transparent">
                  <Settings className="w-5 h-5 mr-2" />
                  Admin Login
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-4">Administrative access required</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Alumni Management</h3>
              <p className="text-gray-600">
                Comprehensive alumni registration, approval, and profile management system
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Electronic Voting</h3>
              <p className="text-gray-600">Secure online voting system for alumni elections and important decisions</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
              <p className="text-gray-600">Powerful administrative tools for managing the entire alumni ecosystem</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-500">
          <p>© 2025 Bugema University. All rights reserved.</p>
          <p className="mt-2">Alumni Management System v1.0</p>
        </footer>
      </div>
    </div>
  )
}
