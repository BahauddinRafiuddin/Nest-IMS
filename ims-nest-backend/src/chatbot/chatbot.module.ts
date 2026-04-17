import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { GroqProvider } from './providers/groq.provider';
import { IntentClassifierStrategy } from './strategies/intent-classifier.strategy';
import { ContextBuilderStrategy } from './strategies/context-builder.strategy';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[AuthModule],
  controllers: [ChatbotController],
  providers: [ChatbotService,GroqProvider,IntentClassifierStrategy,ContextBuilderStrategy],
  exports:[ChatbotService]
})
export class ChatbotModule {}
