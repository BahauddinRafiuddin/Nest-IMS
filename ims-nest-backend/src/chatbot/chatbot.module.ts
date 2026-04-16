import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { GroqProvider } from './providers/groq.provider';
import { IntentClassifierStrategy } from './strategies/intent-classifier.strategy';
import { ContextBuilderStrategy } from './strategies/context-builder.strategy';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService,GroqProvider,IntentClassifierStrategy,ContextBuilderStrategy],
  exports:[ChatbotService]
})
export class ChatbotModule {}
