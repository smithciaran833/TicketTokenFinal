export class EventSchedule {
  id: string;
  event_template_id: string; // Base event to copy
  
  // Recurrence pattern (follows iCal RRULE standard)
  recurrence_rule: string; // e.g., "FREQ=WEEKLY;BYDAY=FR,SA"
  start_date: Date;
  end_date?: Date;
  exceptions: Date[]; // Dates to skip
  
  // Time settings
  event_duration: number; // minutes
  doors_open_offset: number; // minutes before start
  
  // Variations per occurrence
  variations: ScheduleVariation[];
  
  // Status
  active: boolean;
  generated_until: Date;
  
  created_at: Date;
  updated_at: Date;
}

export interface ScheduleVariation {
  date: Date;
  price_adjustment?: number; // percentage
  capacity_override?: number;
  special_guests?: string[];
  notes?: string;
}
