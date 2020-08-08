import User from './User';

export enum ChannelType {
  GUILD_TEXT,
  DM,
  GUILD_VOICE,
  GROUP_DM,
  GUILD_CATEGORY,
  GUILD_NEWS,
  GUILD_STORE,
}

export interface PermissionOverwrite {
  id: string,
  type: 'role' | 'member',
  allow: number,
  deny: number,
}

export default interface Channel {
  id: string;
  type: number;
  guild_id?: string;
  position?: number;
  permission_overwrites?: PermissionOverwrite[];
  name?: string;
  topic?: string;
  nsfw?: boolean;
  last_message_id?: string;
  bitrate?: number;
  user_limit?: number;
  recipients?: User[];
  icon?: string;
  owner_id?: string;
  application_id?: string;
  parent_id?: string;
  last_pin_timestamp?: string;
}
