import { prisma } from '../prisma.client';
import { ok, type Result } from '@/domain/shared/result';
import type { AppError } from '@/shared/lib/errors/app-error';
import type { PromptCategory } from '@prisma/client';

const FALLBACK_PROMPTS = [
  'A cat wearing a top hat drinking tea',
  'An astronaut riding a dinosaur on Mars',
  'A superhero doing their laundry',
  'A robot cooking a gourmet pancake breakfast',
  'A pirate ship sailing on a rainbow cloud',
  'A wizard accidentally summoning a giant rubber duck',
  'A ninja delivering a birthday cake',
  'A friendly alien trying on sunglasses',
  'A squirrel preparing for winter with a jetpack',
  'A detective investigating a stolen giant donut',
];

export class PromptPoolRepository {
  async randomActive(category?: PromptCategory): Promise<Result<string, AppError>> {
    try {
      const where = {
        isActive: true,
        ...(category ? { category } : {}),
      };

      const count = await prisma.promptPool.count({ where });

      if (count === 0) {
        const randomIndex = Math.floor(Math.random() * FALLBACK_PROMPTS.length);
        return ok(FALLBACK_PROMPTS[randomIndex]!);
      }

      const skip = Math.floor(Math.random() * count);
      const prompt = await prisma.promptPool.findFirst({
        where,
        skip,
      });

      if (!prompt) {
        const randomIndex = Math.floor(Math.random() * FALLBACK_PROMPTS.length);
        return ok(FALLBACK_PROMPTS[randomIndex]!);
      }

      return ok(prompt.text);
    } catch {
      const randomIndex = Math.floor(Math.random() * FALLBACK_PROMPTS.length);
      return ok(FALLBACK_PROMPTS[randomIndex]!);
    }
  }

  async listActive(category?: PromptCategory) {
    try {
      const where = {
        isActive: true,
        ...(category ? { category } : {}),
      };
      const prompts = await prisma.promptPool.findMany({ where });
      return ok(prompts);
    } catch {
      return ok([]);
    }
  }
}

export const promptPoolRepository = new PromptPoolRepository();
