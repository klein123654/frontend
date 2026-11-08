export type AppRole = 'buyer' | 'owner' | 'developer' | 'broker' | 'admin'

export const users: Record<AppRole, { id: number; name: string; email: string; role: AppRole; phone: string | null; account_status: string }> = {
  buyer: { id: 21, name: 'Dana Buyer', email: 'buyer@example.test', role: 'buyer', phone: '09171234567', account_status: 'active' },
  owner: { id: 22, name: 'Owen Owner', email: 'owner@example.test', role: 'owner', phone: null, account_status: 'active' },
  developer: { id: 23, name: 'Dev Developer', email: 'developer@example.test', role: 'developer', phone: null, account_status: 'active' },
  broker: { id: 24, name: 'Brooke Broker', email: 'broker@example.test', role: 'broker', phone: null, account_status: 'active' },
  admin: { id: 25, name: 'Avery Admin', email: 'admin@example.test', role: 'admin', phone: null, account_status: 'active' },
}

export const listing = {
  id: 101,
  title: 'Riverside Commercial Space',
  property_type: 'Office Spaces',
  listing_type: 'rent',
  description: 'A bright commercial space close to the city center.',
  price: '50000',
  address_line: '12 Riverside Road',
  barangay: 'Baan',
  city: 'Butuan City',
  province: 'Agusan del Norte',
  latitude: 8.95,
  longitude: 125.54,
  floor_area: '150',
  lot_area: null,
  broker_id: null,
  images: [{ path: '/storage/riverside.jpg', alt_text: 'Riverside Commercial Space', sort_order: 0, is_primary: true }],
  ai_tags: ['near port'],
  status: 'published',
  created_at: '2026-10-01T10:00:00.000000Z',
  inquiries_count: 1,
  review_notes: null,
  owner: { name: users.owner.name },
  broker: null,
}

export const pendingListing = { ...listing, id: 102, title: 'Pending Market Office', status: 'pending', images: [] }
export const draftListing = { ...listing, id: 103, title: 'Draft Riverside Unit', barangay: 'Baan KM 3', status: 'draft', images: [] }

export const inquiry = {
  id: 205,
  property_id: listing.id,
  buyer_id: users.buyer.id,
  name: users.buyer.name,
  email: users.buyer.email,
  phone: users.buyer.phone,
  message: 'Please share the available viewing times.',
  ai_summary: 'Customer requests viewing times.',
  ai_priority: 'medium' as const,
  status: 'in_progress',
  created_at: '2026-10-02T10:00:00.000000Z',
  last_message_at: null,
  property: { id: listing.id, title: listing.title, owner_id: users.owner.id, broker_id: null },
}

export const inquiryMessage = {
  id: 501,
  inquiry_id: inquiry.id,
  sender_id: users.buyer.id,
  body: inquiry.message,
  created_at: inquiry.created_at,
  sender: { id: users.buyer.id, name: users.buyer.name },
}

export const verification = {
  id: 301,
  license_number: 'PRC-1234567',
  agency_name: 'Northstar Realty',
  status: 'pending',
  review_notes: null,
  created_at: '2026-10-03T10:00:00.000000Z',
  broker: { id: users.broker.id, name: users.broker.name, email: users.broker.email },
}

export const application = {
  id: 401,
  requested_role: 'owner' as const,
  ownership_type: 'Individual owner',
  business_name: null,
  license_number: null,
  agency_name: null,
  status: 'pending' as const,
  review_notes: null,
  created_at: '2026-10-04T10:00:00.000000Z',
  applicant: { id: users.buyer.id, name: users.buyer.name, email: users.buyer.email, phone: users.buyer.phone, role: 'buyer' },
}

export const report = {
  id: 601,
  reason: 'Display / Layout: Header overlaps the search field',
  details: 'The header overlaps the search field on a narrow viewport.',
  status: 'open',
  reporter_name: users.buyer.name,
  reporter_email: users.buyer.email,
  created_at: '2026-10-05T10:00:00.000000Z',
}

export const brokerListing = {
  ...listing,
  id: 701,
  title: 'Brokered Riverside Unit',
  barangay: 'Baan KM 3',
  broker_id: users.broker.id,
  broker: { name: users.broker.name },
  status: 'draft',
}
