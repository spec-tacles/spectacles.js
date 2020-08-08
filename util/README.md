# Spectacles Utils

Various utilities for interacting with Discord and using Spectacles.

## Encoding/Decoding

`encode` and `decode` convenience functions for JSON de/serializing arbitrary data.

## Permissions

A `Permissions` class with methods for dealing with Discord permissions.

- *static* `FLAGS`: each individual [Discord permission flag](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags).
- *static* `ALL`: every permission flag OR'd together
- *static* `NONE`: 0
- *`constructor(bitfield: number = Permissions.NONE)`*
- `add(perms: number): this`: adds a bitfield to the permissions
- `remove(perms: number): this`: removes permissions
- `has(perms: number): this`: checks if permissions exist
- `apply(data: { guild: AvailableGuild, channel?: Channel, member?: GuildMember }): this`: applies guild and optionally channel and member permissions to the bitfield. After this method, the bitfield will represent the final permissions for the given guild & channel and/or member with appropriate overrides. Operates in accordance with [Discord recommendations](https://discord.com/developers/docs/topics/permissions#permission-overwrites).
- *readonly* `isAdmin: boolean`: whether this bitfield contains the administrator flag
- `clone(): Permissions`: create a new permissions instance from this bitfield
- `valueOf(): number`: the bitfield
- `toJSON(): string[]`: an array of readable strings representing the permissions in this bitfield


## Snowflakes

A `Snowflake` class with methods for creating/inspecting Discord snowflakes. Requires BigInt support.

- *static* `EPOCH: number`: the epoch to use for snowflakes (defaults to Discord's)
- *`constructor(bin: bigint | string = 0n)`*
- `createdAt: Date`: get/set when the snowflake was created
- `workerID: number`: get/set the worker ID
- `processID: number`: get/set the process ID
- `increment: number`: get/set the increment
- `valueOf(): bigint`: the raw snowflake
