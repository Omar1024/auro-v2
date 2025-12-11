"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertCircle, Info, Sparkles } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (title: any) => {
    const titleStr = String(title || '')
    if (titleStr.includes('✅') || titleStr.toLowerCase().includes('success')) {
      return <CheckCircle className="h-5 w-5 shrink-0" />
    }
    if (titleStr.includes('❌') || titleStr.toLowerCase().includes('error') || titleStr.toLowerCase().includes('failed')) {
      return <XCircle className="h-5 w-5 shrink-0" />
    }
    if (titleStr.includes('⚠️') || titleStr.toLowerCase().includes('warning')) {
      return <AlertCircle className="h-5 w-5 shrink-0" />
    }
    if (titleStr.includes('ℹ️') || titleStr.toLowerCase().includes('info')) {
      return <Info className="h-5 w-5 shrink-0" />
    }
    return <Sparkles className="h-5 w-5 shrink-0" />
  }

  const getVariant = (title: any) => {
    const titleStr = String(title || '')
    if (titleStr.includes('✅') || titleStr.toLowerCase().includes('success')) {
      return 'success'
    }
    if (titleStr.includes('❌') || titleStr.toLowerCase().includes('error') || titleStr.toLowerCase().includes('failed')) {
      return 'destructive'
    }
    if (titleStr.includes('⚠️') || titleStr.toLowerCase().includes('warning')) {
      return 'warning'
    }
    if (titleStr.includes('ℹ️') || titleStr.toLowerCase().includes('info')) {
      return 'info'
    }
    return 'default'
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const autoVariant = variant || getVariant(title)
        
        return (
          <Toast key={id} variant={autoVariant as any} {...props}>
            <div className="flex items-start gap-3 w-full">
              <div className="mt-0.5">
                {getIcon(title)}
              </div>
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}












