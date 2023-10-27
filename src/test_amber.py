import logging
import unittest

from amber import Amber
from mocks.mock_amber_data import amber_values_actual, amber_values_two_extremely_low

class TestAmber(unittest.TestCase):

    def test_should_charge_ev(self):
        logging.basicConfig(level=logging.DEBUG)
        # Create an instance of the Amber class
        amber = Amber()
        # self.assertTrue(amber.should_charge_ev(amber_values_actual))

        self.assertFalse(amber.should_charge_ev(amber_values_two_extremely_low))
        amber_values_two_extremely_low[1]['descriptor'] = "veryLow"
        self.assertTrue(amber.should_charge_ev(amber_values_two_extremely_low))
        self.assertFalse(amber.should_charge_ev(amber_values_two_extremely_low, 2))

        amber_values_two_extremely_low[1]['descriptor'] = "low"
        self.assertFalse(amber.should_charge_ev(amber_values_two_extremely_low))
        self.assertFalse(amber.should_charge_ev(amber_values_two_extremely_low, 2))
        self.assertTrue(amber.should_charge_ev(amber_values_two_extremely_low, 7))


if __name__ == '__main__':
    unittest.main()
