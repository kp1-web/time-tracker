import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, parseISO } from "date-fns"
import { Clock, Sparkles } from "lucide-react"

interface JobDetailsDialogProps {
  job: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function JobDetailsDialog({ job, open, onOpenChange }: JobDetailsDialogProps) {
  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-primary/20 bg-gradient-to-br from-background/70 to-background/90 backdrop-blur-lg">
        <DialogHeader className="relative">
          <div className="absolute -top-6 -right-6 text-primary/20">
            <Sparkles className="h-16 w-16" />
          </div>
          <DialogTitle className="text-primary">{job.title}</DialogTitle>
          <DialogDescription>Client: {job.client}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm font-medium text-primary/90">Description</h4>
            <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-primary/90">Deadline</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {job.deadline ? format(new Date(job.deadline), "MMMM d, yyyy") : "No deadline set"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-primary/90">Date Worked</h4>
            <p className="text-sm text-muted-foreground mt-1">{format(new Date(job.date), "MMMM d, yyyy")}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 text-primary/90">Time Entries</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {job.timeEntries.map((entry: any, index: number) => {
                const hours = Math.floor(entry.time.totalMinutes / 60)
                const minutes = entry.time.totalMinutes % 60
                return (
                  <div key={index} className="text-sm p-3 bg-primary/10 border border-primary/20 rounded-md space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary/70" />
                        <span>
                          {hours}h {minutes}m
                        </span>
                      </div>
                      <span className="text-muted-foreground">{format(parseISO(entry.timestamp), "h:mm a")}</span>
                    </div>
                    {entry.details && (
                      <div className="pt-2 mt-1 border-t border-primary/10">
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{entry.details}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-primary/20">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-primary/90">Total Time</h4>
              <div className="text-sm font-semibold bg-primary/15 px-3 py-1 rounded-full border border-primary/20">
                {Math.floor(job.totalTime / 60)}h {job.totalTime % 60}m
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
