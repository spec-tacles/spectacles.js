export default interface ApplicationCommand {
	id: string;
	application_id: string;
	name: string;
	description: string;
	options?: CommandOption[];
}

export interface CommandOption {
	type: OptionType,
	name: string;
	description: string;
	default?: boolean;
	required?: boolean;
	choices?: CommandOptionChoice[];
	options?: CommandOption[];
}

export interface CommandOptionChoice {
	name: string;
	value: string | number;
}

export enum OptionType {
	SUB_COMMAND = 1,
	SUB_COMMAND_GROUP = 2,
	STRING = 3,
	INTEGER = 4,
	BOOLEAN = 5,
	USER = 6,
	CHANNEL = 7,
	ROLE = 8,
}
