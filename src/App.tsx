import { useState, useCallback } from 'react';
import { supabase, type PresenterModel, DEFAULT_MODEL } from '@/lib/supabase';
import Lobby from '@/components/Lobby';
import MeetingRoom from '@/components/MeetingRoom';

const AVATAR_COLORS = ['#4f8cff', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#f97316'];

type AppState =
  | { screen: 'lobby' }
  | { screen: 'meeting'; meetingId: string; name: string; avatarColor: string; isHost: boolean };

export default function App() {
  const [state, setState] = useState<AppState>({ screen: 'lobby' });

  const handleJoin = useCallback(async (name: string, meetingId?: string) => {
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    if (meetingId) {
      // Join existing meeting
      const { data } = await supabase
        .from('meetings')
        .select('id')
        .eq('id', meetingId)
        .maybeSingle();

      if (!data) {
        alert('Meeting not found. Check the code or create a new meeting.');
        return;
      }

      setState({ screen: 'meeting', meetingId: data.id, name, avatarColor: color, isHost: false });
    } else {
      // Create new meeting
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          title: `${name}'s Meeting`,
          host_name: name,
          presenter_model: DEFAULT_MODEL as PresenterModel,
        })
        .select()
        .single();

      if (error || !data) {
        alert('Failed to create meeting. Please try again.');
        return;
      }

      setState({ screen: 'meeting', meetingId: data.id, name, avatarColor: color, isHost: true });
    }
  }, []);

  const handleLeave = useCallback(() => {
    setState({ screen: 'lobby' });
  }, []);

  if (state.screen === 'lobby') {
    return <Lobby onJoin={handleJoin} />;
  }

  return (
    <MeetingRoom
      meetingId={state.meetingId}
      name={state.name}
      avatarColor={state.avatarColor}
      isHost={state.isHost}
      onLeave={handleLeave}
    />
  );
}
