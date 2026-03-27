import type { Metadata } from "next"
import { Bebas_Neue, DM_Sans, DM_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ConfirmDialogProvider } from "@/hooks/use-confirm"

const fontDisplay = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Bumerang",
  description: "Enterprise fintech platform",
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <div className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}>
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider>
          <ConfirmDialogProvider>
            {children}
          </ConfirmDialogProvider>
          <Toaster />
        </ThemeProvider>
      </NextIntlClientProvider>
    </div>
  )
}
