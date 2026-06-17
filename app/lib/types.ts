export type Trip = { id: string; name: string; slug: string; start_date: string | null; end_date: string | null; cover_url: string | null }
export type Destination = { id: string; trip_id: string; name: string; lat: number | null; lng: number | null; arrival_date: string | null; nights: number | null; sort_order: number }
export type Activity = { id: string; destination_id: string; name: string; category: string; description: string | null; price_text: string | null; duration_min: number | null; opening_hours: string | null; lat: number | null; lng: number | null; url: string | null; tags: string[]; source: string | null }
export type Day = { id: string; trip_id: string; date: string | null; destination_id: string | null; title: string | null; sort_order: number }
export type InfoPage = { id: string; trip_id: string; slug: string; title: string; body_md: string }
export type Todo = { id: string; trip_id: string; text: string; done: boolean; assignee: string | null; sort_order: number }
