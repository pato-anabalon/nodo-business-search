import { classifyWebsite, pickCategory, pickPhone, type PlaceResult } from '../google-places';
import { WebsiteType } from '@prisma/client';

describe('google-places helpers', () => {
  const base: PlaceResult = {
    id: 'abc',
    displayName: { text: 'Test' },
    types: ['cafe', 'food'],
    primaryType: 'cafe',
  };

  describe('classifyWebsite', () => {
    test('NONE when uri is null/empty/whitespace', () => {
      expect(classifyWebsite(null).type).toBe(WebsiteType.NONE);
      expect(classifyWebsite(undefined).type).toBe(WebsiteType.NONE);
      expect(classifyWebsite('').type).toBe(WebsiteType.NONE);
      expect(classifyWebsite('   ').type).toBe(WebsiteType.NONE);
    });

    test('FACEBOOK for facebook.com / fb.me / fb.com', () => {
      expect(classifyWebsite('https://facebook.com/nodo').type).toBe(WebsiteType.FACEBOOK);
      expect(classifyWebsite('https://www.facebook.com/nodo').type).toBe(WebsiteType.FACEBOOK);
      expect(classifyWebsite('https://fb.me/nodo').type).toBe(WebsiteType.FACEBOOK);
      expect(classifyWebsite('https://fb.com/nodo').type).toBe(WebsiteType.FACEBOOK);
    });

    test('extracts handle from social URL', () => {
      const fb = classifyWebsite('https://facebook.com/pilar.cafe');
      expect(fb.type).toBe(WebsiteType.FACEBOOK);
      expect(fb.handle).toBe('pilar.cafe');

      const ig = classifyWebsite('https://instagram.com/nodo.co.nz/');
      expect(ig.type).toBe(WebsiteType.INSTAGRAM);
      expect(ig.handle).toBe('nodo.co.nz');

      const li = classifyWebsite('https://linkedin.com/company/nodo/');
      expect(li.type).toBe(WebsiteType.LINKEDIN);
      expect(li.handle).toBe('company/nodo');
    });

    test('INSTAGRAM / WHATSAPP / LINKTREE / OTHER_SOCIAL', () => {
      expect(classifyWebsite('https://instagram.com/nodo').type).toBe(WebsiteType.INSTAGRAM);
      expect(classifyWebsite('https://wa.me/6421234567').type).toBe(WebsiteType.WHATSAPP);
      expect(classifyWebsite('https://linktr.ee/nodo').type).toBe(WebsiteType.LINKTREE);
      expect(classifyWebsite('https://tiktok.com/@nodo').type).toBe(WebsiteType.OTHER_SOCIAL);
      expect(classifyWebsite('https://youtube.com/nodo').type).toBe(WebsiteType.OTHER_SOCIAL);
    });

    test('REAL for own domains', () => {
      expect(classifyWebsite('https://nodo.co.nz').type).toBe(WebsiteType.REAL);
      expect(classifyWebsite('https://www.pilarcafe.co.nz/menu').type).toBe(WebsiteType.REAL);
    });

    test('REAL for invalid URLs (fail-safe: treat as real to avoid false positives)', () => {
      expect(classifyWebsite('not a url').type).toBe(WebsiteType.REAL);
    });
  });

  describe('pickCategory / pickPhone', () => {
    test('pickCategory prefers primaryType then falls back to types[0]', () => {
      expect(pickCategory(base)).toBe('cafe');
      expect(pickCategory({ ...base, primaryType: undefined })).toBe('cafe');
      expect(pickCategory({ ...base, primaryType: undefined, types: [] })).toBeUndefined();
    });

    test('pickPhone prefers national then international', () => {
      expect(
        pickPhone({
          ...base,
          nationalPhoneNumber: '09 111',
          internationalPhoneNumber: '+64 9 111',
        }),
      ).toBe('09 111');
      expect(pickPhone({ ...base, internationalPhoneNumber: '+64 9 222' })).toBe('+64 9 222');
      expect(pickPhone({ ...base })).toBeUndefined();
    });
  });
});
