import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PerspectiveService {
  constructor(private configService: ConfigService) {}

  async analyzeComment(comment: string) {
    try {
      const apiKey = this.configService.get<string>('PERSPECTIVE_API_KEY');

      const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`;

      const response = await axios.post(url, {
        comment: { text: comment },
        languages: ['en'],
        requestedAttributes: {
          TOXICITY: {},
          INSULT: {},
          PROFANITY: {},
          THREAT: {},
          IDENTITY_ATTACK: {},
        },
      });

      return response.data.attributeScores;

    } catch (error) {
      console.log('Perspective API error:', error);
      return null;
    }
  }
}