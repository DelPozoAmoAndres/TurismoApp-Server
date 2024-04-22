jest.mock('@models/userSchema');
import UserSchema from '@models/userSchema';
const mockedUserSchema = UserSchema as jest.Mocked<typeof UserSchema>;
jest.mock('@models/activitySchema');
import ActivitySchema from '@models/activitySchema';
const mockedActivitySchema = ActivitySchema as jest.Mocked<typeof ActivitySchema>;
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      paymentIntents: {
        retrieve: jest.fn(),
        confirm: jest.fn()
      },
      charges: {
        retrieve: jest.fn()
      },
      refunds: {
        create: jest.fn()
      }
    }
  });
});
import Stripe from 'stripe';
const mockedStripe = Stripe as jest.MockedClass<typeof Stripe>;

import StripeService from '@services/stripeService';
import UserService from '@services/userService';
import { User } from '@customTypes/user';

describe('Verify status', () => {
  let stripeService: StripeService;
  beforeEach(() => {
    stripeService = new StripeService();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When the reservation not have a status pending in the ddbb', () => {
    const user = {
      reservations: [
        {
          paymentId: 'intentId',
          state: 'success'
        }
      ]
    };
    beforeAll(() => {
      mockedUserSchema.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(user) })
    });
    test('Should return the reservation state saved in the ddbb', async () => {
      const result = await stripeService.verifyStatus('intentId');
      expect(result).toBe('success');
    });
  });

  describe('When the reservation have a status pending in the ddbb and was refunded', () => {
    const user = {
      reservations: [
        {
          paymentId: 'intentId',
          state: 'pending'
        }
      ]
    };

    const paymentIntent = {
      latest_charge: 'chargeId'
    };
    const charge = {
      refunded: true
    };
    beforeAll(() => {
      mockedUserSchema.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });
      mockedStripe.prototype.paymentIntents = {
        retrieve: jest.fn().mockResolvedValue(paymentIntent),
      } as any;

      mockedStripe.prototype.charges = {
        retrieve: jest.fn().mockResolvedValue(charge),
      } as any;
    });
    test('Should return canceled if the paymentIntent has been refunded', async () => {
      const result = await stripeService.verifyStatus('intentId');
      expect(result).toBe('canceled');
    });
  });
});