import { TSchema } from "@sinclair/typebox";
import { RedisCommand } from "../command";
import { RedisKey, Value } from "../key";
import { encodeModifiers, Modifiers } from "../modifier";
import { NX, XX } from "../modifiers";

/**
 * Set the JSON value at path in key
 * @see https://redis.io/commands/json.set/
 */
export function SET<T extends TSchema>(
  key: RedisKey<T>,
  path: string,
  value: Value<T>,
  ...modifiers: Modifiers<[NX | XX]>
) {
  return new RedisCommand<"OK" | null>([
    "JSON.SET",
    key.text,
    path,
    key.encode(value),
    ...encodeModifiers(modifiers),
  ]);
}

/**
 * Get the JSON value at path in key
 * @see https://redis.io/commands/json.get/
 */
export function GET<T extends TSchema>(key: RedisKey<T>, paths: string[]) {
  return new RedisCommand<Value<T> | undefined>(
    ["JSON.GET", key.text, ...paths],
    (result) => (result !== null ? key.decode(result) : undefined),
  );
}
