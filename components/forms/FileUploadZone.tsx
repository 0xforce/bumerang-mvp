"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, File as FileIcon, X, Loader2, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

interface FileUploadZoneProps {
  name: string
  label: string
  hint?: string
  accept?: Record<string, string[]>
  maxSize?: number // in bytes
  value?: string
  onChange: (url: string) => void
  organizationId: string
  documentType: string
}

export function FileUploadZone({
  name,
  label,
  hint,
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "application/pdf": [".pdf"],
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  value,
  onChange,
  organizationId,
  documentType,
}: FileUploadZoneProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [isPdf, setIsPdf] = React.useState(false)

  // Determine if existing value is a PDF
  React.useEffect(() => {
    if (value) {
      setIsPdf(value.toLowerCase().endsWith(".pdf"))
      setPreview(value)
    } else {
      setPreview(null)
      setIsPdf(false)
    }
  }, [value])

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setIsUploading(true)
      const supabase = createClient()

      try {
        const ext = file.name.split(".").pop()
        const timestamp = Date.now()
        const filePath = `${organizationId}/${documentType}_${timestamp}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("compliance_documents")
          .upload(filePath, file, { upsert: true })

        if (uploadError) {
          throw uploadError
        }

        const { data } = supabase.storage.from("compliance_documents").getPublicUrl(filePath)
        
        onChange(data.publicUrl)
        toast.success("File uploaded successfully")
      } catch (error: any) {
        console.error("Upload error:", error)
        toast.error("Failed to upload file", { description: error.message })
      } finally {
        setIsUploading(false)
      }
    },
    [organizationId, documentType, onChange],
  )

  const handleRemove = React.useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!value) return

      // Extract path from public URL
      const urlObj = new URL(value)
      const pathParts = urlObj.pathname.split("/compliance_documents/")
      if (pathParts.length > 1) {
        const filePath = pathParts[1]
        const supabase = createClient()
        await supabase.storage.from("compliance_documents").remove([filePath])
      }

      onChange("")
    },
    [value, onChange],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-muted-foreground">
        {label}
      </label>

      <div
        {...getRootProps()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all duration-200 ease-out outline-none",
          "bg-card hover:bg-secondary/50 dark:bg-[#1a1a1a] dark:hover:bg-[#1a1a1a]/80 focus-visible:ring-2 focus-visible:ring-orange/30",
          isDragActive && "border-orange bg-orange/5 dark:bg-orange/10",
          isDragReject && "border-destructive bg-destructive/5 dark:bg-destructive/10",
          !isDragActive && !isDragReject && "border-border/60",
          (isUploading || value) && "pointer-events-none cursor-default",
        )}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-orange" strokeWidth={1.5} />
            <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
          </div>
        ) : value ? (
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                {isPdf ? (
                  <FileIcon className="size-6 text-muted-foreground" strokeWidth={1.5} />
                ) : preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Preview"
                    className="size-full rounded-xl object-cover"
                  />
                ) : (
                  <ImageIcon className="size-6 text-muted-foreground" strokeWidth={1.5} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground dark:text-slate-100">
                  Document uploaded
                </p>
                <p className="text-xs text-muted-foreground">Click remove to replace</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground pointer-events-auto"
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground mb-2">
              <UploadCloud className="size-6" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-foreground dark:text-slate-100">
              <span className="text-orange">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              {hint || "SVG, PNG, JPG or PDF (max. 5MB)"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
