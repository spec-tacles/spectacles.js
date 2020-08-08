import Guild from './Guild';
import Channel from './Channel';
import User from './User';

export enum InviteTargetUserType {
	STREAM
}

export default interface Invite {
	code: string;
	guild?: Partial<Guild>;
	channel: Partial<Channel>;
	target_user?: Partial<User>;
	target_user_type: InviteTargetUserType;
	approximate_presence_count?: number;
	approximate_member_count?: number;
}
