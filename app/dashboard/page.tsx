import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardClient from './DashboardClient'
import jwt from 'jsonwebtoken'

const ITEMS_PER_PAGE = 10

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage({
  searchParams,
}: PageProps) {
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

  // Get current page from query params or default to 1
  const params = await searchParams
  const page = params?.page
  const currentPage = Number(Array.isArray(page) ? page[0] : page) || 1
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Get total count for pagination
  const totalTasks = await prisma.task.count({
    where: { userId: user.id }
  })

  const totalPages = Math.ceil(totalTasks / ITEMS_PER_PAGE)

  // Get paginated tasks
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    skip,
    take: ITEMS_PER_PAGE,
  })

  return <DashboardClient 
    tasks={tasks} 
    user={user} 
    pagination={{
      currentPage,
      totalPages,
      totalTasks
    }}
  />
} 