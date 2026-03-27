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
  createKycSchema,
  type KycFormData,
  KYC_STEPS,
} from "@/lib/validations/compliance"
import { AlertCircle, ChevronLeft, Send } from "lucide-react"

import { submitComplianceData } from "@/actions/compliance"
import { toast } from "sonner"
import { FileUploadZone } from "@/components/forms/FileUploadZone"

interface IndividualFormProps {
  onComplete: () => void
  organizationId: string
  defaultValues?: Partial<KycFormData>
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

export function IndividualForm({
  onComplete,
  organizationId,
  defaultValues,
  rejectionReasons,
}: IndividualFormProps) {
  const t = useTranslations("Account.Onboarding")
  const [step, setStep] = React.useState(0)
  const [direction, setDirection] = React.useState(1)

  const schema = React.useMemo(
    () =>
      createKycSchema({
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

  const form = useForm<KycFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      dob: defaultValues?.dob ?? "",
      phone: defaultValues?.phone ?? "",
      nationality: defaultValues?.nationality ?? "",
      street: defaultValues?.street ?? "",
      city: defaultValues?.city ?? "",
      state: defaultValues?.state ?? "",
      postalCode: defaultValues?.postalCode ?? "",
      country: defaultValues?.country ?? "",
      documentType: defaultValues?.documentType ?? undefined,
      documentNumber: defaultValues?.documentNumber ?? "",
      documentCountry: defaultValues?.documentCountry ?? "",
      idFrontUrl: defaultValues?.idFrontUrl ?? "",
      idBackUrl: defaultValues?.idBackUrl ?? "",
      poaUrl: defaultValues?.poaUrl ?? "",
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
    const fields = KYC_STEPS[step] as (keyof KycFormData)[]
    const valid = await trigger(fields)
    if (!valid) return
    setDirection(1)
    setStep((s) => s + 1)
  }

  function goPrev() {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  async function onSubmit(data: KycFormData) {
    const result = await submitComplianceData(data, "individual", organizationId)

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
    t("steps.kyc.step1"),
    t("steps.kyc.step2"),
    t("steps.kyc.step3"),
    t("steps.kyc.step4"),
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label={t("firstName")}
                  error={errors.firstName?.message}
                  required
                >
                  <Input
                    {...register("firstName")}
                    placeholder={t("placeholders.individual.firstName")}
                    aria-invalid={!!errors.firstName}
                  />
                </FormField>
                <FormField
                  label={t("lastName")}
                  error={errors.lastName?.message}
                  required
                >
                  <Input
                    {...register("lastName")}
                    placeholder={t("placeholders.individual.lastName")}
                    aria-invalid={!!errors.lastName}
                  />
                </FormField>
              </div>
              <FormField
                label={t("dob")}
                error={errors.dob?.message}
                required
              >
                <Controller
                  name="dob"
                  control={control}
                  render={({ field }) => (
                    <DatePickerInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("selectDate")}
                      aria-invalid={!!errors.dob}
                    />
                  )}
                />
              </FormField>
              <FormField
                label={t("phone")}
                error={errors.phone?.message}
                hint={t("phoneHint")}
                required
              >
                <Input
                  {...register("phone")}
                  type="tel"
                  placeholder={t("placeholders.individual.phone")}
                  aria-invalid={!!errors.phone}
                />
              </FormField>
              <FormField
                label={t("nationality")}
                error={errors.nationality?.message}
                required
              >
                <Controller
                  name="nationality"
                  control={control}
                  render={({ field }) => (
                    <CountrySelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t("selectCountry")}
                      aria-invalid={!!errors.nationality}
                    />
                  )}
                />
              </FormField>
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
                  placeholder={t("placeholders.individual.street")}
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
                    placeholder={t("placeholders.individual.city")}
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
                    placeholder={t("placeholders.individual.stateProvince")}
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
                    placeholder={t("placeholders.individual.postalCode")}
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
              <FormField
                label={t("documentType")}
                error={errors.documentType?.message}
                required
              >
                <Controller
                  name="documentType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger aria-invalid={!!errors.documentType}>
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
                label={t("documentNumber")}
                error={errors.documentNumber?.message}
                required
              >
                <Input
                  {...register("documentNumber")}
                  placeholder={t("placeholders.shared.documentNumber")}
                  aria-invalid={!!errors.documentNumber}
                />
              </FormField>
              <FormField
                label={t("documentCountry")}
                error={errors.documentCountry?.message}
                required
              >
                <Controller
                  name="documentCountry"
                  control={control}
                  render={({ field }) => (
                    <CountrySelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t("selectCountry")}
                      aria-invalid={!!errors.documentCountry}
                    />
                  )}
                />
              </FormField>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <Controller
                name="idFrontUrl"
                control={control}
                render={({ field }) => (
                  <FileUploadZone
                    name="idFrontUrl"
                    label={t("documents.idFront")}
                    hint={t("documents.idFrontHint")}
                    value={field.value}
                    onChange={field.onChange}
                    organizationId={organizationId}
                    documentType="id_front"
                  />
                )}
              />
              {errors.idFrontUrl && (
                <p className="text-xs font-medium text-destructive">{errors.idFrontUrl.message}</p>
              )}

              <Controller
                name="idBackUrl"
                control={control}
                render={({ field }) => (
                  <FileUploadZone
                    name="idBackUrl"
                    label={t("documents.idBack")}
                    hint={t("documents.idBackHint")}
                    value={field.value}
                    onChange={field.onChange}
                    organizationId={organizationId}
                    documentType="id_back"
                  />
                )}
              />

              <Controller
                name="poaUrl"
                control={control}
                render={({ field }) => (
                  <FileUploadZone
                    name="poaUrl"
                    label={t("documents.poa")}
                    hint={t("documents.poaHint")}
                    value={field.value}
                    onChange={field.onChange}
                    organizationId={organizationId}
                    documentType="poa"
                  />
                )}
              />
              {errors.poaUrl && (
                <p className="text-xs font-medium text-destructive">{errors.poaUrl.message}</p>
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

        {step < KYC_STEPS.length - 1 ? (
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
