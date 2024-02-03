class Record {
  power: number;
  time: number;

  constructor(power: number) {
    this.power = power;
    this.time = new Date().getTime();
  }

  toString(): string {
    return `Record ${this.power}W at ${this.time}`;
  }
}

export class Tracker {
  public isRunning: boolean = false;
  public turnOffDetected: boolean = false;

  samples: Record[];
  sampleSize: number;
  threshold: number;
  runningDetectionPoints: number;
  stoppedDetectionPoints: number;

  constructor(options: {
    sampleSize: number;
    threshold: number;
    runningDetectionPoints: number;
    stoppedDetectionPoints: number;
  }) {
    this.samples = [];
    this.sampleSize = options.sampleSize;
    this.threshold = options.threshold;
    this.runningDetectionPoints = options.runningDetectionPoints;
    this.stoppedDetectionPoints = options.stoppedDetectionPoints;
  }

  record(value: number): void {
    this.samples.unshift(new Record(value));
    if (this.samples.length > this.sampleSize) {
      this.samples.splice(this.sampleSize);
    }
    this.updateIsRunning();
  }

  private updateIsRunning(): void {
    if (this.samples.length < this.sampleSize) {
      return;
    }

    let overThreshold = 0;
    for (let i = 0; i < this.sampleSize; i++) {
      if (this.samples[i].power > this.threshold) {
        overThreshold += 1;
      }
    }
    const underThreshold = this.sampleSize - overThreshold;

    if (this.isRunning) {
      if (underThreshold >= this.stoppedDetectionPoints) {
        this.turnOffDetected = true;
        this.isRunning = false;
      }
    } else {
      this.isRunning = overThreshold >= this.runningDetectionPoints;
    }
  }

  clear(): void {
    this.turnOffDetected = false;
  }
}
