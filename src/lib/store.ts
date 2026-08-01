/**
 * Optional persistence adapter for orders and intake submissions.
 *
 * Email is the system of record by default — every order and intake reaches
 * the owner's inbox even with no database configured. This interface exists
 * so a real database (e.g. Vercel Postgres) can be plugged in without
 * touching the webhook or submit handlers: implement StorageAdapter, then
 * return your implementation from getStore() when its env vars are present.
 *
 * The default MemoryAdapter also provides webhook idempotency. Note its
 * limits honestly: the set of processed session ids lives per server
 * instance and resets on redeploy — good enough to stop same-instance
 * webhook retries (Stripe's common retry case), not a cross-region
 * guarantee. A duplicate email to the owner is the worst-case outcome;
 * a database adapter upgrades this to true idempotency.
 */

export interface OrderRecord {
  sessionId: string;
  items: string[];
  amountTotal: number | null;
  customerEmail: string;
  customerName?: string;
  shippingAddress?: string;
  createdAt: string;
}

export interface IntakeRecord {
  sessionId?: string;
  items?: string[];
  facilityName: string;
  submission: unknown;
  createdAt: string;
}

export interface StorageAdapter {
  /** Returns true if this session id was already processed (webhook replay). */
  wasProcessed(sessionId: string): Promise<boolean>;
  markProcessed(sessionId: string): Promise<void>;
  saveOrder(order: OrderRecord): Promise<void>;
  saveIntake(intake: IntakeRecord): Promise<void>;
}

class MemoryAdapter implements StorageAdapter {
  private processed = new Set<string>();

  async wasProcessed(sessionId: string): Promise<boolean> {
    return this.processed.has(sessionId);
  }
  async markProcessed(sessionId: string): Promise<void> {
    this.processed.add(sessionId);
    // Bound memory in long-lived processes.
    if (this.processed.size > 5000) {
      this.processed.delete(this.processed.values().next().value as string);
    }
  }
  async saveOrder(): Promise<void> {
    /* email is the record in memory mode */
  }
  async saveIntake(): Promise<void> {
    /* email is the record in memory mode */
  }
}

let store: StorageAdapter | undefined;

export function getStore(): StorageAdapter {
  if (!store) {
    /* Plug a database adapter in here, gated on its env var, e.g.:
       if (process.env.POSTGRES_URL) store = new PostgresAdapter(); */
    store = new MemoryAdapter();
  }
  return store;
}
