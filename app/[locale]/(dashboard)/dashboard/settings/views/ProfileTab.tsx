"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@/lib/zod-resolver"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateProfileSchema, type UpdateProfilePayload } from "@/lib/validations/user"
import { updateUserProfile } from "@/actions/user"

interface ProfileTabProps {
  initialData: {
    fullName: string | null
    email: string
    phone: string | null
    organizationName: string | null
  }
}

export function ProfileTab({ initialData }: ProfileTabProps) {
  const t = useTranslations("Settings.profile")

  const [firstName, lastName] = React.useMemo(() => {
    if (!initialData.fullName) return ["", ""]
    const parts = initialData.fullName.split(" ")
    return [parts[0] ?? "", parts.slice(1).join(" ")]
  }, [initialData.fullName])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfilePayload>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName,
      lastName,
      phone: initialData.phone ?? "",
    },
  })

  const onSubmit = async (data: UpdateProfilePayload) => {
    const result = await updateUserProfile(data)
    if (result.success) {
      toast.success(t("saveSuccess"))
    } else {
      toast.error(t("saveError"), { description: result.error })
    }
  }

  return (
    <div className="rounded-3xl bg-card p-6 shadow-ambient sm:p-8 md:p-10">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Personal Details */}
          <div className="space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("personalDetails")}
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t("firstName")}</label>
                <Input
                  className="rounded-xl"
                  {...register("firstName")}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t("lastName")}</label>
                <Input
                  className="rounded-xl"
                  {...register("lastName")}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t("email")}</label>
                <Input
                  defaultValue={initialData.email}
                  disabled
                  className="rounded-xl opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t("phone")}</label>
                <Input
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  className="rounded-xl"
                  {...register("phone")}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("companyDetails")}
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("businessName")}
                </label>
                <Input
                  defaultValue={initialData.organizationName ?? ""}
                  disabled
                  className="rounded-xl opacity-60"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground/70">
              {t("companyNote")}
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-end border-t border-border/40 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="rounded-full px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("save")
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
