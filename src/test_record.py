import unittest
from tracker import Tracker


class TestStringMethods(unittest.TestCase):

    def test_detect_turn_off(self):
        record = Tracker(sample_size=5, threshold=10,
                         running_detection_points=2, stopped_detection_points=5)
        record.record(5)
        record.record(3)
        record.record(4)
        record.record(5)
        record.record(5)
        self.assertFalse(record.turn_off_detected)
        record.record(15)
        record.record(2)
        record.record(3)
        record.record(3)
        record.record(16)
        self.assertTrue(record.is_running)
        self.assertFalse(record.turn_off_detected)
        record.record(15)
        record.record(13)
        record.record(4)
        record.record(5)
        record.record(4)
        self.assertFalse(record.turn_off_detected)
        record.record(4)
        self.assertFalse(record.turn_off_detected)
        record.record(4)
        self.assertTrue(record.turn_off_detected)
        record.clear()
        self.assertFalse(record.turn_off_detected)

    def test_ignore_invalid_turn_off(self):
        record = Tracker(sample_size=5, threshold=10,
                         running_detection_points=2, stopped_detection_points=5)
        self.assertFalse(record.turn_off_detected)
        record.record(15)
        record.record(13)
        record.record(4)
        record.record(4)
        record.record(16)
        self.assertFalse(record.turn_off_detected)
        record.record(5)
        record.record(3)
        record.record(4)
        record.record(5)
        record.record(5)
        self.assertTrue(record.turn_off_detected)
        record.clear()
        self.assertFalse(record.turn_off_detected)
        record.record(15)
        record.record(2)
        record.record(4)
        record.record(4)
        record.record(4)
        self.assertFalse(record.turn_off_detected)
        record.record(5)
        record.record(3)
        record.record(4)
        record.record(5)
        record.record(5)
        self.assertFalse(record.turn_off_detected)


if __name__ == '__main__':
    unittest.main()
