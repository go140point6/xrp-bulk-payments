// Dependencies for Node.js.
// In browsers, use a <script> tag instead.
if (typeof module !== "undefined") {
    // Use var here because const/let are block-scoped to the if statement.
    require('dotenv').config()
    require('log-timestamp')
    var xrpl = require('xrpl')
    var fs = require('fs')
    var { parse } = require('csv-parse');
}

var network = process.argv[2]
var mode = process.argv[3]
var client
var wallet
var timestamp

addressesToPay = []

function logToFile(data) {
    const now = new Date();
    timestamp = `${now.toISOString()}`;
  
    // Append to file
    fs.appendFile(`log/${mode}-${network}-payxrp.csv`, `${timestamp}${data}\n`, function (err) {
    if (err) throw err;
    })
    
    // Output to console
    //console.log(`${timestamp} ${data}`)
    // Output to file
    //logToFile('Hello, world!')
  }

// Console log to console and file



// credentials
console.log(network)

const createArray = new Promise((resolve, reject) => {
    fs.createReadStream("data/addresses.csv")
    .pipe(parse({ delimiter: ",", from_line: 1 }))
    .on("data", function (row) {
        //console.log([row[0]])
        addressesToPay.push([row[0]]) 
    })
    .on("end", function() {
        resolve(addressesToPay)
    })
    .on("error", function(err) {
        reject(err)
    })
})

async function main() {
    try {
      // Connect -------------------------------------------------------------------
      if (network == "testnet") {
        try {
        wallet = xrpl.Wallet.fromSeed(process.env.SEED_TESTNET);
        }catch(err) {
          console.log("Family seed likely incorrect, please check. Error:", err.message)
          process.exit(1)
        }
        console.log(wallet.address);
        console.log("Connecting to Testnet...");
        client = new xrpl.Client(process.env.WS_TESTNET);
      }
  
      if (network == "mainnet") {
        try {
          wallet = xrpl.Wallet.fromSeed(process.env.SEED_MAINNET);
          }catch(err) {
            console.log("Family seed likely incorrect, please check. Error:", err.message)
            process.exit(1)
          }
        console.log(wallet.address);
        console.log("Connecting to Mainnet...");
        client = new xrpl.Client(process.env.WS_MAINNET);
      }
  
      await client.connect();
      fs.appendFile(`log/${mode}-${network}-payxrp.csv`, 'Timestamp,AmountSent,DestinaionAddress,Fee,Hash\n', (err) => {
        if (err) throw err;
      })
  
      // Prepare transaction -------------------------------------------------------
  
      for (const arrayAddress of addressesToPay) {
        var prepared = await client.autofill({
          TransactionType: "Payment",
          Account: wallet.address,
          Amount: xrpl.xrpToDrops(process.env.XRP_AMOUNT),
          Destination: arrayAddress.toString(),
          Memos: [
            {
              Memo: {
                MemoData: Buffer.from(process.env.PAY_MEMO, 'utf8').toString('hex').toUpperCase()
              }
            }
          ]
        });
        const max_ledger = prepared.LastLedgerSequence;
        console.log("Prepared transaction instructions:", prepared);
        console.log(`Sending ${xrpl.dropsToXrp(prepared.Amount)} XRP to ${prepared.Destination} at a fee of ${xrpl.dropsToXrp(prepared.Fee)} XRP\n`);
  
        // Sign prepared instructions ------------------------------------------------
        var signed = await wallet.sign(prepared);
        //console.log("Identifying hash:", signed.hash)
        //console.log("Signed blob:", signed.tx_blob)
  
        // Submit signed blob --------------------------------------------------------
        if ( mode == 'payment' ) {
            var tx = await client.submitAndWait(signed.tx_blob);
            // Check transaction results -------------------------------------------------
            let txResult = tx.result.meta.TransactionResult
            console.log("Transaction result:", txResult);
            if ( tx.result.meta.TransactionResult !== 'tesSUCCESS') {
                console.log(`Something wrong, non-success message of ${txResult} returned from TX`)
                await client.disconnect()
                process.exit(1)
            } else {
                logToFile(`,${xrpl.dropsToXrp(prepared.Amount)},${prepared.Destination},${xrpl.dropsToXrp(prepared.Fee)},${signed.hash}`)
            }
        } else {
            console.log("Simulating the submitAndWait function")
            console.log(`Simulated sending ${xrpl.dropsToXrp(prepared.Amount)} XRP to ${prepared.Destination} at a fee of ${xrpl.dropsToXrp(prepared.Fee)} XRP`)
            logToFile(`,${xrpl.dropsToXrp(prepared.Amount)},${prepared.Destination},${xrpl.dropsToXrp(prepared.Fee)},null`)
            }
        }
  
      // Disconnect ----------------------------------------------------------------
      fs.rename(`log/${mode}-${network}-payxrp.csv`, `log/${mode}-${network}-payxrp-${timestamp}.csv`, (err) => {
        if (err) throw err;
      })
      await client.disconnect();
    } catch (error) {
      console.error(error);
    }
  }
  
createArray.then(() => {
    main()
}).catch((err) => {
    console.error(err)
})