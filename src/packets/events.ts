import User from '../User';
import Channel from '../Channel';
import Guild, { UnavailableGuild, AvailableGuild } from '../Guild';
import Emoji from '../Emoji';
import GuildMember, { Activity, VoiceState } from '../GuildMember';
import Role from '../Role';
import Message from '../Message';
import { StatusType } from './commands';

export interface Traceable {
  _trace: string[];
}

export interface Hello extends Traceable {
  heartbeat_interval: number;
}

export interface Ready extends Traceable {
  v: number;
  user: User;
  private_channels: Channel[];
  guilds: UnavailableGuild[];
  session_id: string;
}

export interface Resumed extends Traceable {}
export type InvalidSession = boolean;

// Channels
export type ChannelCreate = Channel;
export type ChannelUpdate = Channel;
export type ChannelDelete = Channel;

export interface ChannelPinsUpdate {
  channel_id: string;
  last_pin_timestamp?: string;
}

// Guilds
export type GuildCreate = AvailableGuild;
export type GuildUpdate = Guild;
export type GuildDelete = UnavailableGuild;

export interface GuildBanAdd extends User {
  guild_id: string;
}

export interface GuildBanRemove extends User {
  guild_id: string;
}

export interface GuildEmojisUpdate {
  guild_id: string;
  emojis: Emoji[];
}

export interface GuildIntegrationsUpdate {
  guild_id: string;
}

export interface GuildMemberAdd extends GuildMember {
  guild_id: string;
}

export interface GuildMemberRemove {
  guild_id: string;
  user: User;
}

export interface GuildMemberUpdate {
  guild_id: string;
  roles: string[];
  user: User;
  nick: string;
}

export interface GuildMembersChunk {
  guild_id: string;
  members: GuildMember[];
}

export interface GuildRoleCreate {
  guild_id: string;
  role: Role;
}

export interface GuildRoleUpdate {
  guild_id: string;
  role: Role;
}

export interface GuildRoleDelete {
  guild_id: string;
  role_id: string;
}

// Messages
export type MessageCreate = Message;

export interface MessageUpdate extends Partial<Message> {
  id: string;
  channel_id: string;
}

export interface MessageDelete {
  id: string;
  channel_id: string;
}

export interface MessageDeleteBulk {
  id: string[];
  channel_id: string;
}

export interface MessageReactionAdd {
  user_id: string;
  channel_id: string;
  message_id: string;
  emoji: Partial<Emoji>;
}

export interface MessageReactionRemove {
  user_id: string;
  channel_id: string;
  message_id: string;
  emoji: Partial<Emoji>;
}

export interface MessageReactionRemoveAll {
  channel_id: string;
  message_id: string;
}

// Presences
export interface PresenceUpdate {
  user: User;
  role: string[];
  game?: Activity;
  guild_id: string;
  status: StatusType;
}

export interface TypingStart {
  channel_id: string;
  user_id: string;
  timestamp: number;
}

export type UserUpdate = User;

// Voice
export type VoiceStateUpdate = VoiceState;

export interface VoiceServerUpdate {
  token: string;
  guild_id: string;
  endpoint: string;
}

// Webhooks
export interface WebhooksUpdate {
  guild_id: string;
  channel_id: string;
}
