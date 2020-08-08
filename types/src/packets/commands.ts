import { Activity } from '../GuildMember';

export interface Identify {
  token: string;
  properties: {
    $os: string;
    $browser: string;
    $device: string;
  };
  compress?: boolean;
  large_threshold?: number;
  shard?: [number, number];
  presence?: UpdateStatus;
}

export interface Resume {
  token: string;
  session_id: string;
  seq: number;
}

export type Heartbeat = number;

export enum StatusType {
  ONLINE = 'online',
  DND = 'dnd',
  IDLE = 'idle',
  INVISIBLE = 'invisible',
  OFFLINE = 'offline',
}

export interface UpdateStatus {
  since?: number;
  game?: Activity;
  status: StatusType;
  afk: boolean;
}

export interface RequestGuildMembers {
  guild_id: string;
  query: string;
  limit: number;
}

export interface UpdateVoiceState {
  guild_id: string;
  channel_id?: string;
  self_mute: boolean;
  self_deaf: boolean;
}


