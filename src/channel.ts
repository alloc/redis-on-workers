import { TAnySchema, TSchema, TString, Type } from "@sinclair/typebox";
import { RedisKey } from "./key";
import { RedisTransform } from "./transform";

/**
 * Channels use the `SUBSCRIBE` command.
 */
export class RedisChannel<
  T extends TSchema = TAnySchema,
> extends RedisTransform<T> {
  declare $$typeof: "RedisChannel";
  constructor(
    readonly text: string,
    schema: T,
  ) {
    super(schema);
  }

  /**
   * Derive a subchannel by prefixing the current channel with the given
   * keys. When multiple keys are passed in, they will be joined with a
   * colon.
   */
  join(...keys: (string | number)[]) {
    if (keys.length === 0) return this;
    return new RedisChannel(`${this.text}:${keys.join(":")}`, this.schema);
  }
}

/**
 * Channel patterns use the `PSUBSCRIBE` command.
 */
export class RedisChannelPattern<
  T extends TSchema = TAnySchema,
> extends RedisTransform<T> {
  declare $$typeof: "RedisChannelPattern";
  constructor(
    readonly text: string,
    schema: T,
  ) {
    super(schema);
  }
}

/**
 * Subscribe to [keyspace notifications][1].
 *
 * [1]: https://redis.io/docs/latest/develop/use/keyspace-notifications/
 */
export class RedisKeyspacePattern extends RedisChannelPattern<TString> {
  constructor(pattern: string | RedisKey, database?: number) {
    super(`__keyspace@${database ?? "*"}__:${pattern}`, Type.String());
  }
}

/**
 * Subscribe to [keyevent notifications][1].
 *
 * [1]: https://redis.io/docs/latest/develop/use/keyspace-notifications/
 */
export class RedisKeyeventPattern extends RedisChannelPattern<TString> {
  constructor(pattern: string, database?: number) {
    super(`__keyevent@${database ?? "*"}__:${pattern}`, Type.String());
  }
}
