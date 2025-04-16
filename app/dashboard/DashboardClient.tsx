'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NewTaskDialog } from '@/components/tasks/NewTaskDialog'
import { GenerateReportButton } from '@/components/tasks/GenerateReportButton'
import { TaskDetailsDialog } from '@/components/tasks/TaskDetailsDialog'
import { Clock, FileText, Calendar, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { format, isSameDay } from 'date-fns'
import { Button } from '@/components/ui/button'

interface Task {
  id: number
  title: string
  description: string | null
  date: Date
  startTime: Date
  endTime: Date | null
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalTasks: number
}

export default function DashboardClient({ 
  tasks, 
  user, 
  pagination 
}: { 
  tasks: Task[], 
  user: any,
  pagination: PaginationProps
}) {
  const router = useRouter()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Calculate total time spent
  const totalTime = tasks.reduce((total: number, task: Task) => {
    const start = new Date(task.startTime)
    const end = new Date(task.endTime || task.startTime)
    return total + (end.getTime() - start.getTime())
  }, 0)

  const totalHours = Math.floor(totalTime / (1000 * 60 * 60))
  const totalMinutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60))

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Force a hard refresh to clear any client-side state
        window.location.href = '/login'
      } else {
        toast.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed')
    }
  }

  // Group tasks by date
  const groupedTasks = tasks.reduce((groups: { [key: string]: Task[] }, task) => {
    const date = format(new Date(task.date), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(task)
    return groups
  }, {})

  const handlePageChange = (page: number) => {
    router.push(`/dashboard?page=${page}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name || user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Time Tracked</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalHours}h {totalMinutes}m
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Average Time</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tasks.length > 0 ? Math.floor(totalTime / (tasks.length * 1000 * 60)) : 0}m
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Recent Time Entries</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {Object.entries(groupedTasks).map(([date, dayTasks]) => (
                  <div key={date} className="bg-gray-50 px-6 py-3">
                    <h3 className="text-sm font-medium text-gray-600">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="divide-y divide-gray-100">
                      {dayTasks.map((task: Task) => (
                        <div key={task.id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{task.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                              <div className="flex items-center mt-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                {format(new Date(task.startTime), 'h:mm a')}
                                {task.endTime && ` - ${format(new Date(task.endTime), 'h:mm a')}`}
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedTask(task)
                                setIsDetailsOpen(true)
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No time entries yet. Start tracking your time!
                  </div>
                )}
              </div>
              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="flex flex-col gap-4">
                <NewTaskDialog />
                <GenerateReportButton />
              </div>
            </div>
          </div>
        </div>

        <TaskDetailsDialog 
          task={selectedTask} 
          open={isDetailsOpen} 
          onOpenChange={setIsDetailsOpen} 
        />
      </div>
    </div>
  )
} 