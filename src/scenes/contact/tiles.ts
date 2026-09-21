/**
 * Tile order is the order of `copy.contact.tiles`, and of the 3D glass panels.
 * The ids double as `Icon` names, because the copy happens to use one per tile.
 */
export const CONTACT_TILE_IDS = ['mail', 'linkedin', 'github', 'file'] as const

export type ContactTileId = (typeof CONTACT_TILE_IDS)[number]
