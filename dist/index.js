#!/usr/bin/env node
/**
 * Sui MCP Server
 * Provides Sui blockchain tools for Claude Code via Model Context Protocol
 *
 * Tools provided:
 * - Wallet: address, balance, accounts, pending, approve, reject, switch_network, sign_execute
 * - CLI: sui_cli, move_build, move_test_coverage, move_publish_unsigned
 * - Query: sui_object, sui_decompile
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
const WALLET_SERVER = process.env.SUI_WALLET_SERVER || "http://localhost:3847";
const server = new McpServer({
    name: "sui-mcp",
    version: "1.0.0",
});
// Helper to run shell commands
async function runCommand(cmd, cwd) {
    try {
        const { stdout, stderr } = await execAsync(cmd, {
            cwd,
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            env: { ...process.env, PATH: process.env.PATH }
        });
        return stdout + (stderr ? `\n[stderr]: ${stderr}` : '');
    }
    catch (error) {
        return `Error: ${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`;
    }
}
// ============ Wallet Tools ============
server.tool("sui_wallet_address", "Get the current Sui Agent Wallet address", {}, async () => {
    const result = await runCommand(`curl -s ${WALLET_SERVER}/address`);
    return { content: [{ type: "text", text: result }] };
});
server.tool("sui_wallet_balance", "Get the balance of the current Sui Agent Wallet", {}, async () => {
    const result = await runCommand(`curl -s ${WALLET_SERVER}/balance`);
    return { content: [{ type: "text", text: result }] };
});
server.tool("sui_wallet_accounts", "List all accounts in the Sui Agent Wallet", {}, async () => {
    const result = await runCommand(`curl -s ${WALLET_SERVER}/accounts`);
    return { content: [{ type: "text", text: result }] };
});
server.tool("sui_wallet_pending", "Get pending transactions waiting for approval", {}, async () => {
    const result = await runCommand(`curl -s ${WALLET_SERVER}/pending`);
    return { content: [{ type: "text", text: result }] };
});
server.tool("sui_wallet_approve", "Approve a pending transaction by request ID", { requestId: z.string().describe("The request ID to approve") }, async ({ requestId }) => {
    const result = await runCommand(`curl -s -X POST ${WALLET_SERVER}/approve/${requestId}`);
    return { content: [{ type: "text", text: result }] };
});
server.tool("sui_wallet_reject", "Reject a pending transaction by request ID", { requestId: z.string().describe("The request ID to reject") }, async ({ requestId }) => {
    const result = await runCommand(`curl -s -X POST ${WALLET_SERVER}/reject/${requestId}`);
    return { content: [{ type: "text", text: result }] };
});
server.tool("sui_wallet_switch_network", "Switch the wallet network (mainnet, testnet, devnet, localnet)", { network: z.enum(["mainnet", "testnet", "devnet", "localnet"]).describe("Network to switch to") }, async ({ network }) => {
    const result = await runCommand(`curl -s -X POST ${WALLET_SERVER}/network -H "Content-Type: application/json" -d '{"network": "${network}"}'`);
    return { content: [{ type: "text", text: result }] };
});
server.tool("sui_wallet_sign_execute", "Sign and execute an unsigned transaction (base64 encoded tx bytes)", { txBytes: z.string().describe("Base64 encoded unsigned transaction bytes") }, async ({ txBytes }) => {
    const result = await runCommand(`curl -s -X POST ${WALLET_SERVER}/sign-and-execute -H "Content-Type: application/json" -d '{"txBytes": "${txBytes}"}'`);
    return { content: [{ type: "text", text: result }] };
});
// ============ CLI Tools ============
server.tool("sui_cli", "Run any Sui CLI command (e.g., 'client gas', 'move build', 'client object <id>')", {
    args: z.string().describe("Arguments to pass to sui CLI"),
    cwd: z.string().optional().describe("Working directory for the command")
}, async ({ args, cwd }) => {
    const result = await runCommand(`sui ${args}`, cwd);
    return { content: [{ type: "text", text: result }] };
});
server.tool("sui_move_build", "Build a Move package", { packagePath: z.string().describe("Path to the Move package directory") }, async ({ packagePath }) => {
    const result = await runCommand(`sui move build`, packagePath);
    return { content: [{ type: "text", text: result }] };
});
server.tool("sui_move_test_coverage", "Run Move tests with coverage analysis", {
    packagePath: z.string().describe("Path to the Move package"),
    module: z.string().optional().describe("Specific module to analyze coverage for")
}, async ({ packagePath, module }) => {
    let result = await runCommand(`sui move test --coverage --trace`, packagePath);
    if (module) {
        result += "\n\n--- Coverage Summary ---\n";
        result += await runCommand(`sui move coverage summary --module ${module}`, packagePath);
    }
    return { content: [{ type: "text", text: result }] };
});
server.tool("sui_move_publish_unsigned", "Generate unsigned transaction bytes for publishing a Move package (use with sui_wallet_sign_execute)", {
    packagePath: z.string().describe("Path to the Move package"),
    gasBudget: z.number().default(100000000).describe("Gas budget in MIST (default 0.1 SUI)")
}, async ({ packagePath, gasBudget }) => {
    // Get agent wallet address for sender
    const addrResult = await runCommand(`curl -s ${WALLET_SERVER}/address`);
    let address;
    try {
        address = JSON.parse(addrResult).address;
    }
    catch {
        return { content: [{ type: "text", text: `Failed to get wallet address: ${addrResult}` }] };
    }
    const result = await runCommand(`sui client publish --serialize-unsigned-transaction --sender ${address} --gas-budget ${gasBudget}`, packagePath);
    return { content: [{ type: "text", text: result }] };
});
// ============ Query Tools ============
server.tool("sui_object", "Get detailed information about a Sui object", { objectId: z.string().describe("The object ID to query") }, async ({ objectId }) => {
    const result = await runCommand(`sui client object ${objectId} --json`);
    return { content: [{ type: "text", text: result }] };
});
server.tool("sui_decompile", "Get URL to view decompiled source code for a Sui package on Suivision", { packageId: z.string().describe("The package ID to view") }, async ({ packageId }) => {
    const url = `https://suivision.xyz/package/${packageId}?tab=Code`;
    return {
        content: [{
                type: "text",
                text: `View source code at:\n${url}\n\nFor full decompilation, use the sui-decompile skill with browser automation.`
            }]
    };
});
// ============ Start Server ============
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Sui MCP Server running on stdio");
}
main().catch(console.error);
