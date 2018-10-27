import { AvailableGuild, Channel, GuildMember } from '@spectacles/types';

/*
   Derived from work in https://github.com/discordjs/discord.js.

   Copyright 2018 Will Nelson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

interface Flags {
  CREATE_INSTANT_INVITE: number;
  KICK_MEMBERS: number;
  BAN_MEMBERS: number;
  ADMINISTRATOR: number;
  MANAGE_CHANNELS: number;
  MANAGE_GUILD: number;
  ADD_REACTIONS: number;
  VIEW_AUDIT_LOG: number;
  PRIORITY_SPEAKER: number;

  VIEW_CHANNEL: number;
  SEND_MESSAGES: number;
  SEND_TTS_MESSAGES: number;
  MANAGE_MESSAGES: number;
  EMBED_LINKS: number;
  ATTACH_FILES: number;
  READ_MESSAGE_HISTORY: number;
  MENTION_EVERYONE: number;
  USE_EXTERNAL_EMOJIS: number;

  CONNECT: number;
  SPEAK: number;
  MUTE_MEMBERS: number;
  DEAFEN_MEMBERS: number;
  MOVE_MEMBERS: number;
  USE_VAD: number;

  CHANGE_NICKNAME: number;
  MANAGE_NICKNAMES: number;
  MANAGE_ROLES: number;
  MANAGE_WEBHOOKS: number;
  MANAGE_EMOJIS: number;
}

export default class Permissions {
  static FLAGS: Flags = {
    CREATE_INSTANT_INVITE: 1 << 0,
    KICK_MEMBERS: 1 << 1,
    BAN_MEMBERS: 1 << 2,
    ADMINISTRATOR: 1 << 3,
    MANAGE_CHANNELS: 1 << 4,
    MANAGE_GUILD: 1 << 5,
    ADD_REACTIONS: 1 << 6,
    VIEW_AUDIT_LOG: 1 << 7,
    PRIORITY_SPEAKER: 1 << 8,

    VIEW_CHANNEL: 1 << 10,
    SEND_MESSAGES: 1 << 11,
    SEND_TTS_MESSAGES: 1 << 12,
    MANAGE_MESSAGES: 1 << 13,
    EMBED_LINKS: 1 << 14,
    ATTACH_FILES: 1 << 15,
    READ_MESSAGE_HISTORY: 1 << 16,
    MENTION_EVERYONE: 1 << 17,
    USE_EXTERNAL_EMOJIS: 1 << 18,

    CONNECT: 1 << 20,
    SPEAK: 1 << 21,
    MUTE_MEMBERS: 1 << 22,
    DEAFEN_MEMBERS: 1 << 23,
    MOVE_MEMBERS: 1 << 24,
    USE_VAD: 1 << 25,

    CHANGE_NICKNAME: 1 << 26,
    MANAGE_NICKNAMES: 1 << 27,
    MANAGE_ROLES: 1 << 28,
    MANAGE_WEBHOOKS: 1 << 29,
    MANAGE_EMOJIS: 1 << 30,
  };

  static ALL = Object.values(Permissions.FLAGS).reduce((all, p) => all | p, 0);
  static NONE = 0;

  constructor(public bitfield: number = Permissions.NONE) {}

  public add(perms: number): this {
    this.bitfield |= perms;
    return this;
  }

  public remove(perms: number): this {
    this.bitfield &= ~perms;
    return this;
  }

  public has(perms: number): boolean {
    return (this.bitfield & perms) === perms;
  }

  public apply({ guild, channel, member }: { guild: AvailableGuild, channel?: Channel, member?: GuildMember }): this {
    if (member && guild.owner_id === member.user.id) return this.add(Permissions.ALL);

    const everyone = guild.roles.find(role => role.id === guild.id);
    if (everyone) this.add(everyone.permissions); // apply the everyone role
    if (this.isAdmin) return this.add(Permissions.ALL);

    if (member) {
      for (const roleID of member.roles) {
        const role = guild.roles.find(role => role.id === roleID);
        if (role) this.add(role.permissions); // apply user roles
      }

      if (this.isAdmin) return this.add(Permissions.ALL);
    }

    if (channel && channel.permission_overwrites) {
      const everyoneOverwrites = channel.permission_overwrites.find(o => o.type === 'role' && o.id === guild.id);
      if (everyoneOverwrites) this.remove(everyoneOverwrites.deny).add(everyoneOverwrites.allow); // deny/allow overwrites for the everyone role

      if (member) {
        for (const roleID of member.roles) {
          const roleOverwrites = channel.permission_overwrites.find(o => o.type === 'role' && o.id === roleID);
          if (roleOverwrites) this.add(roleOverwrites.allow).remove(roleOverwrites.deny); // allow/deny overwrites for member roles
        }

        const memberOverwrites = channel.permission_overwrites.find(o => o.type === 'member' && o.id === member.user.id);
        if (memberOverwrites) this.remove(memberOverwrites.deny).add(memberOverwrites.allow); // allow/deny member-specific overwrites
      }
    }

    return this;
  }

  public get isAdmin(): boolean {
    return this.has(Permissions.FLAGS.ADMINISTRATOR);
  }

  public clone(): Permissions {
    return new Permissions(this.bitfield);
  }

  public valueOf(): number {
    return this.bitfield;
  }

  public toJSON(): string[] {
    return (Object.keys(Permissions.FLAGS) as Array<keyof Flags>).filter((perm) => this.has(Permissions.FLAGS[perm]));
  }
}
