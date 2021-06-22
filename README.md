# gats-scripts
All my script related to gats.io
___
I quit gats on 6/22/2021. This repo contains all the scripts I wrote in my gats time. Some work, some don't, some are outdated. Enjoy.
___
# Scripts
| Name | Description |
| ---- | ----------- |
| bots.js | Earliest version of my bots. Stopped working once captcha was added because they moved to dynamic server urls. |
| hack.js | Earliest version of my hack. Contains a chatlogger but doesn't work anymore since the dynamic server urls. |
| killfeed.js | A design prototype of a killfeed system. Abandonned because noone was willing to use the client script (because they didn't trust me) which is required for it to function. |
| archiver.js | The script used to take map archives present in my `gats.io` repo. When you run it, you need to walk across the entire map to load all 750 walls after which you can JSON.stringify. |
| multiboxing.user.js | A tampermonkey script which allows you to multibox gats tabs. Recently, the connections per ip limit made it useless. To use, open 2 tabs on the same server. With 1 tab, goto the other tab's position in game and stack yourself on your other player. On each tab, press q to toggle syncing. You can see if a tab is syncing at the top right cornor. If gats gets an update that reduces max connections per ip to 1, it will be because of this. |
| better-layers.user.js | A tampermonkey script that changes the render order of some objects in game. Was useful for me. |
| bots-captcha.js | Bots that can connect even with captcha. + general improvements from v1. |
| bots-node.js | NodeJS version of my v1 bots. You could bypass server detection by specifying a user-agent header. This is what I used for my 703 killstreak on my KSRandomness account, my very first mass bot usage. Doesn't work anymore as its bots v1 (broken by dynamic server urls). This does need a client script to control the bots on the server but I cannot find it ATM. |
| leaderboard-fetcher.js | Uses my v2 bots to create a global leaderboard (take leaderborad of all servers and combine them). This can be used to view all online players, find people with streaks/high scores, find a specific player and what server they are in, and much more. |
