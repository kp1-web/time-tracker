import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import jwt from 'jsonwebtoken'
import { format, startOfDay, endOfDay } from 'date-fns'

const reportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Decode the JWT token to get the user ID
    const decoded = jwt.verify(session.value, process.env.JWT_SECRET!) as { userId: number }
    const userId = decoded.userId

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { startDate, endDate } = reportSchema.parse(body)

    // Convert dates to start and end of day
    const start = startOfDay(new Date(startDate))
    const end = endOfDay(new Date(endDate))

    console.log('Querying tasks with:', {
      userId: user.id,
      startDate: start,
      endDate: end
    })

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    console.log('Found tasks:', tasks)

    // Create PDF
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Time Tracking Report', 14, 22)
    
    // Add date range
    doc.setFontSize(12)
    doc.text(`From: ${format(start, 'PPP')}`, 14, 32)
    doc.text(`To: ${format(end, 'PPP')}`, 14, 40)
    
    // Add user info
    doc.text(`User: ${user.name || user.email}`, 14, 48)
    
    // Add table
    const tableData = tasks.map(task => [
      task.title,
      task.description || 'No description',
      task.jobType,
      format(new Date(task.date), 'PPP'),
      format(new Date(task.startTime), 'p'),
      task.endTime ? format(new Date(task.endTime), 'p') : 'In Progress',
      task.status,
    ])

    // Add "No tasks found" message if there are no tasks
    if (tasks.length === 0) {
      autoTable(doc, {
        head: [['Title', 'Description', 'Job Type', 'Date', 'Start Time', 'End Time', 'Status']],
        body: [['No tasks found for the selected period', '', '', '', '', '', '']],
        startY: 60,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
      })
    } else {
      autoTable(doc, {
        head: [['Title', 'Description', 'Job Type', 'Date', 'Start Time', 'End Time', 'Status']],
        body: tableData,
        startY: 60,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        columnStyles: {
          1: { cellWidth: 40 }, // Description column
        },
      })
    }

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Return as PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="time-tracker-report.pdf"',
      },
    })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
} 