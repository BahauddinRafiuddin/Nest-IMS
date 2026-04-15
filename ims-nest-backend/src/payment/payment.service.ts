import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import Razorpay from 'razorpay';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject('RAZORPAY')
    private razorpay: Razorpay,
  ) { }

  async createOrder(dto: CreateOrderDto, userId: string) {
    const { enrollmentId } = dto;

    // ✅ 1. Get Enrollment with Program
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        internId: userId,
      },
      include: {
        program: true,
      },
    });

    // ❌ Enrollment not found
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // ❌ Program is FREE
    if (enrollment.program.type === 'FREE') {
      throw new BadRequestException('This program is free');
    }

    // ❌ Already Paid
    if (enrollment.paymentStatus === 'PAID') {
      throw new BadRequestException('Already paid');
    }

    // ❌ Invalid price
    if (!enrollment.program.price || enrollment.program.price <= 0) {
      throw new BadRequestException('Invalid program price');
    }

    // ✅ 2. Create Razorpay Order
    const options = {
      amount: Math.round(enrollment.program.price * 100), // INR → paisa
      currency: 'INR',
      receipt: `rcpt_${enrollment.id.slice(0, 10)}_${Date.now()}`
    };

    const order = await this.razorpay.orders.create(options);

    // ✅ 3. Return response
    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }

  async verifyPayment(dto: VerifyPaymentDto, userId: string) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      enrollmentId,
    } = dto;

    // ✅ 1. Verify Signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET')!;
    if (!secret) {
      throw new Error('RAZORPAY_KEY_SECRET is not defined in environment');
    }
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // ✅ 2. Run Transaction (CRITICAL)
    return await this.prisma.$transaction(async (tx) => {
      // 🔍 Fetch enrollment + relations
      const enrollment = await tx.enrollment.findFirst({
        where: {
          id: enrollmentId,
          internId: userId,
        },
        include: {
          program: {
            include: {
              company: true,
            },
          },
        },
      });

      if (!enrollment) {
        throw new NotFoundException('Enrollment not found');
      }

      if (enrollment.paymentStatus === 'PAID') {
        throw new BadRequestException('Already paid');
      }

      const program = enrollment.program;
      const company = program.company;
      const amount = program.price;

      // ✅ 3. Commission Calculation
      const commissionPercent = company.commissionPercentage;

      const superAdminCommission =
        (amount * commissionPercent) / 100;

      const companyEarning =
        amount - superAdminCommission;

      // ✅ 4. Create Payment Record
      const payment = await tx.payment.create({
        data: {
          internId: enrollment.internId,
          companyId: company.id,
          programId: program.id,
          enrollmentId: enrollment.id,
          totalAmount: amount,
          superAdminCommission,
          commissionPercentage: commissionPercent,
          companyEarning,
          paymentStatus: 'SUCCESS',
          transactionId: razorpay_payment_id,
          paymentMethod: 'razorpay',
        },
      });

      // ✅ 5. Update Enrollment
      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          paymentStatus: 'PAID',
          paymentId: payment.id,
        },
      });

      // ✅ 6. Update / Create Wallet
      let wallet = await tx.companyWallet.findUnique({
        where: { companyId: company.id },
      });

      if (!wallet) {
        wallet = await tx.companyWallet.create({
          data: {
            companyId: company.id,
            totalEarning: 0,
            totalWithdrawn: 0,
            availableBalance: 0,
          },
        });
      }

      await tx.companyWallet.update({
        where: { companyId: company.id },
        data: {
          totalEarning: { increment: companyEarning },
          availableBalance: { increment: companyEarning },
        },
      });

      // ✅ 7. Return Success
      return {
        success: true,
        message: 'Payment verified and processed successfully',
      };
    });
  }

  async getMyPaymentHistory(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        internId: userId,
        paymentStatus: "SUCCESS"
      },
      include: {
        program: {
          select: {
            id: true,
            title: true
          }
        },
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }, orderBy: {
        createdAt: "desc"
      }
    })

    if (payments.length === 0) {
      return {
        success: true,
        summary: {
          totalPaid: 0,
          totalProgramsPurchased: 0,
          lastPaymentDate: null
        },
        payments: []
      }
    }

    const transactions = payments.map(payment => ({
      paymentId: payment.id,
      programTitle: payment.program.title,
      companyName: payment.company.name || "N/A",
      amount: payment.totalAmount,
      paymentMethod: payment.paymentMethod,
      status: payment.paymentStatus,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt
    }))

    const totalPaid = payments.reduce(
      (sum, p) => sum + p.totalAmount,
      0
    );

    const totalProgramsPurchased = payments.length;

    const lastPaymentDate = payments[0].createdAt;

    return {
      success: true,
      summary: {
        totalPaid,
        totalProgramsPurchased,
        lastPaymentDate
      },
      payments: transactions
    }
  }
}