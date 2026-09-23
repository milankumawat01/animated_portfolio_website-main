import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'
import { ConvexError } from 'convex/values'

// Email + password, locked to the single address in ADMIN_EMAIL.
// Any other address is refused at sign-up and sign-in, so no second account can
// ever be created. requireAdmin() re-checks the email on every call regardless.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email ?? '').trim().toLowerCase()
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
        if (!adminEmail || email !== adminEmail) {
          throw new ConvexError('Invalid email or password.')
        }
        return { email }
      },
      validatePasswordRequirements(password) {
        if (password.length < 10) {
          throw new ConvexError('Password must be at least 10 characters.')
        }
      },
    }),
  ],
})
