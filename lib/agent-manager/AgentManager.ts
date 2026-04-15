import OpenAI from 'openai';
import OpenRouter from '@openrouter/sdk';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { config } from './config.js';

export type Role = 'system' | 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
}

export class AgentManager {
  private localClient: OpenAI;
  private openRouterClient: OpenRouter | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;

  constructor() {
    // Tier 1: Local
    this.localClient = new OpenAI({
      baseURL: config.local.baseUrl,
      apiKey: 'not-needed', // LM Studio usually doesn't need an API key
    });

    // Tier 2: OpenRouter
    if (config.openRouter.apiKey) {
      this.openRouterClient = new OpenRouter({
        apiKey: config.openRouter.apiKey,
      });
    }

    // Tier 3: Gemini
    if (config.gemini.apiKey) {
      this.geminiClient = new GoogleGenerativeAI(config.gemini.apiKey);
    }
  }

  async chat(messages: Message[]): Promise<string> {
    // Try Tier 1: Local LM Studio
    try {
      console.log('Attempting Tier 1: Local LM Studio...');
      const response = await this.localClient.chat.completions.create({
        model: config.local.model,
        messages: messages,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        console.log('Tier 1 Success');
        return content;
      }
    } catch (error) {
      console.warn('Tier 1 failed. Falling back to Tier 2...', error instanceof Error ? error.message : error);
    }

    // Try Tier 2: OpenRouter
    if (this.openRouterClient) {
      try {
        console.log('Attempting Tier 2: OpenRouter...');
        const result = this.openRouterClient.callModel({
          model: config.openRouter.model,
          input: messages.map(m => ({ role: m.role, content: m.content })),
        });
        const text = await result.getText();
        console.log('Tier 2 Success');
        return text;
      } catch (error) {
        console.warn('Tier 2 failed. Falling back to Tier 3...', error instanceof Error ? error.message : error);
      }
    } else {
      console.warn('Tier 2 skipped: No OpenRouter API key provided.');
    }

    // Try Tier 3: Gemini
    if (this.geminiClient) {
      try {
        console.log('Attempting Tier 3: Gemini...');
        const model = this.geminiClient.getGenerativeModel({ model: config.gemini.model });
        
        // Convert messages to Gemini format
        // Gemini expects generic system instructions and history to be somewhat differently mapped,
        // but for a simple implementation we can map system -> user, or just stringify history.
        // A better approach for `generateContent` is using the `contents` array with roles 'user' and 'model'.
        
        let systemInstruction = '';
        const geminiHistory: any[] = [];
        
        let contents = [];
        for (const msg of messages) {
            if (msg.role === 'system') {
                systemInstruction += msg.content + '\n';
            } else {
                contents.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content } as Part]
                });
            }
        }

        // Apply system instruction to the first user message if exists, 
        // since setting systemInstruction explicitly requires specific API versions
        if (systemInstruction && contents.length > 0 && contents[0].role === 'user') {
            contents[0].parts[0].text = `System Instruction: ${systemInstruction}\n\nUser: ${contents[0].parts[0].text}`;
        }

        const response = await model.generateContent({ contents });
        console.log('Tier 3 Success');
        return response.response.text();

      } catch (error) {
        console.error('Tier 3 failed.', error instanceof Error ? error.message : error);
        throw new Error('All tiers failed to process the request.');
      }
    } else {
      throw new Error('All available tiers failed and no Gemini API key provided for Tier 3.');
    }
  }
}
