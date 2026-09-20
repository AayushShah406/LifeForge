"""LifeForge Model Context Protocol (MCP) JSON-RPC 2.0 Server.
Allows external agents or clients to discover tools and execute them safely.
"""

import asyncio
import json
import sys
from typing import Any, Dict, Optional
from mcp.tools.schemas import MCP_TOOL_SCHEMAS


class MCPServer:
    """JSON-RPC 2.0 compliant Model Context Protocol Server."""

    def __init__(self, port: int = 8080):
        self.port = port
        self.tools = {t["name"]: t for t in MCP_TOOL_SCHEMAS}

    async def handle_request(self, request_json: Dict[str, Any]) -> Dict[str, Any]:
        req_id = request_json.get("id")
        method = request_json.get("method")
        params = request_json.get("params", {})

        if method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {"tools": list(self.tools.values())}
            }

        elif method == "tools/call":
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            user_id = params.get("user_id", "default_user")

            if tool_name not in self.tools:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32601, "message": f"Tool '{tool_name}' not found."}
                }

            # Execute tool through LifeForge ToolRegistry
            try:
                from app.tools.registry import tool_registry
                res = await tool_registry.execute_tool(
                    agent_name="mcp_client",
                    tool_name=tool_name,
                    user_id=user_id,
                    parameters=arguments
                )
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [{"type": "text", "text": json.dumps(res.data or {"error": res.error})}],
                        "isError": res.status == "error"
                    }
                }
            except Exception as e:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [{"type": "text", "text": f"Execution error: {str(e)}"}],
                        "isError": True
                    }
                }

        else:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32601, "message": f"Method '{method}' not implemented."}
            }


async def main():
    server = MCPServer()
    # Simple CLI / Stdio mode for MCP protocol compatibility
    if len(sys.argv) > 1 and sys.argv[1] == "--stdio":
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            req = json.loads(line)
            res = await server.handle_request(req)
            sys.stdout.write(json.dumps(res) + "\n")
            sys.stdout.flush()
    else:
        print(f"LifeForge MCP Server initialized with {len(MCP_TOOL_SCHEMAS)} registered tools.")


if __name__ == "__main__":
    asyncio.run(main())
