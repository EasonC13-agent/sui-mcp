---
name: sui-mcp
description: MCP server providing Sui blockchain tools for AI agents. Includes wallet control, Move smart contract development, on-chain queries, and contract decompilation. 14 tools total.
version: 1.0.0
metadata:
  author: EasonC13-agent
  tags: sui, mcp, blockchain, move, smart-contract, web3, wallet
  requires:
    bins: [node]
  install:
    - id: npm
      kind: node
      package: sui-agent-mcp
      bins: [sui-agent-mcp]
      label: Install Sui Agent MCP (npm)
---

# Sui Agent MCP

MCP (Model Context Protocol) server that provides Sui blockchain tools for Claude Code and other MCP-compatible AI agents.

## Install

```bash
npm install -g sui-agent-mcp
```

## Tools (14 total)

### Wallet Tools
- `sui_wallet_address` - Get current wallet address
- `sui_wallet_balance` - Check SUI balance
- `sui_wallet_accounts` - List all derived accounts
- `sui_wallet_pending` - View pending signing requests
- `sui_wallet_approve` - Approve a pending transaction
- `sui_wallet_reject` - Reject a pending transaction
- `sui_wallet_switch_network` - Switch network (mainnet/testnet/devnet/localnet)
- `sui_wallet_sign_execute` - Sign and execute unsigned transaction

### CLI Tools
- `sui_cli` - Run any Sui CLI command
- `sui_move_build` - Build Move packages
- `sui_move_test` - Run Move tests

### Query Tools
- `sui_object` - Fetch on-chain object data
- `sui_decompile` - Decompile on-chain contracts
- `sui_source` - Fetch verified source code

## Usage with Claude Code

```json
{
  "mcpServers": {
    "sui": {
      "command": "sui-agent-mcp"
    }
  }
}
```
