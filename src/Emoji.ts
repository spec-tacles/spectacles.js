import User from './User';

export default interface Emoji {
  id: string;
  name: string;
  roles?: string[];
  user?: User;
  require_colons: boolean;
  managed: boolean;
  animated: boolean;
}
