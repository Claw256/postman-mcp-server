# Technical Context

## Technologies Used
- TypeScript/Node.js - Core implementation
- Model Context Protocol (MCP) - Server communication protocol
- Postman API - External service integration
- pnpm - Package management

## Development Setup
### Prerequisites
- Node.js installed
- Postman API key required
- MCP-compatible client (Claude Desktop, Cline, etc.)

### Build Process
1. Install dependencies: `pnpm install`
2. Build server: `pnpm run build`
3. Development mode: `pnpm run watch`

## Technical Constraints
- Communication via stdio (MCP protocol requirement)
- Requires valid Postman API key for all operations
- Must be configured in MCP settings for client tools
- No interactive authentication flows (all credentials via env vars)
- Server must be built before running