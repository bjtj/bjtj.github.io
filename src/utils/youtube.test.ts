import { describe, it, expect } from 'vitest';
import { parseYouTubeUrl } from './youtube';

describe('parse youtube url', () => {
  it('parse playlist id', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/watch?v=eJHQSyONS5M&list=PL1FPDVeoyuPfmd_kGx0gHh62wkDmI0dZK')?.listId).toBe('PL1FPDVeoyuPfmd_kGx0gHh62wkDmI0dZK');
  });
});
