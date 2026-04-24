import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ['/', '/api/chat', '/contracts']
})

export const config = {
  matcher: ['/((?!.+\\.[\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
