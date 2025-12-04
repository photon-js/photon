import { DurableObject } from "cloudflare:workers";
import { apply, serve } from "@photonjs/hono";
import { Hono } from "hono";

export interface Env {
  COUNTER: DurableObjectNamespace<Counter>;
}

export class Counter extends DurableObject<Env> {
  // In-memory state
  value = 0;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    // `blockConcurrencyWhile()` ensures no requests are delivered until initialization completes.
    ctx.blockConcurrencyWhile(async () => {
      // After initialization, future reads do not need to access storage.
      this.value = (await ctx.storage.get("value")) || 0;
    });
  }

  async getCounterValue() {
    return this.value;
  }

  async increment(amount = 1): Promise<number> {
    this.value += amount;
    await this.ctx.storage.put("value", this.value);
    return this.value;
  }

  async decrement(amount = 1): Promise<number> {
    this.value -= amount;
    await this.ctx.storage.put("value", this.value);
    return this.value;
  }
}

async function startServer() {
  const app = new Hono<{ Bindings: Env }>();

  app.get("/counter", async (c) => {
    const env = c.env;
    const id = env.COUNTER.idFromName("counter");
    const stub = env.COUNTER.get(id);
    const counterValue = await stub.getCounterValue();
    return c.text(counterValue.toString());
  });

  app.post("/counter/increment", async (c) => {
    const env = c.env;
    const id = env.COUNTER.idFromName("counter");
    const stub = env.COUNTER.get(id);
    const value = await stub.increment();
    return c.text(value.toString());
  });

  app.post("/counter/decrement", async (c) => {
    const env = c.env;
    const id = env.COUNTER.idFromName("counter");
    const stub = env.COUNTER.get(id);
    const value = await stub.decrement();
    return c.text(value.toString());
  });

  // awesomeFramework will automatically be injected by apply
  apply(app);

  return serve(app);
}

export default await startServer();
