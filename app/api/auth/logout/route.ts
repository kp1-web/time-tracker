import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  )
  
  // Clear the session cookie
  response.cookies.delete('session')

  return response
} 