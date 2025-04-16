'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Clock, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface TaskDetailsDialogProps {
  task: {
    id: number
    title: string
    description: string | null
    date: Date
    startTime: Date
    endTime: Date | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailsDialog({ task, open, onOpenChange }: TaskDetailsDialogProps) {
  if (!task) return null

  const startTime = new Date(task.startTime)
  const endTime = task.endTime ? new Date(task.endTime) : null
  const duration = endTime 
    ? Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    : 0
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(new Date(task.date), 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              {format(startTime, 'h:mm a')} - {endTime ? format(endTime, 'h:mm a') : 'In Progress'}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <FileText className="h-4 w-4 mr-2" />
            <span>Duration: {hours}h {minutes}m</span>
          </div>
          {task.description && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{task.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 