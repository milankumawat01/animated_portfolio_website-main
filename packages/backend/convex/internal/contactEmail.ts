import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

// One-off: replaces the contact email in site settings (personal.email and the email card),
// since the admin panel has no field for it. Run with `npx convex run internal/contactEmail:set`.
export const set = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const settings = await ctx.db
      .query('siteSettings')
      .withIndex('by_key', (q) => q.eq('key', 'main'))
      .unique();
    if (!settings) throw new Error('siteSettings "main" not found');

    await ctx.db.patch(settings._id, {
      personal: { ...settings.personal, email },
      contactCards: settings.contactCards.map((card) =>
        card.id === 'email' ? { ...card, value: email, action: `mailto:${email}` } : card,
      ),
    });
  },
});
