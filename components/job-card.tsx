"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, FileText, Sparkles } from "lucide-react"

interface JobCardProps {
  job: {
    id: string
    title: string
    client: string
    description: string
    totalTime: number
    date: string
    timeEntries: Array<{
      time: { hours: number; minutes: number; totalMinutes: number }
      details: string
      timestamp: string
    }>
  }
  onViewDetails: () => void
}

export default function JobCard({ job, onViewDetails }: JobCardProps) {
  // Convert total minutes to hours and minutes
  const hours = Math.floor(job.totalTime / 60)
  const minutes = job.totalTime % 60

  // Format time display
  const timeDisplay = `${hours}h ${minutes}m`

  return (
    <Card className="overflow-hidden ai-card ai-glow group transition-all duration-300">
      <CardContent className="p-6 relative">
        <div className="absolute -right-3 -top-3 opacity-20 text-primary">
          <Sparkles className="h-16 w-16 rotate-12" />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-primary">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.client}</p>
            {job.timeEntries.some((entry) => entry.details) && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-primary/80 font-medium">Work Notes:</p>
                <div className="max-h-20 overflow-y-auto pr-2">
                  {job.timeEntries.map((entry, i) =>
                    entry.details ? (
                      <div key={i} className="text-xs text-muted-foreground pl-2 border-l border-primary/20 py-1">
                        <span className="opacity-70">
                          {entry.details.length > 60 ? `${entry.details.substring(0, 60)}...` : entry.details}
                        </span>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center bg-primary/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-primary border border-primary/20 transition-all duration-300 group-hover:bg-primary/20">
            <Clock className="h-4 w-4 mr-1.5" />
            <span className="text-sm font-medium">{timeDisplay}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 backdrop-blur-sm px-6 py-3 border-t border-primary/10">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="w-full bg-black/10 hover:bg-black/20 border-primary/20 text-primary hover:text-primary hover:border-primary/40 transition-all duration-300"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
