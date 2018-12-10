---
title: "Data Flow"
category: "kb"
---

## Connection to node

https://github.com/RigoBlock/webapp/blob/master/src/App.js#L84

Input parameters come form initial state or saved state:

https://github.com/RigoBlock/webapp/blob/b5fbdde28ab23991fde439c951c98ff3213cb814/src/_redux/reducers/initialState.js#L41

https://github.com/RigoBlock/webapp/blob/23baa9c55223b3074d2de27a7e65f71b2ab4f2ef/src/_utils/const.js#L80

## Connection monitoring

This timeout checks the connection every few seconds and if MetaMask is unlocked:

https://github.com/RigoBlock/webapp/blob/b5fbdde28ab23991fde439c951c98ff3213cb814/src/App.js#L171

## Accounts fetching

This function fetches accounts from Parity and MetaMask depending to which node is connected:

https://github.com/RigoBlock/webapp/blob/b5fbdde28ab23991fde439c951c98ff3213cb814/src/App.js#L168

It also starts a subscribe to newBlock event. Accounts balances are updated at each newBlock:

https://github.com/RigoBlock/webapp/blob/b5fbdde28ab23991fde439c951c98ff3213cb814/src/App.js#L487

## Events

Events are fetches a component level:

https://github.com/RigoBlock/webapp/blob/c46aa785bda4b4d6956605a68b5ff647348c2a98/src/ApplicationVaultHome/ApplicationVaultTrader/pageDashboardVaultTrader.js#L294

This function is triggered only if an account balance change is detected.

