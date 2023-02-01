from collections import deque
from datetime import datetime

class Record:
    def __init__(self, power):
        self.power = power
        self.time = datetime.now()

    def __str__(self) -> str:
        return f"Record {self.power}W at {self.time}"

    def __repr__(self):
        return self.__str__()
        

class Tracker:
    is_running = False
    turn_off_detected = False

    def __init__(self, sample_size, threshold, running_detection_points, stopped_detection_points):
        self.samples = deque([], sample_size)
        self.sample_size = sample_size
        self.threshold = threshold
        self.running_detection_points = running_detection_points
        self.stopped_detection_points = stopped_detection_points

    def record(self, value):
        self.samples.appendleft(Record(value))
        self.__update_is_running()

    def __update_is_running(self):
        if len(self.samples) < self.sample_size:
            return

        over_threshold = 0
        for i in range(self.sample_size):
            if self.samples[i].power > self.threshold:
                over_threshold += 1
        under_threshold = self.sample_size - over_threshold

        if self.is_running:
            if under_threshold >= self.stopped_detection_points:
                self.turn_off_detected = True
                self.is_running = False
        else:
            self.is_running = over_threshold >= self.running_detection_points

    def clear(self):
        self.turn_off_detected = False

