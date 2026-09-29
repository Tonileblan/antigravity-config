---
name: macos-control
description: >-
  Provides capabilities and best practices for controlling and automating macOS:
  taking screenshots, interacting via mouse/keyboard (cliclick), automating apps
  via AppleScript (osascript), clipboard operations, system volume, notifications,
  and window management.
---

# macOS Control & Automation Guide

This skill enables full control of macOS through native CLI tools, AppleScript (`osascript`), `cliclick`, and the `macos-control` MCP server.

## Capabilities

### 1. Visual Inspection (Screenshots)
- Use `screencapture -x <file.png>` to capture the entire screen silently without shutter sound.
- Use `screencapture -w <file.png>` to capture only the active window.

### 2. Cursor & Mouse Control (`cliclick`)
- **Move**: `cliclick m:X,Y`
- **Click**: `cliclick c:X,Y`
- **Right Click**: `cliclick rc:X,Y`
- **Double Click**: `cliclick dc:X,Y`
- **Drag and Drop**: `cliclick dd:startX,startY du:endX,endY`
- **Wait and Action**: `cliclick w:500 c:X,Y` (waits 500ms before clicking)

### 3. Keyboard Typing & Shortcuts
- **Type Text**: `cliclick t:"Hello World"`
- **Key Press**: `cliclick kp:return`, `cliclick kp:space`, `cliclick kp:escape`
- **AppleScript Keystrokes**:
  - `osascript -e 'tell application "System Events" to keystroke "c" using command down'`
  - `osascript -e 'tell application "System Events" to key code 36'` (Return key)

### 4. AppleScript Native App Automation (`osascript`)
- **Focus / Activate App**: `osascript -e 'tell application "Finder" to activate'`
- **Get Active Window / App**:
  ```bash
  osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'
  ```
- **Notifications**:
  ```bash
  osascript -e 'display notification "Mensaje" with title "Antigravity"'
  ```
- **System Volume**:
  - Set: `osascript -e 'set volume output volume 50'`
  - Get: `osascript -e 'output volume of (get volume settings)'`
- **Clipboard**:
  - Read: `pbpaste`
  - Write: `echo "texto" | pbcopy`
