import { describe, it, expect } from 'vitest';
import { cloudinaryService } from './cloudinary.service';

describe('CloudinaryService', () => {
  it('handles image upload in test/mock mode with valid URL and publicId', async () => {
    const mockBase64 =
      'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA=';

    const result = await cloudinaryService.uploadDrawing(mockBase64, {
      publicId: 'test_drawing_turn_1',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.publicId).toContain('test_drawing_turn_1');
      expect(result.value.format).toBe('webp');
      expect(result.value.url).toBeDefined();
    }
  });

  it('handles buffer upload in mock mode', async () => {
    const buffer = Buffer.from('mock_image_binary_data');
    const result = await cloudinaryService.uploadDrawing(buffer, {
      publicId: 'buffer_test',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.publicId).toContain('buffer_test');
      expect(result.value.bytes).toBe(buffer.byteLength);
    }
  });

  it('deletes drawing without throwing error in mock mode', async () => {
    const result = await cloudinaryService.deleteDrawing('mock_public_id');
    expect(result.ok).toBe(true);
  });

  it('generates optimized CDN delivery URLs with transformations', () => {
    const transformed = cloudinaryService.getOptimizedUrl('my_drawing_123', {
      width: 640,
      height: 480,
    });
    expect(transformed).toContain('f_auto,q_auto,w_640,h_480');
    expect(transformed).toContain('my_drawing_123');
  });
});
