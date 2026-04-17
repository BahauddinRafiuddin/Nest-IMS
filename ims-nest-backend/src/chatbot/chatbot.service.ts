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

  async handlePublicChat(user: any, userMessage: string) {
    const session = getSession(user.id);
    const message = userMessage.trim();

    // REGISTER FLOW (ONLY GUEST)
    if (user.role === 'GUEST' && session.step) {
      return this.handleRegisterSteps(user.id, session, message);
    }

    // Intent
    const intent = await this.intentStrategy.classify(message, user.role);

    // RESTRICTED
    if (intent === 'restricted') {
      return {
        reply: "I am specialized only in internship platform queries.",
      };
    }

    // SPECIAL ACTIONS

    if (intent === 'register' && user.role === 'GUEST') {
      setSession(user.id, { step: 'ask_name' });

      return {
        reply: "Let's get you registered! What's your name?",
      };
    }
    if (intent === 'login') {
      return {
        reply: "You can login from the top right login button in the navbar.",
      };
    }

    const context = await this.contextStrategy.build(intent, user)

    const systemPrompt = `
    You are an AI assistant for Internship Management System.

    User Role: ${user.role}

    STRICT RULES:
    - You are NOT the user
    - Use "your" only for logged-in users
    - For GUEST → use "our platform"
    - Do NOT show restricted data
    - Do NOT generate code
    - Max 2-3 sentences

    Intent: ${intent}

    Context:
    ${context ? JSON.stringify(context) : 'No data available'}
    `;

    const reply = await this.groqProvider.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ]);

    return { reply, intent };

  }

  private async handleRegisterSteps(userId: string, session: any, message: string) {

    // NAME
    if (session.step === 'ask_name') {
      const nameRegex = /^[A-Za-z ]{3,30}$/;

      if (!nameRegex.test(message)) {
        return { reply: "❌ Enter valid name (3–30 letters)." };
      }

      setSession(userId, {
        ...session,
        name: message,
        step: 'ask_email',
      });

      return { reply: "Great! Now enter your email." };
    }

    // EMAIL
    if (session.step === 'ask_email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(message)) {
        return { reply: "❌ Invalid email." };
      }

      const existing = await this.prisma.user.findUnique({
        where: { email: message },
      });

      if (existing) {
        return { reply: "❌ Email already registered." };
      }

      setSession(userId, {
        ...session,
        email: message,
        step: 'ask_password',
      });

      return { reply: "Now set a password." };
    }

    // PASSWORD
    if (session.step === 'ask_password') {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

      if (!passwordRegex.test(message)) {
        return { reply: "❌ Weak password." };
      }

      await this.authService.register({
        name: session.name,
        email: session.email,
        password: message,
      });

      clearSession(userId);

      return {
        reply: "🎉 Registration successful! You can now login.",
      };
    }
  }
}
