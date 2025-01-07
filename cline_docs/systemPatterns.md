# System Patterns

## Architecture
- MCP Server Architecture
  - Handlers for resources and tools
  - TypeScript-based implementation
  - Stdio-based communication

## Key Components
1. Handlers
   - Resource handlers (collections, environments, APIs)
   - Tool handlers (operations and actions)
   - Prompt handlers (AI interactions)

2. Tools
   - API integration tools
   - Collection management
   - Environment management
   - Authentication handling

3. Types
   - Strong TypeScript typing
   - API interface definitions
   - Resource and tool schemas

## Design Patterns
- Resource-based architecture
- Type-safe API interactions
- Error handling with MCP error codes
- Environment-based configuration
- Handler-based request processing

## Code Organization
- src/
  - handlers/ - Request handling logic
  - tools/ - Tool implementations
  - types/ - TypeScript definitions
  - index.ts - Server entry point
  - server.ts - Core server implementation