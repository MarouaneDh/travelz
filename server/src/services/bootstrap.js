import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

/**
 * Ensure the single curator (owner/brand) account exists, seeded from .env.
 * Runs on server start. Returns the curator user.
 */
export async function ensureCurator() {
  const username = (process.env.ADMIN_USERNAME || 'curator').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'change-me-please';
  const email = process.env.ADMIN_EMAIL || `${username}@travelz.local`;

  let curator = await User.findOne({ role: 'curator' });
  if (!curator) {
    curator = await User.create({
      username,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      displayName: process.env.ADMIN_DISPLAY_NAME || 'Travelz',
      role: 'curator',
    });
    console.log(`👑 Curator account created: @${curator.username}`);
  }
  return curator;
}

export async function getCurator() {
  return User.findOne({ role: 'curator' });
}
