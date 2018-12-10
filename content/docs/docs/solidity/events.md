---
title: "Events"
category: "kb"
---

# Events

Resources:

Solidity docs:

https://solidity.readthedocs.io/en/v0.4.21/contracts.html#events

Web3:

https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#events

Parity:

https://wiki.parity.io/JSONRPC-eth-module#eth_getlogs

Stack:

https://ethereum.stackexchange.com/questions/2190/is-searching-data-stored-in-event-logs-prohibitively-slow


Topics of BuyDrago eventful contract.  

[https://github.com/RigoBlock/contracts/blob/master/Eventful/Eventful.sol](https://github.com/RigoBlock/contracts/blob/master/Eventful/Eventful.sol)

    event BuyDrago(address indexed drago, address indexed from, address indexed to, uint256 amount, uint256 revenue);  
    event SellDrago(address indexed drago, address indexed from, address indexed to, uint256 amount, uint256 revenue);


Example BuyDrago:

    topics: Array(4)
    0:"0x34144239ced9d56e99c26e186edefd97ee208bb8e3feb8e240193855a9118124" // Event signature
    1:"0x00000000000000000000000069134ff2a8cad171a50b75274cdf21fbc55104ff" // Drago address
    2:"0x00000000000000000000000000a79fa87cfb12a05205caea3870c1a9c322ae5c" // From account address
    3:"0x00000000000000000000000069134ff2a8cad171a50b75274cdf21fbc55104ff" // to drago address

Example SellDrago:

	topics: Array(4)
	0: "0x06c4b674455b6c0c5515b11129a8deb36537e91fb0ed5802b83e0230037b9143" // Event signature
	1:"0x00000000000000000000000069134ff2a8cad171a50b75274cdf21fbc55104ff" // Drago address
	2:"0x00000000000000000000000069134ff2a8cad171a50b75274cdf21fbc55104ff" // From drago adddress
	3:"0x00000000000000000000000000a79fa87cfb12a05205caea3870c1a9c322ae5c" // To account address

Additional resources:

https://ethereum.stackexchange.com/questions/2190/is-searching-data-stored-in-event-logs-prohibitively-slow
