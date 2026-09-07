import { hasNoWebsite, pickCategory, pickPhone, type PlaceResult } from '../google-places';

describe('google-places helpers', () => {
  const base: PlaceResult = {
    id: 'abc',
    displayName: { text: 'Test' },
    types: ['cafe', 'food'],
    primaryType: 'cafe',
  };

  test('hasNoWebsite is true when websiteUri is missing or empty', () => {
    expect(hasNoWebsite({ ...base })).toBe(true);
    expect(hasNoWebsite({ ...base, websiteUri: '' })).toBe(true);
    expect(hasNoWebsite({ ...base, websiteUri: '   ' })).toBe(true);
  });

  test('hasNoWebsite is false when websiteUri is present', () => {
    expect(hasNoWebsite({ ...base, websiteUri: 'https://foo.com' })).toBe(false);
  });

  test('pickCategory prefers primaryType then falls back to types[0]', () => {
    expect(pickCategory(base)).toBe('cafe');
    expect(pickCategory({ ...base, primaryType: undefined })).toBe('cafe');
    expect(pickCategory({ ...base, primaryType: undefined, types: [] })).toBeUndefined();
  });

  test('pickPhone prefers national then international', () => {
    expect(
      pickPhone({ ...base, nationalPhoneNumber: '09 111', internationalPhoneNumber: '+64 9 111' }),
    ).toBe('09 111');
    expect(pickPhone({ ...base, internationalPhoneNumber: '+64 9 222' })).toBe('+64 9 222');
    expect(pickPhone({ ...base })).toBeUndefined();
  });
});
