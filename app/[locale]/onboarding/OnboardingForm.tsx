"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@/lib/zod-resolver"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/routing"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Rocket } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createWorkspace } from "@/actions/workspace"
import { workspaceFormSchema, type WorkspaceFormValues } from "@/lib/validations/workspace"

type FormData = WorkspaceFormValues

export function OnboardingForm({ locale }: { locale: string }) {
  const t = useTranslations("WorkspaceSetup")
  const router = useRouter()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: "",
      entity_type: "individual",
    },
  })

  async function onSubmit(data: FormData) {
    const result = await createWorkspace(data, locale)

    if (result.success) {
      toast.success(t("successToast"))
      await router.refresh()
      router.replace("/dashboard")
    } else {
      toast.error(t("errorToast"), { description: result.error })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Entity Type Toggle */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("entityType")}
        </p>
        <Controller
          name="entity_type"
          control={control}
          render={({ field }) => (
            <div className="relative flex w-full rounded-full bg-secondary p-1">
              {(["individual", "business"] as const).map((type) => {
                const isActive = field.value === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => field.onChange(type)}
                    className={cn(
                      "relative z-10 w-1/2 rounded-full py-2.5 text-sm font-medium capitalize tracking-wide transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="entity-type-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-card shadow-ambient"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {t(type)}
                  </button>
                )
              })}
            </div>
          )}
        />
      </div>

      {/* Workspace Name */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("name")}
        </label>
        <Input
          {...register("name")}
          placeholder={t("namePlaceholder")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs font-medium text-destructive">{t("errors.tooShort")}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full gap-2"
        disabled={isSubmitting}
      >
        <Rocket size={16} strokeWidth={1.5} />
        {isSubmitting ? t("creating") : t("cta")}
      </Button>
    </form>
  )
}
