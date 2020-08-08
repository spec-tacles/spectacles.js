import GuildMember, { VoiceState, Presence } from './GuildMember';
import Role from './Role';
import Emoji from './Emoji';
import Channel from './Channel';
import { PresenceUpdate } from './packets';
import { User } from '.';

export enum DefaultMessageNotificationLevel {
  ALL_MESSAGES,
  ONLY_MENTIONS,
}

export enum ExplicitContentFilterLevel {
  DISABLED,
  MEMBERS_WITHOUT_ROLES,
  ALL_MEMBERS,
}

export enum MFALevel {
  NONE,
  ELEVATED,
}

export enum VerificationLevel {
  NONE,
  LOW,
  MEDIUM,
  HIGH,
  VERY_HIGH,
}

export enum PremiumTier {
  NONE,
  TIER_1,
  TIER_2,
  TIER_3,
}

export enum GuildFeature {
  INVITE_SPLASH = 'INVITE_SPLASH',
  VIP_REGIONS = 'VIP_REGIONS',
  VANITY_URL = 'VANITY_URL',
  VERIFIED = 'VERIFIED',
  PARTNERED = 'PARTNERED',
  PUBLIC = 'PUBLIC',
  COMMERCE = 'COMMERCE',
  NEWS = 'NEWS',
  DISCOVERABLE = 'DISCOVERABLE',
  FEATURABLE = 'FEATURABLE',
  ANIMATED_ICON = 'ANIMATED_ICON',
  BANNER = 'BANNER',
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  syncing: boolean;
  role_id: string;
  expire_behavior: number;
  expire_grace_period: number;
  user: User;
  account: IntegrationAccount;
  synced_at: string;
}

export interface IntegrationAccount {
  id: string;
  name: string;
}

export interface UnavailableGuild {
  id: string;
  unavailable: true;
}

export interface AvailableGuild {
  id: string;
  name: string;
  icon: string | null;
  splash: string | null;
  owner?: boolean;
  owner_id: string;
  permissions?: number;
  region: string;
  afk_channel_id: string | null;
  afk_timeout: number;
  embed_enabled?: boolean;
  embed_channel_id?: string;
  verification_level: VerificationLevel;
  default_message_notifications: DefaultMessageNotificationLevel;
  explict_content_filter: ExplicitContentFilterLevel;
  roles: Role[];
  emojis: Emoji[];
  features: GuildFeature[];
  mfa_level: MFALevel;
  application_id: string | null;
  widget_enabled?: boolean;
  widget_channel_id?: string;
  system_channel_id: string | null;
  max_presences?: number | null;
  max_members?: number | null;
  vanity_url_code: string | null;
  description: string | null;
  banner: string | null;
  premium_tier: PremiumTier;
  premium_subscription_count?: number;
  preferred_locale?: string;
  approximate_member_count?: number;
  approximate_presence_count?: number;
}

export interface WebsocketGuild extends AvailableGuild {
  joined_at: string;
  large: boolean;
  unavailable: false;
  member_count: number;
  members: GuildMember[];
  voice_states: Partial<VoiceState>[];
  channels: Channel[];
  presences: Partial<PresenceUpdate>[];
}

type Guild = UnavailableGuild & (AvailableGuild | WebsocketGuild);
export default Guild;
