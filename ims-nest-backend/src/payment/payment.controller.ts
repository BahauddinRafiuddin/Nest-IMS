import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('payment')
@UseGuards(JwtAuthGuard)

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('create-order')
  @Roles(Role.INTERN)
  createOrder(@Body() dto: CreateOrderDto, @GetUser() user: any) {
    return this.paymentService.createOrder(dto, user.userId);
  }

  @Post('verify')
  @Roles(Role.INTERN)
  verifyPayment(@Body() dto: VerifyPaymentDto, @GetUser() user: any) {
    return this.paymentService.verifyPayment(dto, user.userId);
  }

  @Get('my-payment-history')
  @Roles(Role.INTERN)
  getMyPaymentHistory(@GetUser() user:any){
    return this.paymentService.getMyPaymentHistory(user.userId)
  }

}
