import {
  Static,
  TAnySchema,
  TSchema,
  TTuple,
  TUndefined,
} from "@sinclair/typebox";
import { Encode } from "@sinclair/typebox/value";
import { RedisValue } from "./command";

export function createModifier<
  K extends string,
  T extends TSchema = TUndefined,
>(token: K, schema?: T): RedisModifierFunction<K, T> {
  if (schema) {
    if (schema.type === "array") {
      return (...args: unknown[]) => {
        const encodedArgs = Encode(schema, args) as RedisValue[];
        return new RedisModifier(token, [encodedArgs.length, ...encodedArgs]);
      };
    }
    return (arg?: unknown) => {
      const encodedArg = Encode(schema, arg) as RedisValue;
      return new RedisModifier(token, [encodedArg]);
    };
  }
  const modifier = new RedisModifier(token);
  return () => modifier;
}

export function encodeModifiers(
  modifiers: readonly (RedisModifier | undefined)[],
) {
  if (modifiers.length === 0) {
    return modifiers as never[];
  }
  const encoded: RedisValue[] = [];
  for (const modifier of modifiers) {
    if (!modifier) {
      continue;
    }
    if (modifier.args) {
      encoded.push(modifier.token, ...modifier.args);
    } else {
      encoded.push(modifier.token);
    }
  }
  return encoded;
}

export type RedisModifierFunction<
  K extends string = string,
  T extends TSchema = TAnySchema,
> = (...args: StaticModifierArgs<T>) => RedisModifier<K>;

export class RedisModifier<K extends string = string> {
  constructor(
    readonly token: K,
    readonly args?: RedisValue[],
  ) {}
}

export type StaticModifier<T extends RedisModifierFunction> =
  T extends RedisModifierFunction<infer K> ? RedisModifier<K> : never;

// Assumes that Type.Array() and Type.Tuple() schemas are intended to be
// used as spread arguments.
export type StaticModifierArgs<T extends TSchema> = //
  [T] extends [TTuple<infer TElements>]
    ? { [K in keyof TElements]: Static<TElements[K]> }
    : Static<T> extends infer TValue
      ? [TValue] extends [undefined]
        ? []
        : [TValue] extends [readonly any[]]
          ? TValue
          : undefined extends TValue
            ? [TValue?]
            : [TValue]
      : never;

/**
 * Represents a permutation of modifiers.
 */
export type Modifiers<TOptions extends RedisModifier[] = RedisModifier[]> = [
  TOptions,
] extends [RedisModifier[]]
  ? (RedisModifier | undefined)[]
  : TOptions extends [
        infer First extends RedisModifier,
        ...infer Rest extends RedisModifier[],
      ]
    ? Rest extends []
      ? [First]
      : (
            First extends { $$required: infer Req }
              ? true extends Req
                ? First
                : First | undefined
              : First | undefined
          ) extends infer Modifier
        ?
            | [Modifier, ...UndefinedElements<Rest>]
            | [Modifier, ...Modifiers<Rest>]
            | Modifiers<Rest>
        : never
    : never;

/** For modifiers that affect which overload is used. */
export type Require<T extends RedisModifier> = T & {
  $$required?: true;
};

type UndefinedElements<T extends unknown[]> = { [K in keyof T]?: undefined };
