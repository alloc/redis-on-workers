import { Type } from "@sinclair/typebox";
import {
  FLUSHALL,
  FT,
  JSON,
  ON,
  PREFIX,
  RedisClient,
  RedisIndexKey,
  RedisKey,
} from "../src";

test("full text search", async () => {
  const redis = new RedisClient({
    url: "redis://localhost:6379/0",
  });

  expect(await redis.send(FLUSHALL())).toEqual("OK");

  const idx = new RedisIndexKey("idx");

  expect(
    await redis.send(
      FT.CREATE(
        idx,
        ["$..field1", "AS", "field1", "TEXT"],
        ON("json"),
        PREFIX("doc:"),
      ),
    ),
    "OK",
  ).toEqual("OK");

  expect(
    await redis.send(
      JSON.SET(new RedisKey("doc:1", Type.Any()), "$", {
        field1: "value1",
      }),
    ),
    "OK",
  ).toEqual("OK");

  let result = await redis.send(FT.SEARCH(idx, "@field1:value1"));

  expect(result).toBeDefined();
  expect(result[0]).toEqual(1); // Number of results
  expect(result[1]).toEqual("doc:1"); // Document ID

  result = await redis.send(FT.SEARCH(idx, "@field1:value2"));

  expect(result).toBeDefined();
  expect(result[0]).toEqual(0); // No results

  result = await redis.send(FT.SEARCH(idx, "@field1:value*"));

  expect(result).toBeDefined();
  expect(result[0]).toEqual(1);
  expect(result[1]).toEqual("doc:1");

  result = await redis.send(FT.SEARCH(idx, "@field1:*value*"));

  expect(result).toBeDefined();
  expect(result[0]).toEqual(1);
  expect(result[1]).toEqual("doc:1");

  await redis.close();
});
