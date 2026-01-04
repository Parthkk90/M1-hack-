#!/bin/bash

# Cresca Payments - Movement Network Deployment Script
# Chain ID: 250 - Bardock Testnet
# This script compiles and deploys the smart contract to Movement testnet

echo "🚀 Cresca Payments - Movement Network Deployment"
echo "================================================"
echo "Network: Bardock Testnet (Chain ID: 250)"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo -e "${RED}❌ Aptos CLI is not installed${NC}"
    echo "Please install Aptos CLI first:"
    echo "curl -fsSL \"https://aptos.dev/scripts/install_cli.py\" | python3"
    exit 1
fi

echo -e "${GREEN}✅ Aptos CLI found${NC}"

# Navigate to contracts directory
cd contracts || exit

echo ""
echo "📦 Step 1: Compiling Smart Contract..."
echo "======================================="

# Compile the contract
if aptos move compile; then
    echo -e "${GREEN}✅ Contract compiled successfully${NC}"
else
    echo -e "${RED}❌ Contract compilation failed${NC}"
    exit 1
fi

echo ""
echo "🔧 Step 2: Setting up Movement Network..."
echo "=========================================="

# Check if .aptos directory exists
if [ ! -d "$HOME/.aptos" ]; then
    echo -e "${YELLOW}⚠️  No Aptos configuration found${NC}"
    echo "Initializing Aptos account for Movement testnet..."
    
    aptos init --network custom \
        --rest-url https://testnet.movementnetwork.xyz/v1 \
        --faucet-url https://faucet.testnet.movementnetwork.xyz
else
    echo -e "${GREEN}✅ Aptos configuration found${NC}"
fi

# Get the account address
ACCOUNT_ADDRESS=$(aptos account list | grep "account" | head -1 | awk '{print $3}')
echo -e "${GREEN}📍 Account Address: ${ACCOUNT_ADDRESS}${NC}"

echo ""
echo "💰 Step 3: Funding Account from Faucet..."
echo "========================================="

# Fund the account from faucet
echo "Requesting tokens from Movement faucet..."
aptos account fund-with-faucet --account $ACCOUNT_ADDRESS \
    --faucet-url https://faucet.testnet.movementnetwork.xyz \
    --amount 100000000

echo ""
echo "🚀 Step 4: Deploying to Movement Testnet..."
echo "==========================================="

# Deploy the contract
if aptos move publish \
    --named-addresses cresca=$ACCOUNT_ADDRESS \
    --assume-yes; then
    
    echo ""
    echo -e "${GREEN}✅ Contract deployed successfully!${NC}"
    echo ""
    echo "📋 Deployment Details:"
    echo "======================"
    echo -e "Network:          ${GREEN}Movement Testnet (Bardock)${NC}"
    echo -e "Chain ID:         ${GREEN}250${NC}"
    echo -e "Contract Address: ${GREEN}${ACCOUNT_ADDRESS}${NC}"
    echo -e "Module Name:      ${GREEN}cresca::payments${NC}"
    echo -e "Explorer:         ${GREEN}https://explorer.movementnetwork.xyz/?network=bardock+testnet${NC}"
    echo ""
    echo "🔧 Next Steps:"
    echo "=============="
    echo "1. Update src/core/config/app.config.ts with:"
    echo "   contract: {"
    echo -e "     address: '${GREEN}${ACCOUNT_ADDRESS}${NC}',"
    echo "     moduleName: 'cresca::payments',"
    echo "   }"
    echo ""
    echo "2. Save the following for reference:"
    echo "   - Contract Address: ${ACCOUNT_ADDRESS}"
    echo "   - Network: Movement Testnet (Bardock)"
    echo "   - Chain ID: 250"
    echo ""
    echo "3. View your contract on Explorer:"
    echo "   https://explorer.movementnetwork.xyz/account/${ACCOUNT_ADDRESS}?network=bardock+testnet"
    echo ""
    
    # Save deployment info
    echo "{" > deployment-info.json
    echo "  \"network\": \"Movement Testnet (Bardock)\"," >> deployment-info.json
    echo "  \"contractAddress\": \"${ACCOUNT_ADDRESS}\"," >> deployment-info.json
    echo "  \"moduleName\": \"cresca::payments\"," >> deployment-info.json
    echo "  \"chainId\": \"250\"," >> deployment-info.json
    echo "  \"rpcUrl\": \"https://testnet.movementnetwork.xyz/v1\"," >> deployment-info.json
    echo "  \"explorerUrl\": \"https://explorer.movementnetwork.xyz/?network=bardock+testnet\"," >> deployment-info.json
    echo "  \"indexerUrl\": \"https://hasura.testnet.movementnetwork.xyz/v1/graphql\"," >> deployment-info.json
    echo "  \"faucetUrl\": \"https://faucet.movementnetwork.xyz\"," >> deployment-info.json
    echo "  \"deployedAt\": \"$(date -u +\"%Y-%m-%dT%H:%M:%SZ\")\"" >> deployment-info.json
    echo "}" >> deployment-info.json
    
    echo -e "${GREEN}✅ Deployment info saved to deployment-info.json${NC}"
    
else
    echo -e "${RED}❌ Contract deployment failed${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
