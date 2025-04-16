import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  jobType: z.string(),
  date: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),
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
    const { title, description, jobType, date, startTime, endTime, deadline } = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        title,
        description,
        jobType,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        deadline: deadline ? new Date(deadline) : null,
        userId: user.id,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Task creation error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
} 