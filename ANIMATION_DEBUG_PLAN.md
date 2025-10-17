# Animation Debug Plan

## Current Issues

### 1. FAB Menu Items Not Visible
**Symptoms**: 
- Logs show animations running (200ms duration)
- Expand/collapse callbacks fire
- But menu items don't appear on screen

**Changes Made**:
- Changed menu item opacity from interpolated `menuItemOpacity` to direct `menuItemAnim1` and `menuItemAnim2`
- Added `pointerEvents` to prevent invisible items from blocking touches
- Increased `zIndex` on parent and menu items

**Expected Result**:
- Menu items should now fade in and slide up when FAB is clicked
- Each item uses its own animation value

### 2. Header Appears Then Disappears
**Symptoms**:
- Header shows for a millisecond then vanishes
- No logs from `SummaryAnimations` (added listener doesn't work in this RN version)

**Changes Made**:
- Added logging in `SummaryHeader` component to see what animation values it receives
- Simplified `useSummaryAnimations` to just return values at 1

**Debugging Steps**:
1. Click FAB button - check if menu items appear
2. Open project - check console for `[SummaryHeader]` logs
3. Look for any warnings about animation values changing

## Next Steps If Still Broken

### If FAB still doesn't work:
- Check if `menuItemAnim1` and `menuItemAnim2` are actually Animated.Value objects
- Verify the interpolation formulas
- Test with hardcoded opacity: `opacity: 1` to rule out animation system

### If Header still disappears:
- Check if parent ScrollView is causing re-renders
- Check if `getAnimationInterpolations` is recreating interpolations on each render
- Try removing interpolations entirely and use `opacity: 1` directly

## Key Insight

The root cause is likely:
1. **FAB**: The animation values ARE changing, but the STYLE isn't being applied correctly
2. **Header**: Something is re-creating the animation hook or interpolations, causing flicker

Both suggest a **rendering/lifecycle issue** rather than an animation logic issue.

