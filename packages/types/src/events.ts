// ─── Event DTOs ───────────────────────────────────────────────

export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  category: string;
  speaker_name: string | null;
  speaker_title: string | null;
  organizer: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  duration: string | null;
  event_mode: string;
  venue: string | null;
  is_free: boolean;
  ticket_price: number;
  total_seats: number | null;
  registered_count: number;
  status: string;
  created_at: string;
}

export interface EventDetail extends EventListItem {
  description: string | null;
  online_link: string | null;
  has_recording: boolean;
  recording_url: string | null;
  is_youtube_video?: boolean;
  recording_duration: string | null;
  recorded_at: string | null;
  college_id: string | null;
  created_by_type: string | null;
  created_by_id: string | null;
  updated_at: string;
}

export interface EventRegistrationItem {
  id: string;
  event_id: string;
  student_id: string;
  payment_status: string;
  status: string;
  registered_at: string;
  cancelled_at: string | null;
  event: EventListItem;
}

export interface EventRegistrationDetail {
  id: string;
  event_id: string;
  student_id: string;
  student_name: string | null;
  student_email: string | null;
  payment_status: string;
  status: string;
  registered_at: string;
  cancelled_at: string | null;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  cover_image_url?: string;
  category: string;
  speaker_name?: string;
  speaker_title?: string;
  organizer?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  duration?: string;
  event_mode: string;
  venue?: string;
  online_link?: string;
  is_free?: boolean;
  ticket_price?: number;
  total_seats?: number;
  college_id?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  cover_image_url?: string;
  category?: string;
  speaker_name?: string;
  speaker_title?: string;
  organizer?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  duration?: string;
  event_mode?: string;
  venue?: string;
  online_link?: string;
  is_free?: boolean;
  ticket_price?: number;
  total_seats?: number;
}

export interface UploadRecordingInput {
  recording_url: string;
  is_youtube_video?: boolean;
  recording_duration?: string;
  recorded_at?: string;
}
