import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

const f = createUploadthing()

export const ourFileRouter = {
  candidateImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Check if user is admin
      const adminSession = req.cookies.get("admin_session")?.value

      if (!adminSession) {
        throw new UploadThingError("Unauthorized")
      }

      try {
        const sessionData = JSON.parse(adminSession)
        return { adminId: sessionData.id }
      } catch (error) {
        throw new UploadThingError("Invalid session")
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for admin:", metadata.adminId)
      console.log("File URL:", file.url)
      return { uploadedBy: metadata.adminId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
