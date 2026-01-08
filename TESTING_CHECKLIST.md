# Polish Features Testing Checklist

## 🧪 Quick Test Plan

### Loading States (5 min)
- [ ] Join game → see spinner on button
- [ ] Connection indicator shows green when connected
- [ ] Connection indicator shows red when disconnected
- [ ] Loading spinner appears during network requests

### Error Recovery (10 min)
- [ ] Turn off WiFi → see "Connection lost, reconnecting..."
- [ ] Turn on WiFi → auto-reconnects within 5 seconds
- [ ] Verify game state persists after reconnect
- [ ] Test multiple disconnect/reconnect cycles

### Mobile Optimization (10 min)
#### On Phone:
- [ ] All buttons are easy to tap (no mis-clicks)
- [ ] Input fields don't trigger zoom on focus
- [ ] Safe areas respected on iPhone (notch/home indicator)
- [ ] Smooth scrolling in chat and lobby
- [ ] Rotate to landscape → layout adjusts properly
- [ ] Double-tap doesn't zoom

### Keyboard Navigation (5 min)
- [ ] Press Ctrl+, → Settings panel opens
- [ ] Press Escape → Settings panel closes
- [ ] Tab through all buttons → focus visible
- [ ] Arrow keys navigate cards
- [ ] Enter key submits forms

### Color Blind Modes (5 min)
- [ ] Open Settings → Color Blind Mode dropdown
- [ ] Select "Protanopia" → colors change
- [ ] Select "Deuteranopia" → different colors
- [ ] Select "Tritanopia" → different colors
- [ ] Select "Normal" → back to default
- [ ] Settings persist after page refresh

### Reduced Motion (2 min)
- [ ] Open Settings → Enable "Reduced Motion"
- [ ] Verify animations are minimal
- [ ] Disable → animations return
- [ ] Setting persists after refresh

### Tutorial (5 min)
- [ ] Clear localStorage → tutorial auto-shows
- [ ] Navigate through all 7 steps
- [ ] Progress bar updates correctly
- [ ] "Skip Tutorial" dismisses immediately
- [ ] "Let's Play!" on final step completes tutorial
- [ ] Tutorial doesn't show again after completion
- [ ] Settings → "Show Tutorial" re-triggers tutorial

### Settings Panel (5 min)
- [ ] Floating ⚙️ button visible on all screens
- [ ] Click button → settings panel opens
- [ ] All toggles work (color blind, motion, sound)
- [ ] "Show Tutorial" button works
- [ ] Keyboard shortcuts reference is visible
- [ ] Close button dismisses panel
- [ ] Click outside → panel stays open (requires close button)

### Screen Reader (10 min - if available)
- [ ] Enable NVDA/JAWS/VoiceOver
- [ ] Navigate with Tab → all elements announced
- [ ] Connection status changes are announced
- [ ] Loading states are announced
- [ ] Modal dialogs trap focus correctly
- [ ] All buttons have descriptive labels

## 🎯 Priority Tests (If Time Limited)

### Critical (Must Test)
1. Connection indicator shows correct state
2. Join button loading state works
3. Settings panel opens/closes
4. Tutorial can be completed
5. Color blind mode changes colors

### Important (Should Test)
1. Auto-reconnect works
2. Mobile touch targets are adequate
3. Keyboard shortcuts work
4. Reduced motion toggle works
5. Settings persist after refresh

### Nice to Have (Time Permitting)
1. Screen reader compatibility
2. Landscape mode layout
3. Multiple color blind modes
4. Tutorial skip functionality
5. Safe area insets on iPhone

## 🐛 Known Issues / Limitations

### Expected Behavior
- Settings button may overlap game content on very small screens (<320px)
- Tutorial only shows once (by design, can be re-triggered from settings)
- Color blind mode doesn't affect images, only CSS colors
- Auto-reconnect has 5-second delay between attempts
- Focus trap in modals may not work with all assistive tech

### Not Bugs
- "Terminate batch job (Y/N)?" in terminal (Windows PowerShell quirk)
- Dev server "Port 5173 in use" (expected when running multiple instances)
- "baseline-browser-mapping" warning (non-critical, optional update)

## ✅ Success Criteria

All critical tests pass:
- [ ] Loading states visible
- [ ] Connection status accurate
- [ ] Settings panel functional
- [ ] Tutorial completable
- [ ] Color blind modes work
- [ ] Mobile experience smooth
- [ ] Keyboard navigation works

## 📝 Test Results Template

```
Date: _______
Tester: _______
Device: _______
Browser: _______

Loading States: ☐ Pass ☐ Fail ☐ N/A
Error Recovery: ☐ Pass ☐ Fail ☐ N/A
Mobile Optimization: ☐ Pass ☐ Fail ☐ N/A
Keyboard Navigation: ☐ Pass ☐ Fail ☐ N/A
Color Blind Modes: ☐ Pass ☐ Fail ☐ N/A
Reduced Motion: ☐ Pass ☐ Fail ☐ N/A
Tutorial: ☐ Pass ☐ Fail ☐ N/A
Settings Panel: ☐ Pass ☐ Fail ☐ N/A
Screen Reader: ☐ Pass ☐ Fail ☐ N/A

Notes:
_______________________________
_______________________________
_______________________________
```
