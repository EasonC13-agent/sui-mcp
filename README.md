# Sui MCP Server

MCP (Model Context Protocol) server that provides Sui blockchain tools for Claude Code.

## Features

- **Wallet Control**: Interact with [Sui Agent Wallet](https://github.com/EasonC13-agent/sui-skills) for signing transactions
- **Move Development**: Build, test, and publish Move smart contracts
- **On-chain Queries**: Fetch object data and decompile contracts

## Tools (14 total)

### Wallet Tools
| Tool | Description |
|------|-------------|
| `sui_wallet_address` | Get current wallet address |
| `sui_wallet_balance` | Check SUI balance |
| `sui_wallet_accounts` | List all derived accounts |
| `sui_wallet_pending` | View pending signing requests |
| `sui_wallet_approve` | Approve a pending transaction |
| `sui_wallet_reject` | Reject a pending transaction |
| `sui_wallet_switch_network` | Switch network (mainnet/testnet/devnet/localnet) |
| `sui_wallet_sign_execute` | Sign and execute unsigned transaction |

### CLI Tools
| Tool | Description |
|------|-------------|
| `sui_cli` | Run any Sui CLI command |
| `sui_move_build` | Build a Move package |
| `sui_move_test_coverage` | Run tests with coverage analysis |
| `sui_move_publish_unsigned` | Generate unsigned publish transaction |

### Query Tools
| Tool | Description |
|------|-------------|
| `sui_object` | Get information about a Sui object |
| `sui_decompile` | Get Suivision URL for package source |

## Installation

### Prerequisites

1. **Node.js 18+**
2. **Sui CLI** installed and configured
3. **Sui Agent Wallet** (optional, for wallet tools): [sui-skills](https://github.com/EasonC13-agent/sui-skills)

### Add to Claude Code

```bash
# Option 1: Run directly from GitHub (recommended)
claude mcp add sui -- npx -y sui-mcp

# Option 2: Clone and run locally
git clone https://github.com/EasonC13-agent/sui-mcp.git
cd sui-mcp
npm install
npm run build
claude mcp add sui -- node /path/to/sui-mcp/dist/index.js
```

### Verify Installation

```bash
claude mcp list
# Should show: sui
```

## Configuration

### Wallet Server URL

By default, the server connects to `http://localhost:3847` for wallet operations. 
Override with environment variable:

```bash
SUI_WALLET_SERVER=http://localhost:3847 npx sui-mcp
```

## Usage Examples

Once added to Claude Code, you can use natural language:

- "What's my Sui wallet address?"
- "Check my SUI balance"
- "Build the Move package at ./my-contract"
- "Run tests with coverage for the counter module"
- "Publish this contract to testnet"
- "Get info about object 0x123..."

### Contract Deployment Workflow

1. Build: `sui_move_build`
2. Generate unsigned tx: `sui_move_publish_unsigned`
3. Sign and execute: `sui_wallet_sign_execute`

## Related Projects

- [sui-agent-wallet](https://github.com/EasonC13-agent/sui-skills) - Chrome extension + local server for AI-controlled Sui wallet
- [sui-move skill](https://clawhub.com/skills/sui-move) - Sui Move development reference
- [sui-coverage skill](https://clawhub.com/skills/sui-coverage) - Test coverage analysis
- [sui-decompile skill](https://clawhub.com/skills/sui-decompile) - On-chain contract decompilation

## License

MIT
