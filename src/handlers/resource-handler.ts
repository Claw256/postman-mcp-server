import { ListResourcesRequestSchema, ReadResourceRequestSchema, ListResourceTemplatesRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import { BaseResourceHandler, Resource, ResourceTemplate, ResourceContent } from '../types/resource.js';

interface PostmanErrorResponse {
  error?: {
    message?: string;
  };
}

/**
 * Handles resource requests for Postman API resources
 */
export class McpResourceHandler extends BaseResourceHandler {
  // Rest of the code remains the same until the readResource method's catch block
  // Set of valid direct resource types (no parameters)
  private static readonly DIRECT_RESOURCES = new Set([
    'workspaces',
    'user',
    'apis',
    'collections',
    'environments',
    'mocks',
    'monitors',
    'collection-roles',
    'workspace-roles',
    'collection-access-keys',
    'pan-elements',
    'webhooks',
    'tagged-elements',
    'workspace-tags',
    'api-tags'
  ]);

  // Rate limiting configuration
  private static readonly RATE_LIMIT = {
    maxRequests: Number(process.env.POSTMAN_RATE_LIMIT_MAX) || 60,
    windowMs: Number(process.env.POSTMAN_RATE_LIMIT_WINDOW) || 60000 // 1 minute
  };

  private requestCount: number = 0;
  private windowStart: number = Date.now();

  constructor(private server: Server) {
    super();
    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: await this.listResources()
    }));

    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates: await this.listResourceTemplates()
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => ({
      contents: await this.readResource(request.params.uri)
    }));
  }

  /**
   * List all available direct resources
   */
  async listResources(): Promise<Resource[]> {
    return [
      // Core Resources
      {
        uri: 'postman://workspaces',
        name: 'Postman Workspaces',
        description: 'List of all available Postman workspaces',
        mimeType: 'application/json',
      },
      {
        uri: 'postman://user',
        name: 'Current User',
        description: 'Information about the currently authenticated user',
        mimeType: 'application/json',
      },
      // API Development Resources
      {
        uri: 'postman://apis',
        name: 'Postman APIs',
        description: 'List of all available API definitions',
        mimeType: 'application/json',
      },
      {
        uri: 'postman://collections',
        name: 'Postman Collections',
        description: 'List of all available request collections',
        mimeType: 'application/json',
      },
      {
        uri: 'postman://environments',
        name: 'Postman Environments',
        description: 'List of all available environments',
        mimeType: 'application/json',
      },
      // Testing & Monitoring Resources
      {
        uri: 'postman://mocks',
        name: 'Postman Mocks',
        description: 'List of all available mock servers',
        mimeType: 'application/json',
      },
      {
        uri: 'postman://monitors',
        name: 'Postman Monitors',
        description: 'List of all available collection monitors',
        mimeType: 'application/json',
      },
      // Security & Access Control Resources
      {
        uri: 'postman://collection-roles',
        name: 'Collection Roles',
        description: 'List of roles and permissions for collections',
        mimeType: 'application/json',
      },
      {
        uri: 'postman://workspace-roles',
        name: 'Workspace Roles',
        description: 'List of roles and permissions for workspaces',
        mimeType: 'application/json',
      },
      {
        uri: 'postman://collection-access-keys',
        name: 'Collection Access Keys',
        description: 'List of access keys for collections',
        mimeType: 'application/json',
      },
      // Additional Features
      {
        uri: 'postman://pan-elements',
        name: 'Private API Network Elements',
        description: 'List of elements in the Private API Network',
        mimeType: 'application/json',
      },
      {
        uri: 'postman://webhooks',
        name: 'Webhooks',
        description: 'List of configured webhooks',
        mimeType: 'application/json',
      },
      {
        uri: 'postman://tagged-elements',
        name: 'Tagged Elements',
        description: 'List of elements with specific tags',
        mimeType: 'application/json',
      },
      {
        uri: 'postman://workspace-tags',
        name: 'Workspace Tags',
        description: 'List of tags used in workspaces',
        mimeType: 'application/json',
      },
      {
        uri: 'postman://api-tags',
        name: 'API Tags',
        description: 'List of tags used in APIs',
        mimeType: 'application/json',
      }
    ];
  }

  /**
   * List all available resource templates
   */
  async listResourceTemplates(): Promise<ResourceTemplate[]> {
    return [
      // Workspace Resources
      {
        uriTemplate: 'postman://workspaces/{workspaceId}/collections',
        name: 'Workspace Collections',
        description: 'List of collections in a specific workspace',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://workspaces/{workspaceId}/environments',
        name: 'Workspace Environments',
        description: 'List of environments in a specific workspace',
        mimeType: 'application/json',
      },
      // API Resources
      {
        uriTemplate: 'postman://apis/{apiId}',
        name: 'API Details',
        description: 'Details of a specific API',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://apis/{apiId}/versions',
        name: 'API Versions',
        description: 'List of versions for a specific API',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://apis/{apiId}/versions/{versionId}',
        name: 'API Version Details',
        description: 'Details of a specific API version',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://apis/{apiId}/schemas',
        name: 'API Schemas',
        description: 'List of schemas for a specific API',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://apis/{apiId}/schemas/{schemaId}/files',
        name: 'API Schema Files',
        description: 'List of files in an API schema',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://apis/{apiId}/comments',
        name: 'API Comments',
        description: 'List of comments on a specific API',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://apis/{apiId}/tags',
        name: 'API Tags',
        description: 'Tags associated with a specific API',
        mimeType: 'application/json',
      },
      // Collection Resources
      {
        uriTemplate: 'postman://collections/{collectionId}',
        name: 'Collection Details',
        description: 'Details of a specific collection',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://collections/{collectionId}/requests',
        name: 'Collection Requests',
        description: 'List of requests in a specific collection',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://collections/{collectionId}/folders',
        name: 'Collection Folders',
        description: 'List of folders in a specific collection',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://collections/{collectionId}/responses',
        name: 'Collection Responses',
        description: 'List of saved responses in a specific collection',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://collections/{collectionId}/forks',
        name: 'Collection Forks',
        description: 'List of forks of a specific collection',
        mimeType: 'application/json',
      },
      // Environment Resources
      {
        uriTemplate: 'postman://environments/{environmentId}',
        name: 'Environment Details',
        description: 'Details of a specific environment',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://environments/{environmentId}/forks',
        name: 'Environment Forks',
        description: 'List of forks of a specific environment',
        mimeType: 'application/json',
      },
      // Mock Resources
      {
        uriTemplate: 'postman://mocks/{mockId}',
        name: 'Mock Server Details',
        description: 'Details of a specific mock server',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://mocks/{mockId}/serverResponses',
        name: 'Mock Server Responses',
        description: 'List of server responses for a specific mock',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://mocks/{mockId}/callLogs',
        name: 'Mock Call Logs',
        description: 'Call logs for a specific mock server',
        mimeType: 'application/json',
      },
      // Monitor Resources
      {
        uriTemplate: 'postman://monitors/{monitorId}',
        name: 'Monitor Details',
        description: 'Details of a specific monitor',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://monitors/{monitorId}/runs',
        name: 'Monitor Runs',
        description: 'List of runs for a specific monitor',
        mimeType: 'application/json',
      },
      // Role Resources
      {
        uriTemplate: 'postman://collections/{collectionId}/roles',
        name: 'Collection Roles',
        description: 'List of roles for a specific collection',
        mimeType: 'application/json',
      },
      {
        uriTemplate: 'postman://workspaces/{workspaceId}/roles',
        name: 'Workspace Roles',
        description: 'List of roles for a specific workspace',
        mimeType: 'application/json',
      },
      // PAN Resources
      {
        uriTemplate: 'postman://pan/folders/{folderId}/elements',
        name: 'PAN Folder Elements',
        description: 'List of elements in a specific Private API Network folder',
        mimeType: 'application/json',
      }
    ];
  }

  /**
   * Read a resource's contents
   */
  async readResource(uri: string): Promise<ResourceContent[]> {
    await this.checkRateLimit();

    const { protocol, resourceType, params } = this.parseUri(uri);

    if (protocol !== 'postman') {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Invalid protocol: ${protocol}. Expected: postman`
      );
    }

    // For direct resources, validate against DIRECT_RESOURCES
    if (Object.keys(params).length === 0 && !McpResourceHandler.DIRECT_RESOURCES.has(resourceType)) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown direct resource type: ${resourceType}`
      );
    }

    try {
      const endpoint = this.buildEndpoint(resourceType, params);
      const response = await this.makePostmanRequest(endpoint);

      return [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(response.data, null, 2)
      }];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<PostmanErrorResponse>;
        if (axiosError.response?.status === 429) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Postman API rate limit exceeded'
          );
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Postman API error: ${axiosError.response?.data?.error?.message || axiosError.message}`
        );
      }
      throw error;
    }
  }

  private async checkRateLimit() {
    const now = Date.now();
    if (now - this.windowStart >= McpResourceHandler.RATE_LIMIT.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    if (this.requestCount >= McpResourceHandler.RATE_LIMIT.maxRequests) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Rate limit exceeded. Maximum ${McpResourceHandler.RATE_LIMIT.maxRequests} requests per ${McpResourceHandler.RATE_LIMIT.windowMs / 1000} seconds.`
      );
    }

    this.requestCount++;
  }

  private async makePostmanRequest(endpoint: string): Promise<AxiosResponse> {
    if (!process.env.POSTMAN_API_KEY) {
      throw new McpError(ErrorCode.InternalError, 'Postman API key not configured');
    }

    return await axios.get(`https://api.getpostman.com${endpoint}`, {
      headers: {
        'X-Api-Key': process.env.POSTMAN_API_KEY
      }
    });
  }

  private buildEndpoint(resourceType: string, params: Record<string, string>): string {
    // Map resource types to Postman API endpoints
    switch (resourceType) {
      // Direct resources
      case 'workspaces':
        return '/workspaces';
      case 'user':
        return '/me';
      case 'apis':
        return '/apis';
      case 'collections':
        return '/collections';
      case 'environments':
        return '/environments';
      case 'mocks':
        return '/mocks';
      case 'monitors':
        return '/monitors';
      case 'collection-roles':
        return '/roles/collections';
      case 'workspace-roles':
        return '/roles/workspaces';
      case 'collection-access-keys':
        return '/collection-access-keys';
      case 'pan-elements':
        return '/pan/elements';
      case 'webhooks':
        return '/webhooks';
      case 'tagged-elements':
        return '/tagged-elements';
      case 'workspace-tags':
        return '/workspace-tags';
      case 'api-tags':
        return '/api-tags';

      // Workspace resources
      case 'workspaces-collections':
        return `/workspaces/${params.workspaceId}/collections`;
      case 'workspaces-environments':
        return `/workspaces/${params.workspaceId}/environments`;

      // API resources
      case 'apis-details':
        return `/apis/${params.apiId}`;
      case 'apis-versions':
        return `/apis/${params.apiId}/versions`;
      case 'apis-version-details':
        return `/apis/${params.apiId}/versions/${params.versionId}`;
      case 'apis-schemas':
        return `/apis/${params.apiId}/schemas`;
      case 'apis-schema-files':
        return `/apis/${params.apiId}/schemas/${params.schemaId}/files`;
      case 'apis-comments':
        return `/apis/${params.apiId}/comments`;
      case 'apis-tags':
        return `/apis/${params.apiId}/tags`;

      // Collection resources
      case 'collections-details':
        return `/collections/${params.collectionId}`;
      case 'collections-requests':
        return `/collections/${params.collectionId}/requests`;
      case 'collections-folders':
        return `/collections/${params.collectionId}/folders`;
      case 'collections-responses':
        return `/collections/${params.collectionId}/responses`;
      case 'collections-forks':
        return `/collections/${params.collectionId}/forks`;
      case 'collections-roles':
        return `/collections/${params.collectionId}/roles`;

      // Environment resources
      case 'environments-details':
        return `/environments/${params.environmentId}`;
      case 'environments-forks':
        return `/environments/${params.environmentId}/forks`;

      // Mock resources
      case 'mocks-details':
        return `/mocks/${params.mockId}`;
      case 'mocks-server-responses':
        return `/mocks/${params.mockId}/serverResponses`;
      case 'mocks-call-logs':
        return `/mocks/${params.mockId}/callLogs`;

      // Monitor resources
      case 'monitors-details':
        return `/monitors/${params.monitorId}`;
      case 'monitors-runs':
        return `/monitors/${params.monitorId}/runs`;

      // PAN resources
      case 'pan-folder-elements':
        return `/pan/folders/${params.folderId}/elements`;

      default:
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Unsupported resource type: ${resourceType}`
        );
    }
  }
}
