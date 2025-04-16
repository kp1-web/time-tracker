import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardClient from './DashboardClient'
import jwt from 'jsonwebtoken'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')

  if (!session) {
    redirect('/login')
  }

  // Decode the JWT token to get the user ID
  const decoded = jwt.verify(session.value, process.env.JWT_SECRET!) as { userId: number }
  const userId = decoded.userId

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
  })

  return <DashboardClient tasks={tasks} user={user} />
} 