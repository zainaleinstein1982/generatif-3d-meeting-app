import { createClient } from '@supabase/supabase-js';

// Tambahkan || 'https://placeholder.supabase.co' dan || 'placeholder-key'
const supabaseUrl = 'https://chrqokxqyhpvddfwhhci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocnFva3hxeWhwdmRkZndoaGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NTcxODgsImV4cCI6MjEwMDMzMzE4OH0.Ew39z5zamyul6HQKUczYh1AXATZZgVakPgHUor93A0s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
});

export type Meeting = {
  id: string;
  title: string;
  host_name: string;
  presenter_model: PresenterModel;
  created_at: string;
};

export type Participant = {
  id: string;
  meeting_id: string;
  name: string;
  avatar_color: string;
  is_presenter: boolean;
  is_muted: boolean;
  is_video_on: boolean;
  joined_at: string;
  last_seen: string;
};

export type ChatMessage = {
  id: string;
  meeting_id: string;
  participant_name: string;
  content: string;
  created_at: string;
};

export type PresenterModel = {
  type: 'crystal' | 'torus' | 'sphere' | 'wave' | 'dna';
  color: string;
  accentColor: string;
  complexity: number;
  speed: number;
};

export const DEFAULT_MODEL: PresenterModel = {
  type: 'crystal',
  color: '#4f8cff',
  accentColor: '#22d3ee',
  complexity: 0.6,
  speed: 0.5,
};
