import { format } from "date-fns"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export const generatePDF = (trackedJobs: any[], selectedDate: Date) => {
  // Create a new PDF document
  const doc = new jsPDF()

  // Add title
  const title = `Time Tracking Report - ${format(selectedDate, "MMMM yyyy")}`
  doc.setFontSize(20)
  doc.text(title, 14, 22)

  // Add generation date
  doc.setFontSize(10)
  doc.text(`Generated on: ${format(new Date(), "MMMM d, yyyy, h:mm a")}`, 14, 30)

  // Group jobs by date
  const jobsByDate: Record<string, any[]> = {}

  trackedJobs.forEach((job) => {
    if (!jobsByDate[job.date]) {
      jobsByDate[job.date] = []
    }
    jobsByDate[job.date].push(job)
  })

  // Sort dates
  const sortedDates = Object.keys(jobsByDate).sort()

  // Add functions to format job details for PDF
  const formatJobDetails = (job: any) => {
    const detailsText = job.timeEntries
      .filter((entry: any) => entry.details && entry.details.trim())
      .map((entry: any) => {
        const hours = Math.floor(entry.time.totalMinutes / 60)
        const minutes = entry.time.totalMinutes % 60
        return `[${hours}h ${minutes}m] ${entry.details}`
      })
      .join("\n\n")

    return detailsText || "No details provided"
  }

  let yPosition = 40

  // For each date, create a table of jobs
  sortedDates.forEach((date) => {
    const jobs = jobsByDate[date]
    const formattedDate = format(new Date(date), "MMMM d, yyyy")

    // Add date header
    doc.setFontSize(14)
    doc.text(formattedDate, 14, yPosition)
    yPosition += 10

    // Prepare table data
    const tableData = jobs.map((job) => {
      const hours = Math.floor(job.totalTime / 60)
      const minutes = job.totalTime % 60
      return [job.title, job.client, `${hours}h ${minutes}m`]
    })

    // Add table
    autoTable(doc, {
      startY: yPosition,
      head: [["Job", "Client", "Time Spent"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [66, 66, 66] },
      margin: { left: 14, right: 14 },
    })

    // Update Y position for next table
    yPosition = (doc as any).lastAutoTable.finalY + 10

    // Add job details section
    for (const job of jobs) {
      // Check if there's enough space for details, otherwise add new page
      if (yPosition > 240) {
        doc.addPage()
        yPosition = 20
      }

      if (job.timeEntries.some((entry: any) => entry.details && entry.details.trim())) {
        doc.setFontSize(12)
        doc.text(`Details for ${job.title}:`, 14, yPosition)
        yPosition += 6

        doc.setFontSize(10)
        const detailsText = formatJobDetails(job)

        // Use splitTextToSize to handle line breaks and long text
        const splitText = doc.splitTextToSize(detailsText, 180)
        doc.text(splitText, 14, yPosition)
        yPosition += splitText.length * 5 + 10
      }
    }

    // Add page if needed
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }
  })

  // Calculate total time across all jobs
  const totalMinutes = trackedJobs.reduce((total, job) => total + job.totalTime, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  // Add summary
  doc.setFontSize(14)
  doc.text("Summary", 14, yPosition)
  yPosition += 10

  autoTable(doc, {
    startY: yPosition,
    head: [["Total Jobs", "Total Days", "Total Time"]],
    body: [[trackedJobs.length.toString(), sortedDates.length.toString(), `${totalHours}h ${remainingMinutes}m`]],
    theme: "grid",
    headStyles: { fillColor: [66, 66, 66] },
    margin: { left: 14, right: 14 },
  })

  // Save the PDF
  doc.save(`time-report-${format(selectedDate, "yyyy-MM")}.pdf`)
}
