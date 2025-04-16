'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, subDays, subMonths, subYears } from 'date-fns'

const reportPeriods = [
  { id: 'today', name: 'Today' },
  { id: 'week', name: 'This Week' },
  { id: 'month', name: 'This Month' },
  { id: 'year', name: 'This Year' },
]

export function GenerateReportButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [period, setPeriod] = useState('')

  async function generateReport() {
    if (!period) {
      toast.error('Please select a time period')
      return
    }

    setIsLoading(true)
    try {
      const now = new Date()
      let startDate: Date
      let endDate: Date = now

      switch (period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = subDays(new Date(now.setHours(0, 0, 0, 0)), 7)
          break
        case 'month':
          startDate = subMonths(new Date(now.setHours(0, 0, 0, 0)), 1)
          break
        case 'year':
          startDate = subYears(new Date(now.setHours(0, 0, 0, 0)), 1)
          break
        default:
          startDate = now
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `time-tracker-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Report generated successfully!')
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Generate Report</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Time Tracking Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Time Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                {reportPeriods.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={generateReport}
            className="w-full"
            disabled={isLoading || !period}
          >
            {isLoading ? 'Generating...' : 'Generate PDF Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 