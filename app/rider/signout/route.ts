import { signOut } from '@/auth'

// Clears a rider session whose account was suspended or removed.
export async function GET() {
  await signOut({ redirectTo: '/rider/login?ended=1' })
}
