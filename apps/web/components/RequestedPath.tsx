'use client';

import { usePathname } from 'next/navigation';

/** The URL that 404'd, for the terminal readout on the not-found page. */
export function RequestedPath() {
  const pathname = usePathname();
  return <span className="text-text-on-dark break-all">{pathname || '/'}</span>;
}
