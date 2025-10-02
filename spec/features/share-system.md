# Share System

## 1) Context (why this exists)
Users want to share their dating achievements, statistics, and progress with friends on social media. The sharing system creates shareable images and content while protecting user privacy through configurable data filtering and anonymization.

## 2) User Journey (step-by-step)
- User clicks "Share" button on any page (Analytics, Data Vault, or specific profiles)
- A preview modal opens showing what will be shared
- User selects sharing format (image, text, markdown, or JSON)
- User adjusts privacy settings to control what data is included
- User can anonymize girl names (shows as "Girl A", "Girl B" instead of real names)
- User can filter out sensitive statistics or achievements
- User chooses sharing method: copy to clipboard, download file, or generate shareable URL
- System generates shareable content with watermarks and branding
- Share history tracks what has been shared for future reference

## 3) Technology (what it uses today)
Uses React Context for state management and Canvas API for image generation. Core implementation is in:
- `lib/share/ShareService.ts` - Main sharing logic and content generation (~1-200+)
- `lib/share/ShareContext.tsx` - React context for sharing state (~1-316)
- `lib/share/privacy.ts` - Data filtering and anonymization
- `lib/share/generators/CardGenerator.ts` - Canvas-based image creation
- `lib/share/generators/BadgeGenerator.ts` - Achievement badge creation
- `components/sharing/ShareButton.tsx` - Reusable share button components
- `components/sharing/SharePreviewModal.tsx` - Preview and options modal

localStorage keys used:
- `cpn-share-preferences` - User's default sharing preferences
- `cpn-share-history` - History of shared content

The system supports multiple output formats and privacy levels with client-side image generation.

## 4) Design Directions (what it looks/feels like)
Share buttons appear throughout the app with consistent styling. Preview modal shows live preview of shareable content with format toggles. Privacy controls use clear toggles and explanations. Generated images follow brand guidelines with yellow accent colors and dark themes. Shareable stat cards have professional layouts with key metrics prominently displayed. Achievement badges use tier-appropriate colors (bronze, silver, gold, platinum) with emoji icons.

## Data We Store (plain-English "table idea")
Share preferences stored in localStorage:
- `defaultFormat` (preferred sharing format: image, text, markdown, JSON)
- `defaultPrivacy` (anonymization settings and data filtering rules)
- `autoWatermark` (whether to include CPN branding automatically)
- `quickShareEnabled` (allow one-click sharing with saved preferences)

Share history tracking:
- `shareId` (unique identifier for each share action)
- `timestamp` (when content was shared)
- `format` (what format was used)
- `contentType` (stat card, achievement badge, comparison report)
- `privacyLevel` (what anonymization was applied)

## Who Can See What (safety/permissions in plain words)
All sharing happens client-side with user-controlled privacy settings. Users can choose to anonymize names, hide sensitive stats, or share only aggregate data. No personal data is sent to external servers unless the user explicitly shares it. Privacy filtering happens before content generation, so sensitive data never leaves the user's control.

## Acceptance Criteria (done = true)
- Share buttons work on Analytics, Data Vault, and profile pages
- Preview modal shows accurate representation of shared content
- Privacy controls successfully anonymize girl names when enabled
- Image generation creates professional-looking stat cards
- Achievement badge generation works for all tier levels
- Copy to clipboard works in supported browsers
- Download functionality creates properly named files
- Share history correctly tracks sharing activity
- Privacy preferences persist between sessions
- Mobile responsive design works for sharing flows
- Generated content includes appropriate watermarks and branding

## Open Questions / Assumptions
Canvas-based image generation may not work in all browsers or environments. URL sharing feature exists but may require backend support for full implementation. Share history storage could grow large over time and may need cleanup mechanisms. Privacy filtering assumptions may not cover all sensitive data types.

## Code References
- `lib/share/ShareService.ts` - Core sharing functionality and content generation
- `lib/share/ShareContext.tsx: 1-316` - React context for sharing state management
- `lib/share/privacy.ts` - Data filtering and anonymization logic
- `lib/share/generators/CardGenerator.ts` - Canvas-based image generation
- `components/sharing/ShareButton.tsx` - Reusable share button components
- `components/sharing/SharePreviewModal.tsx` - Preview modal with options
- `app/share/page.tsx` - Share dashboard with achievement badges