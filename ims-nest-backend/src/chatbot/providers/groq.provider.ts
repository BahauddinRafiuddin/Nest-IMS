import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { AIProvider } from '../interfaces/provider.interface';

@Injectable()
export class GroqProvider implements AIProvider {
  private groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  async generateResponse(messages: any[], options: any = {}): Promise<string> {
    try {
      const response = await this.groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages,
        temperature: 0.3,
        max_tokens: options.max_tokens ?? 200,
      });

      const content = response.choices?.[0]?.message?.content;

      //  Handle null safely
      if (!content) {
        return "I'm sorry, I couldn't process your request at the moment.";
      }

      return content;
    } catch (error) {
      console.error("Groq Error:", error);

      //  Never throw raw error to user
      return "Something went wrong while processing your request.";
    }
  }
}