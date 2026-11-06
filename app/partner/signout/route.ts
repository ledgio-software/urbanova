import { signOut } from '@/auth'

// Clears a partner session whose account was removed or suspended.
export async function GET() {
  await signOut({ redirectTo: '/partner/login?ended=1' })
}
