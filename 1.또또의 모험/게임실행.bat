@echo off
echo Starting Toto's Adventure Local Server...
start "" "http://localhost:3000"
start "Mabu Slack Bot" cmd /k "node slack_bot.mjs"
npx serve game
pause
