import type { ObjectId } from "mongodb"

export interface VotingCandidate {
  _id?: ObjectId
  name: string
  position: string
  photo: string // Uploadthing URL
  bio: string
  qualifications: string[]
  manifesto: string
  electionId: string
  votes: number
  createdAt: Date
  updatedAt: Date
}

export interface Election {
  _id?: ObjectId
  title: string
  description: string
  positions: string[]
  startDate: Date
  endDate: Date
  status: "draft" | "active" | "completed" | "cancelled"
  eligibleGraduationYears: number[]
  eligibleSchools: string[]
  totalVotes: number
  createdAt: Date
  updatedAt: Date
}

export interface Vote {
  _id?: ObjectId
  electionId: string
  alumniId: string // studentId
  candidateId: string
  position: string
  timestamp: Date
  ipAddress?: string
}

export interface OTPSession {
  _id?: ObjectId
  studentId: string
  verificationCode: string
  otp: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

export interface Admin {
  _id?: ObjectId
  identifier: string
  password: string // hashed
  name: string
  email: string
  role: "super_admin" | "alumni_manager" | "voting_manager"
  permissions: string[]
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
