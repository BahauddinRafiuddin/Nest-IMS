import { Injectable } from '@nestjs/common';
import { GroqProvider } from '../providers/groq.provider';

@Injectable()
export class IntentClassifierStrategy {
  constructor(private readonly groqProvider: GroqProvider) { }

  private forbiddenKeywords = [
    'code',
    'programming',
    'python',
    'javascript',
    'java',
    'c++',
    'algorithm',
    'function',
    'loop',
    'array',
    'odd even',
  ];

  private roleIntentMap: Record<string, string[]> = {
    INTERN: [
      "profile_details",
      "tasks",
      "programs",
      "performance",
      "certificate",
      "general",
    ],
    MENTOR: [
      "profile_details",
      "tasks",
      "interns",
      "programs",
      "performance",
      "general",
    ],
    ADMIN: [
      "profile_details",
      "interns",
      "mentors",
      "companies",
      "programs",
      "finance",
      "general",
      "interns_mentors",
      "commission",
    ],
    SUPER_ADMIN: [
      "profile_details",
      "companies",
      "general",
      "finance",
      "commission",
    ],
    PUBLIC_USER: [
      "companies",
      "programs",
      "join_requests",
      "general",
    ],
  };

  async classify(message: string, role: string): Promise<string> {
    const lower = message.toLowerCase();

    //  1. HARD BLOCK
    if (this.forbiddenKeywords.some(k => lower.includes(k))) {
      return 'restricted';
    }

    
    //  2. RULE BASED
    let intent = this.ruleBasedIntent(lower);

    //  3. AI FALLBACK
    if (!intent) {
      intent = await this.getAIIntent(message, role);
    }

    //  4. ROLE VALIDATION (VERY IMPORTANT)
    const normalizedRole = role.toUpperCase();
    const allowedIntents = this.roleIntentMap[normalizedRole] || [];

    if (!allowedIntents.includes(intent)) {
      return 'restricted';
    }

    return intent;
  }

  private ruleBasedIntent(lower: string): string | null {
    if (lower.includes('profile')) return 'profile_details';
    if (lower.includes('task')) return 'tasks';
    if (lower.includes('program')) return 'programs';
    if (lower.includes('progress') || lower.includes('performance')) return 'performance';
    if (lower.includes('certificate')) return 'certificate';
    if (lower.includes('company')) return 'companies';
    if (lower.includes('mentor')) return 'mentors';
    if (lower.includes('intern')) return 'interns';
    if (lower.includes('finance') || lower.includes('revenue')) return 'finance';
    if (lower.includes('commission')) return 'commission';
    if (lower.includes('join') || lower.includes('apply')) return 'join_requests';

    return null;
  }

  private async getAIIntent(message: string, role: string): Promise<string> {
    try {
      const normalizedRole = role.toUpperCase();
      const allowedIntents = this.roleIntentMap[normalizedRole] || ['general'];

      const prompt = `
      Classify the user message into ONE intent.

      Allowed intents:
      ${allowedIntents.join(', ')}

      Rules:
      - Return ONLY one word from the list above
      - No explanation
      - No sentence
      - No punctuation
      - If unsure return "general"

      User Role: ${normalizedRole}
      Message: "${message}"
      `;

      const response = await this.groqProvider.generateResponse(
        [{ role: 'system', content: prompt }],
        { max_tokens: 10 }
      );

      const intent = response.trim().toLowerCase().replace(/[^a-z_]/g, '');;

      // ✅ SAFETY CHECK (VERY IMPORTANT)
      if (!allowedIntents.includes(intent)) {
        return 'general';
      }

      return intent;

    } catch (error) {
      console.error('AI Intent Error:', error);
      return 'general';
    }
  }
}