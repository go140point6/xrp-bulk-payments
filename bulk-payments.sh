#!/bin/bash

xrp_amount=$(sed -n '2{p;q}' .env)

while getopts n:m: flag
do
    case "${flag}" in
        n) network=${OPTARG};;
        m) mode=${OPTARG};;
    esac
done

if ! [[ $network == mainnet || $network == testnet ]]; then
    echo "The flag value for -n MUST be either mainnet or testnet, no other value allowed."
    exit 1
elif ! [[ $mode == simulation || $mode == payment ]]; then
    echo "The flag value for -m MUST be either simulation or payment, no other value allowed."
    echo "Simulation will run all operations EXCEPT making a real payment, and can be run on either network."
    exit 1
elif [[ $mode == simulation ]]; then
    echo "Running SIMULATION against $network (no real payment being made)"
    node send-xrp.js $network $mode
    exit 0
elif [[ $mode == payment ]]; then
    echo "Running PAYMENT against $network, this will make a real payment(s)!"
    echo "Currently the .env file is configured to send $xrp_amount for each payment... be sure that is what you expect!"
    read -r -p "Are you sure you want to continue? [y/N] " response
    response=${response,,} # tolower
    if [[ "$response" =~ ^(yes|y)$ ]]; then
        echo "Confirmed... running PAYMENT against $network"
        node send-xrp.js $network $mode
        exit 0
    else
        echo "Aborting..."
        exit 1
    fi
fi
exit 1