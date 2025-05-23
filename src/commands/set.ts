import { StaticEncode, TSchema } from "@sinclair/typebox";
import { RedisCommand } from "../command";
import { RedisSet } from "../key";

/**
 * Add one or more members to a set
 */
export function SADD<T extends TSchema>(
  key: RedisSet<T>,
  ...members: [StaticEncode<T>, ...StaticEncode<T>[]]
) {
  return new RedisCommand<number>([
    "SADD",
    key.name,
    ...members.map((member) => key.encode(member)),
  ]);
}

/**
 * Get the number of members in a set (AKA its cardinality).
 */
export function SCARD<T extends TSchema>(key: RedisSet<T>) {
  return new RedisCommand<number>(["SCARD", key.name]);
}

/**
 * Return the difference between multiple sets
 */
export function SDIFF<T extends TSchema>(
  ...keys: [RedisSet<T>, ...RedisSet<T>[]]
) {
  return new RedisCommand<StaticEncode<T>[]>(
    ["SDIFF", ...keys.map((key) => key.name)],
    (reply: unknown[]) => reply.map((value) => keys[0].decode(value)),
  );
}

/**
 * Return the intersection of multiple sets
 */
export function SINTER<T extends TSchema>(
  ...keys: [RedisSet<T>, ...RedisSet<T>[]]
) {
  return new RedisCommand<StaticEncode<T>[]>(
    ["SINTER", ...keys.map((key) => key.name)],
    (reply: unknown[]) => reply.map((value) => keys[0].decode(value)),
  );
}

/**
 * Check if member is a member of the set
 */
export function SISMEMBER<T extends TSchema>(
  key: RedisSet<T>,
  member: StaticEncode<T>,
) {
  return new RedisCommand<boolean>(
    ["SISMEMBER", key.name, key.encode(member)],
    (reply) => reply === 1,
  );
}

/**
 * Get all members in a set
 */
export function SMEMBERS<T extends TSchema>(key: RedisSet<T>) {
  return new RedisCommand<StaticEncode<T>[]>(
    ["SMEMBERS", key.name],
    (reply: unknown[]) => reply.map((value) => key.decode(value)),
  );
}

/**
 * Remove and return a random member from a set
 */
export function SPOP<T extends TSchema>(
  key: RedisSet<T>,
): RedisCommand<StaticEncode<T> | undefined>;

/**
 * Remove and return one or multiple random members from a set
 */
export function SPOP<T extends TSchema>(
  key: RedisSet<T>,
  count: number,
): RedisCommand<StaticEncode<T>[]>;

export function SPOP<T extends TSchema>(key: RedisSet<T>, count?: number) {
  return new RedisCommand<StaticEncode<T> | StaticEncode<T>[] | undefined>(
    count ? ["SPOP", key.name, count.toString()] : ["SPOP", key.name],
    (reply) => {
      if (reply === null) return undefined;
      return Array.isArray(reply)
        ? reply.map((value) => key.decode(value))
        : key.decode(reply);
    },
  );
}

/**
 * Remove one or more members from a set
 */
export function SREM<T extends TSchema>(
  key: RedisSet<T>,
  ...members: StaticEncode<T>[]
) {
  return new RedisCommand<number>([
    "SREM",
    key.name,
    ...members.map((member) => key.encode(member)),
  ]);
}

/**
 * Return the union of multiple sets
 */
export function SUNION<T extends TSchema>(...keys: RedisSet<T>[]) {
  return new RedisCommand<StaticEncode<T>[]>(
    ["SUNION", ...keys.map((key) => key.name)],
    (reply: unknown[]) => reply.map((value) => keys[0].decode(value)),
  );
}
