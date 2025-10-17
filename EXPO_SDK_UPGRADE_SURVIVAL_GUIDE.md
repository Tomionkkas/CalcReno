# Expo SDK Upgrade Survival Guide

## What Broke in SDK 53 → 54

### React Native 0.74 Breaking Changes
1. **Animated API rendering bugs** - Opacity doesn't trigger visual updates on Android
2. **Babel plugin now required** - `react-native-reanimated/plugin` is mandatory
3. **Elevation stacking changes** - Android elevation behavior changed
4. **Async accessibility APIs** - Timing issues with `AccessibilityInfo`

## How to Prevent This Hell in Future Upgrades

### BEFORE Upgrading (SDK 54 → 55)

#### 1. Read the Expo SDK Release Notes CAREFULLY
```bash
# Check breaking changes
https://docs.expo.dev/versions/latest/
```

Look for:
- React Native version bump
- Deprecated packages
- Breaking API changes
- New Babel/Metro config requirements

#### 2. Check React Native Changelog
```bash
# React Native breaking changes
https://github.com/facebook/react-native/releases
```

#### 3. Test in a NEW Project First
```bash
npx create-expo-app test-sdk-55 --template blank
cd test-sdk-55
# Test your critical features here
```

#### 4. Update Dependencies Incrementally
```bash
# DON'T do this:
npx expo install --fix  # ❌ Too many changes at once

# DO this:
npm install expo@next  # Update Expo first
npx expo doctor        # Check what's broken
# Fix issues one by one
npx expo install --fix # Then fix dependencies
```

### DURING Upgrade

#### 1. Always Clear Caches
```bash
rm -rf node_modules
rm package-lock.json
npm install
npx expo start --clear --reset-cache
```

#### 2. Check Babel Config
```js
// babel.config.js MUST have:
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ALWAYS LAST!
      'react-native-reanimated/plugin',
    ],
  };
};
```

#### 3. Test Animation-Heavy Components FIRST
- FAB buttons
- Modals
- Page transitions
- List animations

If animations break, React Native version likely has bugs.

### AFTER Upgrade

#### 1. Run Expo Doctor
```bash
npx expo doctor --fix-dependencies
```

#### 2. Test on BOTH iOS and Android
React Native 0.74 has Android-specific rendering bugs that don't appear on iOS.

#### 3. Check React Native Known Issues
```bash
# Before committing to SDK upgrade
https://github.com/facebook/react-native/issues
```

Search for your React Native version + "animation" or "elevation" or "opacity"

## SDK 55 Upgrade Checklist

When SDK 55 drops:

### ✅ Before Starting
- [ ] Read Expo SDK 55 changelog
- [ ] Read React Native 0.75.x changelog (if applicable)
- [ ] Create test project with SDK 55
- [ ] Test critical animations in test project
- [ ] Backup current working code (git commit)

### ✅ During Upgrade
- [ ] Update Expo first: `npm install expo@latest`
- [ ] Run expo doctor: `npx expo doctor`
- [ ] Fix peer dependencies ONE at a time
- [ ] Clear all caches
- [ ] Check Babel config
- [ ] Test on physical device (not just simulator)

### ✅ After Upgrade
- [ ] Test FAB menu animations
- [ ] Test modal animations
- [ ] Test page transitions
- [ ] Test on Android
- [ ] Test on iOS
- [ ] Run in production build (not just dev)

## The Nuclear Option for Broken Animations

If animations break after SDK upgrade, **don't waste time debugging**. Replace with conditional rendering:

```tsx
// ❌ BROKEN in RN 0.74
<Animated.View style={{ opacity: animValue }}>
  <Component />
</Animated.View>

// ✅ WORKS ALWAYS
{isVisible && (
  <View>
    <Component />
  </View>
)}
```

You lose animations, but you gain **reliability**.

## Why This Happened

**Expo SDK upgrades bundle:**
- New React Native version
- New Native modules
- New Babel transforms
- New Metro bundler

**Any ONE of these can break your app.**

The proper way: Test EACH change incrementally.

The reality: Expo forces you to upgrade everything at once.

## Prevention Strategy

### Use Expo's Canary Builds
```bash
npm install expo@next
```

Test with beta/canary builds BEFORE official release.

### Pin Critical Dependencies
```json
{
  "dependencies": {
    "react-native-reanimated": "3.6.1" // Exact version
  }
}
```

Don't let `npx expo install --fix` upgrade everything blindly.

### Keep a Working Version
```bash
git tag -a "working-sdk-54" -m "Last working build before SDK 55"
git push --tags
```

## When SDK 55 Breaks Everything

1. **Don't panic**
2. **Revert to tagged version**
3. **Wait 2-3 weeks for community to find bugs**
4. **Check GitHub issues for your specific problems**
5. **Upgrade when stable**

---

**Remember**: Expo SDK upgrades are NOT "just run a command". They're **major version bumps that can break everything**.

Treat them like migrating to a new framework.

