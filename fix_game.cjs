const fs = require('fs');
const path = require('path');

function safeReplace(content, oldVal, newVal) {
  if (content.includes(newVal) && newVal.trim() !== '') return content;
  return content.split(oldVal).join(newVal);
}

const filesToFix = [
  {
    path: 'src/utils/admob.ts',
    actions: (content) => {
      let c = content;
      // Fix the duplicate key from the screenshot
      c = c.replace(/requestTrackingAuthorization: true,\s*requestTrackingAuthorization: true,/g, 'requestTrackingAuthorization: true,');
      // Update listeners
      c = safeReplace(c, 'onRewardedVideoAdRewarded', 'rewarded');
      c = safeReplace(c, 'onRewardedVideoAdClosed', 'dismissed');
      c = safeReplace(c, 'onRewardedVideoAdFailedToLoad', 'adFailedToLoad');
      c = safeReplace(c, '15000', '30000');
      return c;
    }
  },
  {
    path: 'src/components/game/BrickBreakerGame.tsx',
    actions: (content) => {
      let c = content;
      // Fix Level Restart
      c = safeReplace(c, 'level: 1,', 'level: prev.level,');
      // Add App Import safely
      if (!c.includes("@capacitor/app")) {
        c = c.replace("import { useEffect, useState, useCallback, useRef } from 'react';", "import { useEffect, useState, useCallback, useRef } from 'react';\nimport { App } from '@capacitor/app';");
      }
      // Add Back Button Listener safely
      if (!c.includes("backButton")) {
        const hookStart = "const BrickBreakerGame: React.FC = () => {";
        const backButtonCode = "\n  useEffect(() => {\n    const backListener = App.addListener('backButton', () => {\n      if (screenState === 'playing' || screenState === 'paused' || screenState === 'gameover' || screenState === 'levelcomplete') {\n        setScreenState('menu');\n      } else if (screenState === 'menu' || screenState === 'splash') {\n        App.exitApp();\n      }\n    });\n    return () => { backListener.then(l => l.remove()); };\n  }, [screenState]);";
        c = c.replace(hookStart, hookStart + backButtonCode);
      }
      return c;
    }
  }
];

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file.path);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = file.actions(content);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully checked/fixed: ' + file.path);
  }
});
console.log('All systems are clean and ready!');
