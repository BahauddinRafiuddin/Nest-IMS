import Razorpay from 'razorpay';
import { ConfigService } from '@nestjs/config';

export const RazorpayProvider = {
  provide: 'RAZORPAY',
  useFactory: (configService: ConfigService) => {
    return new Razorpay({
      key_id: configService.get('RAZORPAY_KEY_ID'),
      key_secret: configService.get('RAZORPAY_KEY_SECRET'),
    });
  },
  inject: [ConfigService],
};