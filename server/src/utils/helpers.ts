export const sleep = async (delay: number) => {
  await new Promise((resolve) => setTimeout(resolve, delay));
};

class InterruptableSleep {
  private resolve: ((value: unknown) => void) | null = null;

  async sleep(delay: number) {
    await new Promise((resolve) => {
      setTimeout(resolve, delay);
      this.resolve = resolve;
    });
  }

  interrupt() {
    this.resolve?.(null);
  }
}
