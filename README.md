# 主辅棋网站

[实例网站](https://k.guc1010.top/tegojafo)

用`boardgame.io`库实现的主辅棋网站。

## 本地

启动供本地对局（人人、人机）使用的服务端：`yarn start`

- 只能以开发模式`yarn start`启动，生产模式`yarn build`后功能不正常；
- 不支持HTTPS。

## 联机

启动供联机对局（人人、观战）使用的服务端：`node -r esm src/server.js`

- NodeJS需要使用`21.7.3`版本；
- 通过加密的URL内容鉴定玩家身份，算法见`src/App.js`；
- 不支持HTTPS；
- 能正确生成加密URL的客户端：
    - https://k.guc1010.top/tegojafo
    - [商弦Minecraft服务器](https://guc1010.top)

## 特性

会禁止自杀行动，但无法自动判断将死。若被将死，只能手动投降。