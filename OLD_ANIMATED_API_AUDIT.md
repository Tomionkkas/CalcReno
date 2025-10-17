# Old Animated API Audit - Components Still Using Broken API

## 🔴 CRITICAL - User-Facing Modals & Dropdowns (WILL BREAK)

### 1. **MaterialDetailsModal.tsx** 🔴 HIGHEST PRIORITY
**Path:** `app/components/ProjectSummary/MaterialDetailsModal/MaterialDetailsModal.tsx`
**Impact:** HIGH - Users cannot see material details modal
**Why Critical:** 
- Opens when user clicks "Show Material Details" 
- Contains cost breakdown and material lists
- Currently invisible when opened (dark overlay only)
**User Impact:** Cannot view detailed material information

### 2. **FilterDropdown.tsx** 🔴 HIGH PRIORITY
**Path:** `app/components/Home/FilterDropdown.tsx`
**Impact:** HIGH - Filter menu invisible
**Why Critical:**
- Used on home screen to filter projects
- Dropdown menu won't appear when filter button clicked
- User cannot filter their projects
**User Impact:** Cannot use filter feature

### 3. **SortDropdown.tsx** 🔴 HIGH PRIORITY
**Path:** `app/components/Home/SortDropdown.tsx`
**Impact:** HIGH - Sort menu invisible
**Why Critical:**
- Used on home screen to sort projects
- Dropdown menu won't appear when sort button clicked
- User cannot change project sorting
**User Impact:** Cannot sort projects by date/name/status

---

## 🟡 MEDIUM - Screen-Level Animations (WILL LOOK BAD)

### 4. **index.tsx (HomeScreen)** 🟡 MEDIUM PRIORITY
**Path:** `app/index.tsx`
**Impact:** MEDIUM - Screen entrance animation
**Why Medium:**
- Only affects initial screen load animation
- Screen still renders and is functional
- Just looks janky/unpolished
**User Impact:** Screen pops in instead of smooth fade

### 5. **ProjectCard.tsx** 🟡 MEDIUM PRIORITY
**Path:** `app/components/ProjectCard.tsx`
**Impact:** MEDIUM - Card animations
**Why Medium:**
- Affects hover/press animations on project cards
- Cards still clickable and functional
- Just looks less polished
**User Impact:** Cards feel less responsive

---

## 🟢 LOW - Entrance Animations (ALREADY FIXED IN SOME)

### 6. **ProjectSummary/utils/summaryAnimations.ts** 🟢 LOW
**Status:** Animations already removed (Option A fix)
**Impact:** None - already fixed

### 7. **ProjectRooms/utils/roomAnimations.ts** 🟢 LOW
**Status:** Animations already removed (Option A fix)
**Impact:** None - already fixed

### 8. **ProjectPlanner/utils/plannerAnimations.ts** 🟢 LOW
**Status:** Animations already removed (Option A fix)
**Impact:** None - already fixed

### 9. **ProjectHeader.tsx** 🟢 LOW
**Status:** Animations already removed
**Impact:** None - already fixed

### 10. **project/[id].tsx** 🟢 LOW
**Status:** Animations already removed
**Impact:** None - already fixed

---

## 🔵 COSMETIC - Minor UI Elements

### 11. **Home/EmptyState.tsx** 🔵 COSMETIC
**Impact:** Very Low - Empty state animation
**Why Low:** Only shows when no projects exist

### 12. **Home/ProjectList.tsx** 🔵 COSMETIC
**Impact:** Very Low - List entrance animation
**Why Low:** List still renders, just no fade-in

### 13. **Home/SearchFilterBar.tsx** 🔵 COSMETIC
**Impact:** Very Low - Search bar animation
**Why Low:** Search bar still functional

### 14. **Home/HomeHeader.tsx** 🔵 COSMETIC
**Impact:** Very Low - Header animation
**Why Low:** Header still displays

### 15. **ProjectPlanner/ProjectPlannerTab.tsx** 🔵 COSMETIC
**Impact:** Very Low - Tab entrance
**Why Low:** Tab still loads and is functional

### 16. **ProjectPlanner/DraggableRoom/DraggableRoom.tsx** 🔵 COSMETIC
**Impact:** Very Low - Drag animation
**Why Low:** Dragging might still work, just less smooth

### 17. **ProjectRooms/** (Various components) 🔵 COSMETIC
- AddRoomButton.tsx
- EmptyState.tsx
- RoomsHeader.tsx
- RoomCard.tsx
- ProgressBar.tsx

**Impact:** Very Low - Minor UI animations
**Why Low:** All components still functional, just less animated

---

## 📊 PRIORITY SUMMARY

### Fix Immediately (Blocks User Features):
1. ✅ **CustomToast** - DONE
2. ✅ **AddRoomModal** - DONE  
3. 🔴 **MaterialDetailsModal** - TODO
4. 🔴 **FilterDropdown** - TODO
5. 🔴 **SortDropdown** - TODO

### Fix Soon (Poor UX):
6. 🟡 **HomeScreen (index.tsx)** - Makes entrance look janky
7. 🟡 **ProjectCard** - Makes interactions feel sluggish

### Fix Eventually (Nice to Have):
8. 🔵 All cosmetic components - Work fine, just less polished

---

## WHY THESE BROKE

All these components use:
```typescript
const anim = useRef(new Animated.Value(0)).current;
Animated.timing(anim, { ... }).start();
```

**The Problem:**
- React Native 0.74 (Expo SDK 54) has a bug
- `Animated.Value` opacity changes don't trigger visual updates on Android
- Especially when combined with `position: absolute`, `Modal`, or high `elevation`

**The Solution:**
```typescript
// Replace with Reanimated
const anim = useSharedValue(0);
anim.value = withTiming(1, { duration: 300 });
```

---

## RECOMMENDATION

**Fix in this order:**

1. **MaterialDetailsModal** - Users are clicking "Show Details" and seeing nothing ❌
2. **FilterDropdown + SortDropdown** - Users are clicking filter/sort and seeing nothing ❌
3. **HomeScreen entrance** - Makes app feel slow on launch 😕
4. **ProjectCard** - Makes cards feel unresponsive 😕
5. Rest can wait - purely cosmetic 💅

**Estimated Time:**
- Top 3 critical fixes: ~15 minutes (similar to CustomToast/AddRoomModal)
- All fixes: ~1-2 hours

**Testing Strategy:**
After fixing each modal/dropdown, test:
1. Click the button/link that opens it
2. Verify content appears with smooth animation
3. Verify it closes smoothly
4. Verify it's tappable/dismissable

