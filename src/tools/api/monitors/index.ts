import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AxiosInstance } from 'axios';
import {
  ToolCallResponse,
  ToolDefinition,
  ToolHandler,
} from '../../../types/index.js';
import { TOOL_DEFINITIONS } from './definitions.js';

export class MonitorTools implements ToolHandler {
  constructor(public axiosInstance: AxiosInstance) {}

  getToolDefinitions(): ToolDefinition[] {
    return TOOL_DEFINITIONS;
  }

  private createResponse(data: any): ToolCallResponse {
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
    };
  }

  async handleToolCall(name: string, args: any): Promise<ToolCallResponse> {
    try {
      switch (name) {
        case 'list_monitors':
          return await this.listMonitors(args.workspace);
        case 'get_monitor':
          return await this.getMonitor(args.monitorId);
        case 'create_monitor':
          return await this.createMonitor(args);
        case 'update_monitor':
          return await this.updateMonitor(args);
        case 'delete_monitor':
          return await this.deleteMonitor(args.monitorId);
        case 'run_monitor':
          return await this.runMonitor(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new McpError(ErrorCode.InvalidRequest, 'Unauthorized access');
      }
      if (error.response?.status === 403) {
        throw new McpError(ErrorCode.InvalidRequest, 'Feature unavailable or insufficient permissions');
      }
      throw error;
    }
  }

  async listMonitors(workspace?: string): Promise<ToolCallResponse> {
    const response = await this.axiosInstance.get('/monitors', {
      params: workspace ? { workspace } : undefined
    });
    return this.createResponse(response.data);
  }

  async getMonitor(monitorId: string): Promise<ToolCallResponse> {
    const response = await this.axiosInstance.get(`/monitors/${monitorId}`);
    return this.createResponse(response.data);
  }

  async createMonitor(args: any): Promise<ToolCallResponse> {
    const response = await this.axiosInstance.post('/monitors', {
      monitor: args.monitor,
      workspace: args.workspace ? { id: args.workspace, type: 'workspace' } : undefined
    });
    return this.createResponse(response.data);
  }

  async updateMonitor(args: any): Promise<ToolCallResponse> {
    const response = await this.axiosInstance.put(
      `/monitors/${args.monitorId}`,
      { monitor: args.monitor }
    );
    return this.createResponse(response.data);
  }

  async deleteMonitor(monitorId: string): Promise<ToolCallResponse> {
    const response = await this.axiosInstance.delete(`/monitors/${monitorId}`);
    return this.createResponse(response.data);
  }

  async runMonitor(args: any): Promise<ToolCallResponse> {
    const response = await this.axiosInstance.post(
      `/monitors/${args.monitorId}/run`,
      undefined,
      {
        params: args.async !== undefined ? { async: args.async } : undefined
      }
    );
    return this.createResponse(response.data);
  }
}
