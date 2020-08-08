export default interface Role {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: number;
  managed: boolean;
  mentionable: boolean;
}
