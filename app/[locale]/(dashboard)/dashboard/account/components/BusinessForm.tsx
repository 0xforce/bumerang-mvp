"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@/lib/zod-resolver"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { DatePickerInput } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/forms/FormField"
import { CountrySelect } from "@/components/forms/CountrySelect"
import { StepIndicator } from "@/components/forms/StepIndicator"
import {
  createKybSchema,
  type KybFormData,
  KYB_STEPS,
} from "@/lib/validations/compliance"
import { AlertCircle, ChevronLeft, Send } from "lucide-react"

import { submitComplianceData } from "@/actions/compliance"
import { toast } from "sonner"
import { FileUploadZone } from "@/components/forms/FileUploadZone"

interface BusinessFormProps {
  onComplete: () => void
  organizationId: string
  defaultValues?: Partial<KybFormData>
  rejectionReasons?: Record<string, string>
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 24 : -24,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -24 : 24,
    opacity: 0,
  }),
}

const ENTITY_TYPES = ["LLC", "LTD", "Corp", "SA", "SAS", "GmbH", "BV", "Other"] as const

export function BusinessForm({
  onComplete,
  organizationId,
  defaultValues,
  rejectionReasons,
}: BusinessFormProps) {
  const t = useTranslations("Account.Onboarding")
  const [step, setStep] = React.useState(0)
  const [direction, setDirection] = React.useState(1)

  const schema = React.useMemo(
    () =>
      createKybSchema({
        required: t("errors.required"),
        tooShort: t("errors.tooShort"),
        invalidDate: t("errors.invalidDate"),
        futureDate: t("errors.futureDate"),
        usaNotPermitted: t("errors.usaNotPermitted"),
        invalidPhone: t("errors.invalidPhone"),
        mustBeAdult: t("errors.mustBeAdult"),
      }),
    [t]
  )

  const form = useForm<KybFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      legalName: defaultValues?.legalName ?? "",
      entityType: defaultValues?.entityType ?? undefined,
      incorporationDate: defaultValues?.incorporationDate ?? "",
      registrationNumber: defaultValues?.registrationNumber ?? "",
      countryOfIncorporation: defaultValues?.countryOfIncorporation ?? "",
      street: defaultValues?.street ?? "",
      city: defaultValues?.city ?? "",
      state: defaultValues?.state ?? "",
      postalCode: defaultValues?.postalCode ?? "",
      country: defaultValues?.country ?? "",
      uboFirstName: defaultValues?.uboFirstName ?? "",
      uboLastName: defaultValues?.uboLastName ?? "",
      uboDob: defaultValues?.uboDob ?? "",
      uboDocumentType: defaultValues?.uboDocumentType ?? undefined,
      uboDocumentNumber: defaultValues?.uboDocumentNumber ?? "",
      uboDocumentCountry: defaultValues?.uboDocumentCountry ?? "",
      uboAddress: defaultValues?.uboAddress ?? "",
      incorporationDocUrl: defaultValues?.incorporationDocUrl ?? "",
      uboIdFrontUrl: defaultValues?.uboIdFrontUrl ?? "",
      uboIdBackUrl: defaultValues?.uboIdBackUrl ?? "",
      uboPoaUrl: defaultValues?.uboPoaUrl ?? "",
    },
    mode: "onTouched",
  })

  const {
    register,
    control,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  async function goNext() {
    const fields = KYB_STEPS[step] as (keyof KybFormData)[]
    const valid = await trigger(fields)
    if (!valid) return
    setDirection(1)
    setStep((s) => s + 1)
  }

  function goPrev() {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  async function onSubmit(data: KybFormData) {
    const result = await submitComplianceData(data, "business", organizationId)

    if (result.success) {
      toast.success(t("successToastTitle"), {
        description: t("successToastDesc"),
      })
      onComplete()
    } else {
      toast.error(t("errorToastTitle"), {
        description: result.error,
      })
    }
  }

  const stepLabels = [
    t("steps.kyb.step1"),
    t("steps.kyb.step2"),
    t("steps.kyb.step3"),
    t("steps.kyb.step4"),
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {rejectionReasons && Object.keys(rejectionReasons).length > 0 && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-foreground">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold">{t("rejection.actionRequired")}</h4>
            <ul className="text-sm list-disc pl-4 space-y-1">
              {Object.entries(rejectionReasons).map(([field, reason]) => (
                <li key={field}>
                  <span className="font-medium capitalize">{field}:</span> {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <StepIndicator
        steps={stepLabels}
        currentStep={step}
        className="mb-10 px-2"
      />

      {/* Step Panels */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {step === 0 && (
            <div className="space-y-5">
              <FormField
                label={t("legalName")}
                error={errors.legalName?.message}
                required
              >
                <Input
                  {...register("legalName")}
                  placeholder={t("placeholders.business.legalName")}
                  aria-invalid={!!errors.legalName}
                />
              </FormField>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label={t("entityType")}
                  error={errors.entityType?.message}
                  required
                >
                  <Controller
                    name="entityType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={!!errors.entityType}>
                          <SelectValue placeholder={t("selectEntityType")} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {ENTITY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(
                                type.toLowerCase() as
                                  | "llc"
                                  | "ltd"
                                  | "corp"
                                  | "sa"
                                  | "sas"
                                  | "gmbh"
                                  | "bv"
                                  | "other"
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField
                  label={t("incorporationDate")}
                  error={errors.incorporationDate?.message}
                  required
                >
                  <Controller
                    name="incorporationDate"
                    control={control}
                    render={({ field }) => (
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t("selectDate")}
                        fromYear={1800}
                        aria-invalid={!!errors.incorporationDate}
                      />
                    )}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label={t("registrationNumber")}
                  error={errors.registrationNumber?.message}
                  required
                >
                  <Input
                    {...register("registrationNumber")}
                    placeholder={t("placeholders.business.registrationNumber")}
                    aria-invalid={!!errors.registrationNumber}
                  />
                </FormField>
                <FormField
                  label={t("countryOfIncorporation")}
                  error={errors.countryOfIncorporation?.message}
                  required
                >
                  <Controller
                    name="countryOfIncorporation"
                    control={control}
                    render={({ field }) => (
                      <CountrySelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t("selectCountry")}
                        aria-invalid={!!errors.countryOfIncorporation}
                      />
                    )}
                  />
                </FormField>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <FormField
                label={t("street")}
                error={errors.street?.message}
                required
              >
                <Input
                  {...register("street")}
                  placeholder={t("placeholders.business.street")}
                  aria-invalid={!!errors.street}
                />
              </FormField>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label={t("city")}
                  error={errors.city?.message}
                  required
                >
                  <Input
                    {...register("city")}
                    placeholder={t("placeholders.business.city")}
                    aria-invalid={!!errors.city}
                  />
                </FormField>
                <FormField
                  label={t("stateProvince")}
                  error={errors.state?.message}
                  required
                >
                  <Input
                    {...register("state")}
                    placeholder={t("placeholders.business.stateProvince")}
                    aria-invalid={!!errors.state}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label={t("postalCode")}
                  error={errors.postalCode?.message}
                  required
                >
                  <Input
                    {...register("postalCode")}
                    placeholder={t("placeholders.business.postalCode")}
                    aria-invalid={!!errors.postalCode}
                  />
                </FormField>
                <FormField
                  label={t("country")}
                  error={errors.country?.message}
                  required
                >
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <CountrySelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t("selectCountry")}
                        aria-invalid={!!errors.country}
                      />
                    )}
                  />
                </FormField>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("uboSectionLabel")}
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label={t("uboFirstName")}
                  error={errors.uboFirstName?.message}
                  required
                >
                  <Input
                    {...register("uboFirstName")}
                    placeholder={t("placeholders.business.uboFirstName")}
                    aria-invalid={!!errors.uboFirstName}
                  />
                </FormField>
                <FormField
                  label={t("uboLastName")}
                  error={errors.uboLastName?.message}
                  required
                >
                  <Input
                    {...register("uboLastName")}
                    placeholder={t("placeholders.business.uboLastName")}
                    aria-invalid={!!errors.uboLastName}
                  />
                </FormField>
              </div>
              <FormField
                label={t("uboDob")}
                error={errors.uboDob?.message}
                required
              >
                <Controller
                  name="uboDob"
                  control={control}
                  render={({ field }) => (
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("selectDate")}
                      aria-invalid={!!errors.uboDob}
                    />
                  )}
                />
              </FormField>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label={t("uboDocumentType")}
                  error={errors.uboDocumentType?.message}
                  required
                >
                  <Controller
                    name="uboDocumentType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={!!errors.uboDocumentType}>
                          <SelectValue placeholder={t("selectDocumentType")} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="passport">{t("passport")}</SelectItem>
                          <SelectItem value="nationalId">{t("nationalId")}</SelectItem>
                          <SelectItem value="driversLicense">{t("driversLicense")}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField
                  label={t("uboDocumentNumber")}
                  error={errors.uboDocumentNumber?.message}
                  required
                >
                  <Input
                    {...register("uboDocumentNumber")}
                    placeholder={t("placeholders.shared.documentNumber")}
                    aria-invalid={!!errors.uboDocumentNumber}
                  />
                </FormField>
              </div>
              <FormField
                label={t("uboDocumentCountry")}
                error={errors.uboDocumentCountry?.message}
                required
              >
                <Controller
                  name="uboDocumentCountry"
                  control={control}
                  render={({ field }) => (
                    <CountrySelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t("selectCountry")}
                      aria-invalid={!!errors.uboDocumentCountry}
                    />
                  )}
                />
              </FormField>
              <FormField
                label={t("uboAddress")}
                error={errors.uboAddress?.message}
                required
              >
                <Input
                  {...register("uboAddress")}
                  placeholder={t("placeholders.business.uboAddress")}
                  aria-invalid={!!errors.uboAddress}
                />
              </FormField>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <Controller
                name="incorporationDocUrl"
                control={control}
                render={({ field }) => (
                  <FileUploadZone
                    name="incorporationDocUrl"
                    label={t("documents.incorporationDoc")}
                    hint={t("documents.incorporationDocHint")}
                    value={field.value}
                    onChange={field.onChange}
                    organizationId={organizationId}
                    documentType="incorporation_doc"
                  />
                )}
              />
              {errors.incorporationDocUrl && (
                <p className="text-xs font-medium text-destructive">{errors.incorporationDocUrl.message}</p>
              )}

              <Controller
                name="uboIdFrontUrl"
                control={control}
                render={({ field }) => (
                  <FileUploadZone
                    name="uboIdFrontUrl"
                    label={t("documents.uboIdFront")}
                    hint={t("documents.uboIdFrontHint")}
                    value={field.value}
                    onChange={field.onChange}
                    organizationId={organizationId}
                    documentType="ubo_id_front"
                  />
                )}
              />
              {errors.uboIdFrontUrl && (
                <p className="text-xs font-medium text-destructive">{errors.uboIdFrontUrl.message}</p>
              )}

              <Controller
                name="uboIdBackUrl"
                control={control}
                render={({ field }) => (
                  <FileUploadZone
                    name="uboIdBackUrl"
                    label={t("documents.uboIdBack")}
                    hint={t("documents.uboIdBackHint")}
                    value={field.value}
                    onChange={field.onChange}
                    organizationId={organizationId}
                    documentType="ubo_id_back"
                  />
                )}
              />

              <Controller
                name="uboPoaUrl"
                control={control}
                render={({ field }) => (
                  <FileUploadZone
                    name="uboPoaUrl"
                    label={t("documents.uboPoa")}
                    hint={t("documents.uboPoaHint")}
                    value={field.value}
                    onChange={field.onChange}
                    organizationId={organizationId}
                    documentType="ubo_poa"
                  />
                )}
              />
              {errors.uboPoaUrl && (
                <p className="text-xs font-medium text-destructive">{errors.uboPoaUrl.message}</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between gap-4">
        {step > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={goPrev}
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            {t("previous")}
          </Button>
        ) : (
          <span />
        )}

        {step < KYB_STEPS.length - 1 ? (
          <Button
            type="button"
            className="min-w-[140px]"
            onClick={goNext}
          >
            {t("nextStep")}
          </Button>
        ) : (
          <Button
            type="submit"
            className="min-w-[200px] gap-2"
            disabled={isSubmitting}
          >
            <Send size={14} strokeWidth={1.5} />
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        )}
      </div>
    </form>
  )
}
