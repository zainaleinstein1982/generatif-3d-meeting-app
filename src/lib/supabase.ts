import { createClient } from '@supabase/supabase-js';

// Tambahkan || 'https://placeholder.supabase.co' dan || 'placeholder-key'
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || https://chrqokxqyhpvddfwhhci.supabase.co;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttd3RzaHd5eW53dXRia2d5b2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MDQ0MjUsImV4cCI6MjEwMDE4MDQyNX0.EW6DxsTYvJeQbi7RI3PNPlck5Z4NvUG8CeKEupLkk6M;

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
