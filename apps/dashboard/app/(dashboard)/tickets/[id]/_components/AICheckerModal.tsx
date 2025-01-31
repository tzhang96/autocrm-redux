'use client'

import React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle } from 'lucide-react'

interface AICheckerModalProps {
  isOpen: boolean
  onClose: () => void
  feedback: {
    isValid: boolean
    message: string
  } | null
}

export function AICheckerModal({ isOpen, onClose, feedback }: AICheckerModalProps) {
  if (!feedback) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[425px] p-6",
        feedback.isValid ? "bg-green-50" : "bg-red-50"
      )}>
        <div className="flex items-start gap-4">
          {feedback.isValid ? (
            <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600 mt-1" />
          )}
          <div className="flex-1">
            <h3 className={cn(
              "text-lg font-semibold mb-2",
              feedback.isValid ? "text-green-800" : "text-red-800"
            )}>
              {feedback.isValid ? "Message Looks Good!" : "Message Needs Review"}
            </h3>
            <div className={cn(
              "text-sm whitespace-pre-wrap",
              feedback.isValid ? "text-green-700" : "text-red-700"
            )}>
              {feedback.message}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 