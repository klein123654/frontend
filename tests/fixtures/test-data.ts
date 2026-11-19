export type AppRole = 'buyer' | 'owner' | 'broker' | 'admin'

export const users: Record<AppRole, { id: number; name: string; email: string; role: AppRole; phone: string | null; account_status: string }> = {
  buyer: { id: 21, name: 'Dana Buyer', email: 'buyer@example.test', role: 'buyer', phone: '09171234567', account_status: 'active' },
  owner: { id: 22, name: 'Owen Owner', email: 'owner@example.test', role: 'owner', phone: null, account_status: 'active' },
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
  availability: 'available',
  availability_confirmed_at: new Date().toISOString(),
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

const inYears = (years: number) => new Date(Date.now() + years * 365 * 86_400_000).toISOString().slice(0, 10)

export const brokerCredentials = {
  license_number: 'PRC-1234567',
  prc_valid_until: inYears(2),
  dhsud_registration_number: 'DHSUD-CRG-0042',
  dhsud_valid_until: inYears(0.7),
  firm_name: 'Northstar Realty',
  firm_position: 'Managing Broker',
  firm_address: 'Montilla Blvd, Butuan City',
  firm_registration_number: null,
  affiliations: ['Butuan Realty Board'],
}

export const verification = {
  id: 301,
  ...brokerCredentials,
  status: 'pending',
  credential_status: 'current',
  dhsud_check_due: false,
  dhsud_checked_at: null,
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
  prc_valid_until: null,
  dhsud_registration_number: null,
  dhsud_valid_until: null,
  firm_name: null,
  firm_position: null,
  firm_address: null,
  firm_registration_number: null,
  affiliations: null,
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

/** A public listing posted by a verified broker, with their firm and credentials. */
export const brokeredPublicListing = {
  ...listing,
  id: 105,
  title: 'Northstar Corner Office',
  broker_id: users.broker.id,
  broker: { name: users.broker.name },
  availability: 'reserved',
  publisher: {
    id: users.broker.id, name: users.broker.name, role: 'broker', role_label: 'Licensed broker', verified: true,
    license_number: brokerCredentials.license_number, agency_name: brokerCredentials.firm_name, member_since: '2026-10-01',
    broker: {
      license_number: brokerCredentials.license_number,
      prc_valid_until: brokerCredentials.prc_valid_until,
      dhsud_registration_number: brokerCredentials.dhsud_registration_number,
      dhsud_valid_until: brokerCredentials.dhsud_valid_until,
      credential_status: 'current',
      firm: { name: brokerCredentials.firm_name, position: brokerCredentials.firm_position, address: brokerCredentials.firm_address, registration_number: null },
      affiliations: brokerCredentials.affiliations,
    },
    contact: { phone: '09171234567', email: null, messenger_url: null, viber_url: null },
  },
}

/** A listing that was rented recently: still shown, but no longer accepts inquiries. */
export const rentedPublicListing = { ...listing, id: 106, title: 'Rented Riverside Shop', availability: 'rented' }
