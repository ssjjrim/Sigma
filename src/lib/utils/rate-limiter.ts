export class RateLimiter {
  private queue: Array<() => void> = [];
  private running = 0;
  private lastCall = 0;

  constructor(
    private maxConcurrent: number,
    private minInterval: number
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        const now = Date.now();
        const wait = Math.max(0, this.minInterval - (now - this.lastCall));
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
        this.lastCall = Date.now();
        try {
          resolve(await fn());
        } catch (e) {
          reject(e);
        } finally {
          this.running--;
          this.processQueue();
        }
      });
      this.processQueue();
    });
  }

  private processQueue(): void {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      this.running++;
      const fn = this.queue.shift()!;
      fn();
    }
  }
}

export const kalshiLimiter = new RateLimiter(5, 50);
export const manifoldLimiter = new RateLimiter(5, 100);
