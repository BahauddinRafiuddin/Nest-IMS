import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ChatDto } from './dto/chat.dto';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) { }

  @Post('private')
  @UseGuards(JwtAuthGuard)
  async privateChat(@GetUser() user: any, @Body() dto: ChatDto) {
    return this.chatbotService.handlePrivateChat(user, dto.message);
  }

  @Post('public')
  async publicChat(@Body() body: any) {
    const { message, sessionId } = body;
    let user: any = {
      id: sessionId,
      role: 'GUEST',
      companyId: null,
    };
    return this.chatbotService.handlePublicChat(user, message)
  }
}
