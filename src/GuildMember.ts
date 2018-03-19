import User from './User';

export interface VoiceState {
  guild_id?: string;
  channel_id: string;
  user_id: string;
  sessioN_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  suppress: boolean;
}

export enum ActivityType {
  PLAYING,
  STREAMING,
  LISTENING,
}

export interface Activity {
  name: string;
  type: ActivityType;
  url?: string;
  timestamps?: {
    start: number;
    end: number;
  };
  application_id?: string;
  details?: string;
  state?: string;
  party?: {
    id?: string;
    size: [number, number];
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

export interface Presence {
  user?: User;
  roles?: string[];
  game?: Activity;
  guild_id?: string;
  status: string;
}

export default interface GuildMember {
  user: User,
  nick?: string;
  roles: string[];
  joined_at: string;
  deaf: boolean;
  mute: boolean;
}
