import crypto from 'node:crypto';
import { serverEnv } from '@/shared/config/env';
import { ok, err, type Result } from '@/domain/shared/result';
import { InternalError, ValidationError, type AppError } from '@/shared/lib/errors/app-error';
import { logger } from '../monitoring/logger';

export interface UploadDrawingResult {
  readonly url: string;
  readonly publicId: string;
  readonly format: string;
  readonly bytes: number;
}

export interface UploadDrawingOptions {
  readonly folder?: string;
  readonly publicId?: string;
  readonly tags?: string[];
}

export class CloudinaryService {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly defaultFolder: string;

  constructor() {
    this.cloudName = serverEnv.CLOUDINARY_CLOUD_NAME;
    this.apiKey = serverEnv.CLOUDINARY_API_KEY;
    this.apiSecret = serverEnv.CLOUDINARY_API_SECRET;
    this.defaultFolder = serverEnv.CLOUDINARY_UPLOAD_FOLDER;
  }

  private isMockMode(): boolean {
    return (
      !this.apiKey ||
      !this.apiSecret ||
      this.apiKey === 'dummy' ||
      this.apiSecret === 'dummy' ||
      serverEnv.NODE_ENV === 'test'
    );
  }

  /**
   * Generates a signed SHA-1 signature for Cloudinary upload parameters.
   */
  private generateSignature(params: Record<string, string | number>): string {
    const sortedKeys = Object.keys(params).sort();
    const serializedParams = sortedKeys
      .filter((key) => params[key] !== undefined && params[key] !== '')
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    return crypto
      .createHash('sha1')
      .update(serializedParams + this.apiSecret)
      .digest('hex');
  }

  /**
   * Uploads an image (Buffer, base64, or data URL) to Cloudinary.
   */
  async uploadDrawing(
    imageData: Buffer | string,
    options: UploadDrawingOptions = {}
  ): Promise<Result<UploadDrawingResult, AppError>> {
    const folder = options.folder || this.defaultFolder;
    const timestamp = Math.floor(Date.now() / 1000);

    // Mock Mode fallback for dev/test environments without live Cloudinary keys
    if (this.isMockMode()) {
      const generatedId =
        options.publicId || `drawing_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const mockPublicId = `${folder}/${generatedId}`;
      const mockUrl =
        typeof imageData === 'string' && imageData.startsWith('data:image/')
          ? imageData
          : `https://res.cloudinary.com/${this.cloudName}/image/upload/v${timestamp}/${mockPublicId}.webp`;

      logger.info(
        { mockPublicId, mockUrl: mockUrl.slice(0, 50) + '...' },
        '[CloudinaryService] Using mock drawing upload'
      );

      const estimatedBytes =
        imageData instanceof Buffer
          ? imageData.byteLength
          : typeof imageData === 'string'
            ? Math.round(imageData.length * 0.75)
            : 1024;

      return ok({
        url: mockUrl,
        publicId: mockPublicId,
        format: 'webp',
        bytes: estimatedBytes,
      });
    }

    try {
      const uploadParams: Record<string, string | number> = {
        folder,
        timestamp,
      };

      if (options.publicId) {
        uploadParams.public_id = options.publicId;
      }
      if (options.tags && options.tags.length > 0) {
        uploadParams.tags = options.tags.join(',');
      }

      const signature = this.generateSignature(uploadParams);

      const formData = new FormData();
      formData.append('api_key', this.apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', folder);

      if (options.publicId) {
        formData.append('public_id', options.publicId);
      }
      if (options.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }

      if (imageData instanceof Buffer) {
        const blob = new Blob([new Uint8Array(imageData)], { type: 'image/webp' });
        formData.append('file', blob, 'drawing.webp');
      } else if (typeof imageData === 'string') {
        // Base64 or Data URI
        formData.append('file', imageData);
      } else {
        return err(new ValidationError('Invalid image data format provided.'));
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(
          { status: response.status, errorText },
          '[CloudinaryService] Cloudinary API upload failed'
        );
        return err(
          new InternalError(
            'CLOUDINARY_UPLOAD_FAILED',
            `Cloudinary upload failed: ${response.statusText}`
          )
        );
      }

      const data = (await response.json()) as {
        secure_url: string;
        public_id: string;
        format: string;
        bytes: number;
      };

      return ok({
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        bytes: data.bytes,
      });
    } catch (error) {
      logger.error({ error }, '[CloudinaryService] Unexpected upload error');
      return err(
        new InternalError(
          'STORAGE_ERROR',
          error instanceof Error ? error.message : 'Unknown storage error'
        )
      );
    }
  }

  /**
   * Deletes a drawing from Cloudinary by public ID.
   */
  async deleteDrawing(publicId: string): Promise<Result<void, AppError>> {
    if (this.isMockMode()) {
      logger.info({ publicId }, '[CloudinaryService] Mock deletion successful');
      return ok(undefined);
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = this.generateSignature({ public_id: publicId, timestamp });

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('api_key', this.apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        return err(
          new InternalError('CLOUDINARY_DELETE_FAILED', 'Failed to delete asset from Cloudinary.')
        );
      }

      return ok(undefined);
    } catch (error) {
      logger.error({ error, publicId }, '[CloudinaryService] Delete error');
      return err(new InternalError('STORAGE_ERROR', 'Cloudinary deletion failed.'));
    }
  }

  /**
   * Constructs an optimized delivery URL with auto format and quality transformations.
   */
  getOptimizedUrl(
    publicIdOrUrl: string,
    transforms?: { width?: number; height?: number; format?: string; quality?: string }
  ): string {
    if (publicIdOrUrl.startsWith('data:') || publicIdOrUrl.startsWith('blob:')) {
      return publicIdOrUrl;
    }

    if (!publicIdOrUrl.includes('cloudinary.com')) {
      const transformParts: string[] = ['f_auto', 'q_auto'];
      if (transforms?.width) transformParts.push(`w_${transforms.width}`);
      if (transforms?.height) transformParts.push(`h_${transforms.height}`);
      if (transforms?.format) transformParts.push(`f_${transforms.format}`);
      if (transforms?.quality) transformParts.push(`q_${transforms.quality}`);

      return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformParts.join(',')}/${publicIdOrUrl}`;
    }

    return publicIdOrUrl;
  }
}

export const cloudinaryService = new CloudinaryService();
