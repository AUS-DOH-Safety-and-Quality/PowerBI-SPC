import { describe, expect, it } from "vitest";
import { settingsReference } from "powerbi-visuals-core/settings";
import settingsModel from "../src/settings";

// Regenerate the docs' settings tables with `npx vitest run -u`
describe("settings reference docs", () => {
  const pages = settingsReference(settingsModel);
  const cards = Object.keys(pages);
  for (let i = 0; i < cards.length; i++) {
    it(`matches the docs for ${cards[i]}`, async () => {
      await expect(pages[cards[i]]).toMatchFileSnapshot(`../docs/_includes/settings/${cards[i]}.md`);
    });
  }
});
