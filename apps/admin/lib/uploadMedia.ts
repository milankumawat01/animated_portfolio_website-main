import { useAction, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'

/** Upload an image straight to R2 via a presigned URL, then register it in the media table. */
export function useUploadMedia() {
  const generateUploadUrl = useAction(api.media.generateUploadUrl)
  const createMedia = useMutation(api.media.create)

  return async (file: File, alt: string, dims: { w: number; h: number } | null) => {
    const { uploadUrl, key } = await generateUploadUrl({ contentType: file.type })
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!res.ok) throw new Error('Upload to storage failed')
    return await createMedia({
      r2Key: key,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      alt,
      width: dims?.w,
      height: dims?.h,
    })
  }
}
