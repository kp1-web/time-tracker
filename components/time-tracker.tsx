"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Download, Plus } from "lucide-react"
import { format } from "date-fns"
import JobCard from "@/components/job-card"
import JobDetailsDialog from "@/components/job-details-dialog"
import { generatePDF } from "@/lib/pdf-generator"

// Sample job data - in a real app, this would come from an API
const availableJobs = [
  {
    id: "job1",
    title: "Website Development",
    description: "Developing a new company website",
    client: "Acme Corp",
    deadline: "2025-05-15",
  },
  {
    id: "job2",
    title: "Mobile App Design",
    description: "UI/UX design for mobile application",
    client: "TechStart Inc",
    deadline: "2025-04-30",
  },
  {
    id: "job3",
    title: "Database Migration",
    description: "Migrating legacy database to new system",
    client: "DataFlow Systems",
    deadline: "2025-06-10",
  },
  {
    id: "job4",
    title: "Network Security Audit",
    description: "Performing security assessment of network infrastructure",
    client: "SecureNet",
    deadline: "2025-05-20",
  },
  {
    id: "job5",
    title: "Content Creation",
    description: "Creating marketing content for social media",
    client: "BrandBoost",
    deadline: "2025-04-25",
  },
]

export default function TimeTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedJob, setSelectedJob] = useState<string>("")
  const [hours, setHours] = useState<string>("0")
  const [minutes, setMinutes] = useState<string>("0")
  const [trackedJobs, setTrackedJobs] = useState<any[]>([])
  const [selectedJobDetails, setSelectedJobDetails] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [jobDetails, setJobDetails] = useState<string>("")

  // Load tracked jobs from localStorage on component mount
  useEffect(() => {
    const savedJobs = localStorage.getItem("trackedJobs")
    if (savedJobs) {
      setTrackedJobs(JSON.parse(savedJobs))
    }
  }, [])

  // Save tracked jobs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("trackedJobs", JSON.stringify(trackedJobs))
  }, [trackedJobs])

  const handleAddTime = () => {
    if (!selectedJob || (Number(hours) === 0 && Number(minutes) === 0)) {
      return
    }

    const jobDetailsObj = availableJobs.find((job) => job.id === selectedJob)
    if (!jobDetailsObj) return

    const formattedDate = format(selectedDate, "yyyy-MM-dd")
    const timeSpent = {
      hours: Number(hours),
      minutes: Number(minutes),
      totalMinutes: Number(hours) * 60 + Number(minutes),
    }

    const timeEntry = {
      time: timeSpent,
      details: jobDetails.trim(),
      timestamp: new Date().toISOString(),
    }

    // Check if we already have this job for this date
    const existingJobIndex = trackedJobs.findIndex((job) => job.id === selectedJob && job.date === formattedDate)

    if (existingJobIndex >= 0) {
      // Update existing job time
      const updatedJobs = [...trackedJobs]
      const existingJob = updatedJobs[existingJobIndex]

      existingJob.timeEntries.push({
        time: timeSpent,
        details: jobDetails.trim(),
        timestamp: new Date().toISOString(),
      })

      // Recalculate total time
      existingJob.totalTime = existingJob.timeEntries.reduce(
        (total: number, entry: any) => total + entry.time.totalMinutes,
        0,
      )

      setTrackedJobs(updatedJobs)
    } else {
      // Add new job entry
      setTrackedJobs([
        ...trackedJobs,
        {
          id: selectedJob,
          date: formattedDate,
          title: jobDetailsObj.title,
          client: jobDetailsObj.client,
          description: jobDetailsObj.description,
          deadline: jobDetailsObj.deadline,
          timeEntries: [
            {
              time: timeSpent,
              details: jobDetails.trim(),
              timestamp: new Date().toISOString(),
            },
          ],
          totalTime: timeSpent.totalMinutes,
        },
      ])
    }

    // Reset form
    setHours("0")
    setMinutes("0")
    setJobDetails("")
  }

  const handleViewDetails = (job: any) => {
    setSelectedJobDetails(job)
    setIsDetailsOpen(true)
  }

  const handleGenerateReport = () => {
    generatePDF(trackedJobs, selectedDate)
  }

  // Filter jobs for the selected date
  const jobsForSelectedDate = trackedJobs.filter((job) => job.date === format(selectedDate, "yyyy-MM-dd"))

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="ai-card overflow-hidden">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-primary">Select Date</h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-4 mt-6">
              <h2 className="text-xl font-semibold text-primary">Add Time Entry</h2>

              <div className="space-y-2">
                <Label htmlFor="job-select">Select Job</Label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger id="job-select">
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input id="hours" type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minutes">Minutes</Label>
                  <Input
                    id="minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="job-details">Work Details</Label>
                <textarea
                  id="job-details"
                  value={jobDetails}
                  onChange={(e) => setJobDetails(e.target.value)}
                  placeholder="Describe what you did..."
                  className="w-full min-h-[80px] p-2 bg-black/5 border border-primary/20 rounded-md focus:border-primary/50 focus:ring-1 focus:ring-primary/30 text-sm resize-y"
                />
              </div>

              <Button
                onClick={handleAddTime}
                className="w-full bg-primary/90 hover:bg-primary transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Time
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">Reports</h2>
            <Button
              onClick={handleGenerateReport}
              className="w-full bg-primary/80 hover:bg-primary transition-all duration-300"
            >
              <Download className="mr-2 h-4 w-4" /> Generate PDF Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold mb-4 text-primary">
          Time Entries for {format(selectedDate, "MMMM d, yyyy")}
        </h2>

        {jobsForSelectedDate.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {jobsForSelectedDate.map((job) => (
              <JobCard key={`${job.id}-${job.date}`} job={job} onViewDetails={() => handleViewDetails(job)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-black/10 backdrop-blur-sm rounded-lg border border-primary/20">
            <Clock className="mx-auto h-12 w-12 text-primary/60 ai-pulse" />
            <h3 className="mt-4 text-lg font-medium">No time entries</h3>
            <p className="mt-2 text-sm text-muted-foreground">Select a job and add time to get started.</p>
          </div>
        )}
      </div>

      <JobDetailsDialog job={selectedJobDetails} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
    </div>
  )
}
