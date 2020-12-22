import GuildMember from './GuildMember';
import { OptionType } from './ApplicationCommand';

export default interface Interaction {
	id: string;
	type: InteractionType;
	data?: InteractionData;
	guild_id: string;
	channel_id: string;
	member: GuildMember;
	token: string;
	version: number;
}

export enum InteractionType {
	PING = 1,
	APPLICATION_COMMAND = 2,
}

export interface InteractionData {
	id: string;
	name: string;
	options: InteractionDataOption[];
}

export interface InteractionDataOption {
	name: string;
	value?: OptionType;
	options?: InteractionDataOption[];
}
