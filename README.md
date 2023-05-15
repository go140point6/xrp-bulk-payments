# xrp-bulk-payments

Script to make bulk XRP payments on the XRPL.  
- Works for both TESTNET and MAINNET, as well as simulating payment on both networks for a dry-run.
- Creates a timestamped .csv in the log directory of each run for easy review.
- Input is simple single column .csv of addresses (see testnet-addresses.csv for working example).
- Supports memos.

Tested with NodeJS v.18.14.2.

**********
AN IMPORTANT NOTE!
- DO NOT use your main wallet family secret, create a specific wallet address JUST for bulk-payments.
- DO NOT leak this key!
- DO NOT have more funds that you plan to distribute in this wallet (plus a little for gas) at any one time!
- The author is NOT responsible for what you do with this software! 
- If your key leaks or you use this software to send more XRP than you expect, you WILL lose your funds!

Note that XUMM will not show your family seed at any point.  To get the seed, you can use WietseWind's excellent repo:

```
https://github.com/WietseWind/secret-numbers-to-family-seed
```

Please DO NOT run this online. I recommend you set up a VM with a clean linux Desktop OS, install the repo and dependencies, then take it OFFLINE and run it on localhost.
I had to switch to NodeJS v.16.x (Gallium) to get it to run.  PROCEED AT YOUR OWN RISK!
**********

To install:

```
git clone https://github.com/go140point6/xrp-bulk-payments.git
cd xrp-bulk-payments
npm install
```

To run:

```
./bulk-payments.sh -n [network] -m [mode]

./bulk-payments -n testnet -m simulation
./bulk-payments -n mainnet -m payment
./bulk-payments -n testnet -m simulation
./bulk-payments -n mainnet -m payment
```

Simulation - Run entire sequence only omitting the "client.submitAndWait(signed.tx_blob)" process. Review output and .csv to see what final output will be.
Payment - The real deal.  Run on testnet with the provided testnet addresses or your own.