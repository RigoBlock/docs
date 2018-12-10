---
title: "Bytes Calls"
category: "kb"
---

starting point are multisig wallets

Multisig wallets allow for arbitrary call execution on any external smart contract
without the multisig knowing the interface of the target contract

this is executed in two ways:

1) send a raw transaction with a field data from web3.js

the field data contains the aggregated hex value of the transaction

https://github.com/ConsenSys/MultiSigWallet/blob/2582787a14dd861b51df6f815fab122ff51fb574/MultiSigWalletWithDailyLimit.sol#L415

the msg.value data get forwarded to the target contract and execute the call without need for further conversion

2) call a contract transaction like the below:

https://github.com/ConsenSys/MultiSigWallet/blob/2582787a14dd861b51df6f815fab122ff51fb574/MultiSigWalletWithDailyLimit.sol#L263

where a transaction can be added by providing the destination address, a uint and a bytes field

	function addTransaction(address destination, uint value, bytes data)
        	internal
       		notNull(destination)
        	returns (uint transactionId)
    	{

the bytes field contains the hex-encoded parameters, the first is the method of the call (the hex of the name of the function in the target contract, and then all the fields are added increasing the size of the bytes)

this way any arbitrary transaction can be passed to the drago and forwarded to a target contract.

in the case of an exchange, only an approved exchanges can send raw transactions to dragos

in the case of a direct call to an exchange, only an approved exchange should be able to send such transaction to a drago, as the fund managers could abuse (by becoming maker of an order signed by a manager and sent to a relayer)

in the case of a call to exchange through adapter, both exchanges and managers can send transactions, as there the parameters of the call would be decomposed and some restriction could/would apply.

the work on the conditions has to be implemented based on the activity with exchanges


example taken from:
https://ethereum.stackexchange.com/questions/25144/encode-data-input-of-the-raw-transaction-to-update-an-contract-function

example of parameters in js for raw transaction:
var rawTx = {
 to: <to_address>,
 data: payloadData,
 value: '0x0',
 from: <from_address>,
 nonce: nonce,
 gasLimit: gasLimit,
 gasPrice: gasPrice
}

This is fairly straightforward as per the ABI spec

First you need the function selector for test(address,uint256) which is the first four bytes of the keccak-256 hash of that string, namely 0xba14d606.

Then you need the address as a 32-byte word: 

    0x000000000000000000000000c5622be5861b7200cbace14e28b98c4ab77bd9b4.

Finally you need 10000 as a 32-byte word: 

    0x0000000000000000000000000000000000000000000000000000000000002710

So the final data string you require is:

    0xba14d606000000000000000000000000c5622be5861b7200cbace14e28b98c4ab77bd9b40000000000000000000000000000000000000000000000000000000000002710

And that's it!

for more parameters, we just add them to the array

hence by knowing how the bytes is composed, we can decompose it through assembly

by using delegatecall, we simply forwad the bytes array to the receiver contract


THE BYTES DATA CAN BE SENT IN A RAW TRANSACTION AS THE DATA FIELD
OR
AS THE INPUT/ONE OF THE INPUT PARAMETERS OF A SPECIFIC CALL


web3.js has a library function for encoding the transaction


in dragos, 3 different ways of sending transaction to exchanges have been implemented:
1) send raw transaction to target
2) call a function with a bytes array as input parameter and forward to an exchange directly
3) call a function with a bytes array as input parameter and forward to an exchange proxy/adapter

the 3rd differs from the 2nd in that it can be decomposed and preanalyzed within the exchange adapter

in detail:

1) raw transaction
code reference:

https://github.com/RigoBlock/rigoblock-monorepo/blob/89abed48a5642d0a491317b05a52f8e9758bcbe9/packages/protocol/solidity-contracts/Drago/Drago.sol#L158

code:

    function()
            external
            payable
            whenApprovedExchange(msg.sender)
        {
            if (msg.value == 0) {
                DragoExchangeExtension.operateOnExchange(libraryAdmin, msg.sender, msg.data);
            }
        }

only an approved exchange is allowed to send Eth or a raw transaction

2) direct exchange transaction
code reference:

https://github.com/RigoBlock/rigoblock-monorepo/blob/89abed48a5642d0a491317b05a52f8e9758bcbe9/packages/protocol/solidity-contracts/Drago/Drago.sol#L339

code:

    function operateOnExchangeDirectly(address _exchange, bytes _assembledTransaction)
            external
            ownerOrApprovedExchange()
            whenApprovedExchange(_exchange)
        {
            require(_exchange.delegatecall(_assembledTransaction));
        }

the owner or an approved exchange can send a transaction to an approved exchange
the condition allows the owner to operate on the exchange, but should be restricted
as the owner could take any order

3) operate on exchange through proxy/adapter
code reference:

https://github.com/RigoBlock/rigoblock-monorepo/blob/89abed48a5642d0a491317b05a52f8e9758bcbe9/packages/protocol/solidity-contracts/Drago/Drago.sol#L350

code:

    function operateOnExchangeThroughAdapter(
            address _exchange,
            bytes _assembledTransaction)
            external
            ownerOrApprovedExchange()
            whenApprovedExchange(_exchange)
        {
            require(getExchangeAdapter(_exchange).delegatecall(_assembledTransaction));
        }

owner or approved exchange, is fine here as the transaction will be analyzed in the adapter and, in case filtered. This allows for the fund to be taker

it is better to keep the latter two calls separate, as the direct call to the exchange is cheaper than the proxy call, hence we make it less expensive for exchanges to send calls.


how to generate the data field (how to assemble the call in js):

methods.myMethod.encodeABI
myContract.methods.myMethod([param1[, param2[, ...]]]).encodeABI()
Encodes the ABI for this method. This can be used to send a transaction, call a method, or pass it into another smart contracts method as arguments.

Parameters
none

Returns
String: The encoded ABI byte code to send via a transaction or call.

Example
myContract.methods.myMethod(123).encodeABI();

    0x58cf5f1000000000000000000000000000000000000000000000000000000000000007B


reference of how the call is processed within the solidity contracts

delegatecall:

https://github.com/dapphub/ds-proxy/blob/master/src/proxy.sol
https://github.com/aragon/aragonOS/blob/f42f5a4bd62c6e9655a3a4e6c6f165300a63287d/contracts/common/DelegateProxy.sol#L21-L22

call:

https://medium.com/@blockchain101/calling-the-function-of-another-contract-in-solidity-f9edfa921f4c





