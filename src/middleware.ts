import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ['/', '/api/chat', '/contracts', '/contracts-dashboard', '/api/chat-with-doc']
})

export const config = {
  matcher: ['/((?!.+\\.[\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
