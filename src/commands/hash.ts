import { Static, StaticEncode } from "@sinclair/typebox";
import { RedisCommand, RedisValue } from "../command";
import { RedisField, RedisHash, TRedisHash } from "../key";

/**
 * Get the value of a field in a hash.
 */
export function HGET<T extends TRedisHash, TField extends RedisField<T>>(
  hash: RedisHash<T>,
  field: TField,
) {
  return new RedisCommand<Static<T[TField]>>(
    ["HGET", hash.name, field],
    (result) => hash.decodeField(field, result),
  );
}

/**
 * Set the value of a field in a hash.
 */
export function HSET<T extends TRedisHash, TField extends RedisField<T>>(
  hash: RedisHash<T>,
  field: TField,
): never;

/**
 * Set the value of a field in a hash.
 */
export function HSET<T extends TRedisHash, TField extends RedisField<T>>(
  hash: RedisHash<T>,
  field: TField,
  value: StaticEncode<T[TField]>,
): RedisCommand<number>;

/**
 * Set the values of multiple fields in a hash.
 */
export function HSET<T extends TRedisHash>(
  hash: RedisHash<T>,
  values: { [K in RedisField<T>]?: StaticEncode<T[K]> },
): RedisCommand<number>;

export function HSET<T extends TRedisHash>(
  hash: RedisHash<T>,
  field: RedisField<T> | object,
  value?: unknown,
) {
  return new RedisCommand<number>(
    typeof field === "string"
      ? ["HSET", hash.name, field, hash.encodeField(field, value)]
      : ["HSET", hash.name, ...encodeHashEntries(hash, field).flat()],
  );
}

function encodeHashEntries<T extends TRedisHash>(
  hash: RedisHash<T>,
  values: object,
) {
  const entries = Object.entries(values) as [string, RedisValue][];
  if (entries.length === 0) {
    throw new Error("At least one field must be provided");
  }
  for (let i = 0; i < entries.length; i++) {
    entries[i][1] = hash.encodeField(
      entries[i][0] as RedisField<T>,
      entries[i][1],
    );
  }
  return entries;
}
