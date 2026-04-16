import { Injectable } from '@nestjs/common';
import { GroqProvider } from './providers/groq.provider';
import { IntentClassifierStrategy } from './strategies/intent-classifier.strategy';
import { ContextBuilderStrategy } from './strategies/context-builder.strategy';
import { getSession, setSession, clearSession } from './utils/chat-session.store';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly groqProvider: GroqProvider,
    private readonly intentStrategy: IntentClassifierStrategy,
    private readonly contextStrategy: ContextBuilderStrategy,
    private readonly prisma: PrismaService,
    private authService: AuthService
  ) { }

  async handlePrivateChat(user: any, message: string) {
    const { role } = user;

    // 1. Intent
    const intent = await this.intentStrategy.classify(message, role);

    // 🚫 Restriction
    if (intent === 'restricted') {
      return {
        reply:
          'I am specialized only in internship platform queries. I cannot help with coding.',
      };
    }

    // 2. Context
    const context = await this.contextStrategy.build(intent, user);

    // 3. Prompt
    const systemPrompt = `
    You are an assistant for Internship Management System.
    IMPORTANT:
    - You are NOT the user
    - You are an assistant helping the user
    - Always refer to user data as "your", not "my"
    - Currency must be in INR (₹), not dollars

    Example:
    ❌ Wrong: My name is Rahul
    ✅ Correct: Your name is Rahul


    Role: ${role}
    Intent: ${intent}

    Context:
    ${context ? JSON.stringify(context) : 'No data available'}

    Rules:
    - Answer only from context
    - Use "your" when referring to user data
    - Max 3 sentences
    - If no data say "No data found"
    `;

    // 4. LLM
    const reply = await this.groqProvider.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ]);

    return { reply, intent };
  }

  async handlePublicChat(userId: string, message: string) {
    const session = getSession(userId);

    // STEP 1: NAME
    if (session.step === 'ask_name') {
      setSession(userId, {
        ...session,
        name: message,
        step: 'ask_email',
      });

      return { reply: "Great! Now enter your email." };
    }

    // STEP 2: EMAIL
    if (session.step === 'ask_email') {
      const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]{2,}@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailRegex.test(message)) {
        return { reply: "Please enter a valid email." };
      }

      setSession(userId, {
        ...session,
        email: message,
        step: 'ask_password',
      });

      return { reply: "Perfect! Now set a password." };
    }

    // STEP 3: PASSWORD
    if (session.step === 'ask_password') {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!passwordRegex.test(message)) {
        return { reply: "Password Must Be Must have 1 Cap, 1 Num, 1 Special (Min 8)" }
      }
      const data = {
        ...session,
        message
      }
      try {
        await this.authService.register(data)
        clearSession(userId);
        return {
          reply: "🎉 Registration successful! You can now login.",
        };

      } catch (error) {
        return {
          reply: error,
        };
      }

    }

    // START FLOW
    if (message.toLowerCase().includes('register')) {
      setSession(userId, { step: 'ask_name' });

      return {
        reply: "Let's get you registered! What's your name?",
      };
    }

    return { reply: "How can I help you?" };
  }
}
