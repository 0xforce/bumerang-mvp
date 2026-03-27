"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@/lib/zod-resolver"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ShieldCheck, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react"
import { counterpartySchema, type CounterpartyPayload } from "@/lib/validations/counterparties"
import { addCounterparty } from "@/actions/counterparties"
import { COUNTRIES } from "@/lib/data/countries"

// Fields validated at each step before advancing
const STEP_FIELDS: Array<(keyof CounterpartyPayload)[]> = [
  ["name", "jurisdiction", "business_address"],
  ["bank_name", "bank_address", "account_beneficiary_name", "account_number", "routing_number"],
  [],
]

interface AddCounterpartyDialogProps {
  children: React.ReactNode
  organizationId: string
}

export function AddCounterpartyDialog({ children, organizationId }: AddCounterpartyDialogProps) {
  const t = useTranslations("Counterparties.modal")
  const [isOpen, setIsOpen] = React.useState(false)
  const [step, setStep] = React.useState(1)

  const form = useForm<CounterpartyPayload>({
    resolver: zodResolver(counterpartySchema),
    defaultValues: {
      name: "",
      jurisdiction: "",
      business_registration_number: "",
      business_address: "",
      business_website: "",
      bank_name: "",
      bank_address: "",
      account_beneficiary_name: "",
      account_number: "",
      routing_number: "",
      swift_code: "",
      phone_number: "",
      email: "",
    },
  })

  const { register, handleSubmit, trigger, setValue, watch, formState: { errors, isSubmitting } } = form

  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1)
        form.reset()
      }, 300)
    }
  }, [isOpen, form])

  const handleNext = async () => {
    const fields = STEP_FIELDS[step - 1]
    const valid = fields.length === 0 || await trigger(fields)
    if (valid) setStep((s) => Math.min(s + 1, 3))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 1))

  const onSubmit = async (data: CounterpartyPayload) => {
    const result = await addCounterparty(data, organizationId)
    if (result.success) {
      toast.success(t("successToast"))
      setIsOpen(false)
    } else {
      toast.error(t("errorToast"), { description: result.error })
    }
  }

  const fieldError = (name: keyof CounterpartyPayload) =>
    errors[name]?.message ? (
      <p className="mt-1 text-xs text-destructive">{errors[name]?.message}</p>
    ) : null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-0 bg-card p-0 shadow-ambient sm:max-w-2xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="border-b border-border/40 px-8 py-6 shrink-0 bg-card z-10">
          <DialogTitle className="font-display text-2xl tracking-wide text-foreground flex items-center gap-3">
            {t("title")}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {t("description")}
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                      step === i ? "bg-card text-foreground" : "bg-secondary text-muted-foreground",
                    )}
                    style={
                      step > i
                        ? {
                            backgroundColor: "var(--badge-success-bg)",
                            color: "var(--badge-success-fg)",
                          }
                        : undefined
                    }
                  >
                    {step > i ? <Check size={12} strokeWidth={3} /> : i}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-widest hidden sm:block",
                      step === i ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {i === 1 ? t("steps.business") : i === 2 ? t("steps.bank") : t("steps.contact")}
                  </span>
                </div>
                {i < 3 && <div className="h-px w-8 bg-border/60 mx-2" />}
              </React.Fragment>
            ))}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-8 relative">
            <AnimatePresence mode="wait" initial={false}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("fields.businessName")} <span className="text-orange">*</span>
                    </label>
                    <Input
                      placeholder={t("fields.businessNamePlaceholder")}
                      className="rounded-2xl"
                      {...register("name")}
                      aria-invalid={!!errors.name}
                    />
                    {fieldError("name")}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("fields.jurisdiction")} <span className="text-orange">*</span>
                    </label>
                    <Select
                      value={watch("jurisdiction")}
                      onValueChange={(v) => setValue("jurisdiction", v, { shouldValidate: true })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("fields.selectJurisdiction")} />
                      </SelectTrigger>
                      <SelectContent className="border-0 bg-card max-h-64 rounded-2xl">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldError("jurisdiction")}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("fields.registrationNumber")}
                    </label>
                    <Input
                      placeholder={t("fields.registrationNumberPlaceholder")}
                      className="rounded-2xl"
                      {...register("business_registration_number")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("fields.businessAddress")} <span className="text-orange">*</span>
                    </label>
                    <Input
                      placeholder={t("fields.businessAddressPlaceholder")}
                      className="rounded-2xl"
                      {...register("business_address")}
                      aria-invalid={!!errors.business_address}
                    />
                    {fieldError("business_address")}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {t("fields.website")}
                      </label>
                      <span className="text-[10px] text-muted-foreground/60">{t("fields.optional")}</span>
                    </div>
                    <Input
                      type="url"
                      placeholder={t("fields.websitePlaceholder")}
                      className="rounded-2xl"
                      {...register("business_website")}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("fields.bankName")} <span className="text-orange">*</span>
                    </label>
                    <Input
                      placeholder={t("fields.bankNamePlaceholder")}
                      className="rounded-2xl"
                      {...register("bank_name")}
                      aria-invalid={!!errors.bank_name}
                    />
                    {fieldError("bank_name")}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("fields.bankAddress")} <span className="text-orange">*</span>
                    </label>
                    <Input
                      placeholder={t("fields.bankAddressPlaceholder")}
                      className="rounded-2xl"
                      {...register("bank_address")}
                      aria-invalid={!!errors.bank_address}
                    />
                    {fieldError("bank_address")}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("fields.beneficiary")} <span className="text-orange">*</span>
                    </label>
                    <Input
                      placeholder={t("fields.beneficiaryPlaceholder")}
                      className="rounded-2xl"
                      {...register("account_beneficiary_name")}
                      aria-invalid={!!errors.account_beneficiary_name}
                    />
                    {fieldError("account_beneficiary_name")}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {t("fields.accountNumber")} <span className="text-orange">*</span>
                      </label>
                      <Input
                        placeholder={t("fields.accountNumberPlaceholder")}
                        className="rounded-2xl"
                        {...register("account_number")}
                        aria-invalid={!!errors.account_number}
                      />
                      {fieldError("account_number")}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {t("fields.routingNumber")} <span className="text-orange">*</span>
                      </label>
                      <Input
                        placeholder={t("fields.routingNumberPlaceholder")}
                        maxLength={9}
                        className="rounded-2xl"
                        {...register("routing_number")}
                        aria-invalid={!!errors.routing_number}
                      />
                      {fieldError("routing_number")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("fields.swift")}
                    </label>
                    <Input
                      placeholder={t("fields.swiftPlaceholder")}
                      className="rounded-2xl"
                      {...register("swift_code")}
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div
                    className="rounded-2xl p-4 flex gap-3 items-start"
                    style={{
                      backgroundColor: "var(--badge-processing-bg)",
                      color: "var(--badge-processing-fg)",
                    }}
                  >
                    <ShieldCheck size={20} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{t("fields.euroWarning")}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("fields.phone")}
                    </label>
                    <Input
                      type="tel"
                      placeholder={t("fields.phonePlaceholder")}
                      className="rounded-2xl"
                      {...register("phone_number")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("fields.email")}
                    </label>
                    <Input
                      type="email"
                      placeholder={t("fields.emailPlaceholder")}
                      className="rounded-2xl"
                      {...register("email")}
                      aria-invalid={!!errors.email}
                    />
                    {fieldError("email")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Footer */}
          <div className="border-t border-border/40 bg-card px-8 py-6 shrink-0 flex items-center justify-between gap-4">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="rounded-full px-6 shadow-ambient hover:bg-secondary hover:text-foreground border-0 bg-secondary/50"
              >
                <ArrowLeft size={16} className="mr-2" />
                {t("actions.back")}
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                type="button"
                className="rounded-full px-8 shadow-ambient"
                onClick={handleNext}
              >
                {t("actions.next")}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full px-8 shadow-ambient"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    {t("actions.submitting")}
                  </>
                ) : (
                  t("actions.submit")
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
