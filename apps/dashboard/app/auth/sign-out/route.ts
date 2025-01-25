'use server'

import { handleLogout } from '../actions'

export async function POST() {
  await handleLogout()
} 