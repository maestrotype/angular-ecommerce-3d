import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import { SettingsService } from '../settings/settings.service';
import { DescribeProductCopyDto } from './dto/describe-product-copy.dto';

export interface ProductCopyDraft {
  name_en?: string;
  name_ru?: string;
  name_ua?: string;
  description_en?: string;
  description_ru?: string;
  description_ua?: string;
  caption?: string;
  source: 'huggingface' | 'caption-template';
}

const HF_INFERENCE = 'https://router.huggingface.co/hf-inference/models';
const HF_CHAT = 'https://router.huggingface.co/v1/chat/completions';
const CAPTION_MODEL = 'Salesforce/blip-image-captioning-base';
const TEXT_MODEL = 'HuggingFaceTB/SmolLM3-3B';

@Injectable()
export class AiCopyService {
  private readonly logger = new Logger(AiCopyService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async describe(dto: DescribeProductCopyDto): Promise<ProductCopyDraft> {
    const token = await this.getHfToken();
    const caption = await this.captionFirstImage(dto.imageUrls || [], token);
    const context = this.contextBlock(dto, caption);

    if (token) {
      try {
        const generated = await this.expandWithChat(context, token);
        if (generated) {
          return { ...generated, caption, source: 'huggingface' };
        }
      } catch (error) {
        this.logger.warn(`HF chat expand failed, using caption templates: ${(error as Error).message}`);
      }
    }

    return { ...this.expandWithTemplates(dto, caption), caption, source: 'caption-template' };
  }

  private async getHfToken(): Promise<string> {
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.hfToken')).catch(() => null);
    return String(setting?.value ?? process.env.HF_TOKEN ?? '').trim();
  }

  private async captionFirstImage(urls: string[], token: string): Promise<string> {
    const url = urls.find((item) => !!String(item || '').trim());
    if (!url) {
      return '';
    }
    try {
      const image = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
        timeout: 12000,
        maxContentLength: 6 * 1024 * 1024,
      });
      const rawContentType = image.headers['content-type'];
      const contentType =
        typeof rawContentType === 'string'
          ? rawContentType
          : Array.isArray(rawContentType) && typeof rawContentType[0] === 'string'
            ? rawContentType[0]
            : 'image/jpeg';
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': contentType,
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await axios.post(
        `${HF_INFERENCE}/${CAPTION_MODEL}`,
        Buffer.from(image.data),
        { headers, timeout: 20000, validateStatus: () => true },
      );
      return this.parseCaption(response.data);
    } catch (error) {
      this.logger.warn(`Image caption failed: ${(error as Error).message}`);
      return '';
    }
  }

  private parseCaption(data: unknown): string {
    if (Array.isArray(data) && data[0]?.generated_text) {
      return String(data[0].generated_text).trim();
    }
    if (data && typeof data === 'object' && 'generated_text' in data) {
      return String((data as { generated_text: string }).generated_text || '').trim();
    }
    return '';
  }

  private async expandWithChat(context: string, token: string): Promise<Omit<ProductCopyDraft, 'caption' | 'source'> | null> {
    const response = await axios.post(
      HF_CHAT,
      {
        model: TEXT_MODEL,
        max_tokens: 700,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'You write ecommerce product copy. Reply with JSON only, no markdown. Keys: name_en, name_ru, name_ua, description_en, description_ru, description_ua. Descriptions: 3-5 sentences, commercial, no medical or unverified claims.',
          },
          { role: 'user', content: context },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000,
        validateStatus: () => true,
      },
    );
    if (response.status >= 400) {
      throw new Error(`HF chat HTTP ${response.status}`);
    }
    const content = response.data?.choices?.[0]?.message?.content;
    return this.parseCopyJson(content);
  }

  private parseCopyJson(raw: unknown): Omit<ProductCopyDraft, 'caption' | 'source'> | null {
    const text = String(raw ?? '').trim();
    if (!text) {
      return null;
    }
    const jsonText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const start = jsonText.indexOf('{');
    const end = jsonText.lastIndexOf('}');
    if (start < 0 || end <= start) {
      return null;
    }
    try {
      const parsed = JSON.parse(jsonText.slice(start, end + 1)) as Record<string, unknown>;
      const pick = (key: string) => {
        const value = String(parsed[key] ?? '').trim();
        return value || undefined;
      };
      const draft = {
        name_en: pick('name_en'),
        name_ru: pick('name_ru'),
        name_ua: pick('name_ua'),
        description_en: pick('description_en'),
        description_ru: pick('description_ru'),
        description_ua: pick('description_ua'),
      };
      if (!draft.description_en && !draft.description_ru && !draft.description_ua) {
        return null;
      }
      return draft;
    } catch {
      return null;
    }
  }

  private contextBlock(dto: DescribeProductCopyDto, caption: string): string {
    const specs = (dto.specifications || [])
      .filter((row) => row.key && row.value)
      .map((row) => `${row.key}: ${row.value}`)
      .join('; ');
    return [
      `Photo caption: ${caption || 'none'}`,
      `Name EN: ${dto.name_en || ''}`,
      `Name RU: ${dto.name_ru || ''}`,
      `Name UA: ${dto.name_ua || ''}`,
      `Category: ${dto.categoryLabel || dto.category || ''}`,
      `Specs: ${specs || 'none'}`,
      `Existing description EN: ${dto.description_en || ''}`,
    ].join('\n');
  }

  private expandWithTemplates(dto: DescribeProductCopyDto, caption: string): Omit<ProductCopyDraft, 'caption' | 'source'> {
    const name = dto.name_en || dto.name_ru || dto.name_ua || 'This product';
    const collection = dto.categoryLabel || dto.category || 'the catalog';
    const photoEn = caption ? ` The listing photo shows ${caption.replace(/\.$/, '')}.` : '';
    const photoRu = caption ? ` На фото: ${caption.replace(/\.$/, '')}.` : '';
    const photoUa = caption ? ` На фото: ${caption.replace(/\.$/, '')}.` : '';
    return {
      name_en: dto.name_en || undefined,
      name_ru: dto.name_ru || dto.name_en || undefined,
      name_ua: dto.name_ua || dto.name_en || undefined,
      description_en:
        `${name} belongs in ${collection}.${photoEn} Turn the 3D model to judge scale, materials, and finish from every angle. Copy is a starting point — keep claims modest and match what the photos actually show. Ready for the catalog once you confirm price, stock, and specs.`,
      description_ru:
        `${name} в категории «${collection}».${photoRu} В 3D оцените масштаб, материалы и отделку со всех сторон. Это черновик: не обещайте того, чего нет на фото. Перед публикацией проверьте цену, остаток и характеристики.`,
      description_ua:
        `${name} у категорії «${collection}».${photoUa} У 3D оцініть масштаб, матеріали й оздоблення з усіх боків. Це чернетка: не обіцяйте того, чого немає на фото. Перед публікацією перевірте ціну, залишок і характеристики.`,
    };
  }
}
