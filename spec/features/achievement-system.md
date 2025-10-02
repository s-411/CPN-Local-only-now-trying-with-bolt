# Achievement System

## 1) Context (why this exists)
Users need gamification and motivation to continue using the app and tracking their dating data. Achievements provide goals, recognition, and social sharing opportunities that increase engagement and retention.

## 2) User Journey (step-by-step)
- User creates profiles and data entries which automatically trigger achievement checks
- System displays notifications when new achievements are unlocked
- User can view their achievement progress on their profile or dashboard
- Achievements have four tiers: Bronze, Silver, Gold, and Platinum with increasing difficulty
- User earns points for each achievement which contribute to their overall user tier
- User can share achievement badges on social media with custom graphics
- Achievement progress shows how close users are to unlocking the next tier
- Weekly streaks, spending milestones, and efficiency metrics all unlock different achievements

## 3) Technology (what it uses today)
Uses a singleton service pattern with automatic checking and localStorage persistence. Core implementation is in:
- `lib/achievements/AchievementService.ts` - Main achievement logic and checking (~1-398)
- `lib/achievements/types.ts` - Achievement definitions and type structure
- `lib/achievements/BadgeGenerator.ts` - Canvas-based badge image generation
- Achievement progress is checked automatically whenever data changes via the main app context

localStorage key used:
- `cpn-user-achievements` - User's unlocked achievements, progress, and total points

The system includes predefined achievement definitions with requirements like "spend $500 total" or "track 10 different people" with automatic progress calculation.

## 4) Design Directions (what it looks/feels like)
Achievement notifications use toast-style popups with tier-appropriate colors. Bronze achievements use copper colors, silver uses metallic silver, gold uses bright gold, and platinum uses diamond-like styling. Badge generation creates shareable images with tier icons, descriptions, point values, and unlock dates. Progress indicators show percentage completion toward next tier. Achievement lists display with locked/unlocked states and progress bars.

## Data We Store (plain-English "table idea")
Achievement data stored in localStorage:
- `unlocked` (array of achieved accomplishments with unlock dates)
- `progress` (current progress toward locked achievements)
- `totalPoints` (sum of all earned achievement points)
- `tier` (overall user level: beginner, amateur, experienced, expert, master)

Each unlocked achievement includes:
- `id` (unique achievement identifier like "spending_bronze")
- `type` (achievement category like "spending" or "efficiency")
- `tier` (bronze, silver, gold, or platinum)
- `title` (display name like "Big Spender Bronze")
- `description` (what the achievement represents)
- `points` (point value contributing to user tier)
- `unlockedAt` (timestamp when achievement was earned)

## Who Can See What (safety/permissions in plain words)
Achievement data is stored locally in the user's browser only. Users can choose to share achievement badges publicly, but the underlying data remains private. Achievement progress calculations use the user's dating data but don't expose individual profile details when shared.

## Acceptance Criteria (done = true)
- Achievements automatically unlock when user data meets requirements
- Four-tier system (bronze, silver, gold, platinum) works correctly
- Point accumulation contributes to overall user tier progression
- Achievement badges generate with appropriate tier styling and colors
- Progress tracking shows accurate percentages toward next achievements
- Unlocked achievements persist when browser is refreshed
- Share functionality creates properly branded achievement images
- Achievement checks run automatically when data changes
- Weekly streak calculation works correctly based on data entry dates
- Spending, efficiency, and volume-based achievements all function properly

## Open Questions / Assumptions
Achievement definitions are currently hardcoded and may need a more flexible system for adding new achievements. Badge generation assumes Canvas API availability. Some achievement requirements may need balancing based on real user behavior. The tier progression system could benefit from more granular levels.

## Code References
- `lib/achievements/AchievementService.ts: 1-398` - Complete achievement system implementation
- `lib/achievements/types.ts` - Achievement definitions and TypeScript interfaces
- `lib/achievements/BadgeGenerator.ts` - Canvas-based badge image generation
- `lib/context.tsx` - Integration with main app state for automatic checking
- `app/share/page.tsx` - Achievement display and sharing interface