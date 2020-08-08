import User from './User';

export default interface Webhook {
	id: string;
	type: number;
	guild_id?: string;
	channel_id: string;
	user: User;
	name: string | null;
	avatar: string | null;
	token?: string;
}
