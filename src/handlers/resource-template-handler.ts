import { ListResourceTemplatesRequestSchema, ReadResourceRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import axios from 'axios';
import type { AxiosError } from 'axios';

interface PostmanErrorResponse {
  error?: {
    message?: string;
  };
}

/**
 * Handles resource template requests for dynamic Postman API resources
 */
export class ResourceTemplateHandler {
  constructor(private server: Server) {
    this.setupHandlers();
  }

  private setupHandlers() {
    this.setupListTemplates();
    this.setupReadResource();
  }

  private setupListTemplates() {
    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
      resourceTemplates: [
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

        // Mock Server Resources
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

        // Security & Access Control Resources
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
      ],
    }));
  }

  private setupReadResource() {
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        // Parse the URI to extract resource type and IDs
        const match = uri.match(/^postman:\/\/([^/]+)\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?/);
        if (!match) {
          throw new McpError(ErrorCode.InvalidRequest, `Invalid URI format: ${uri}`);
        }

        const [, resourceType, id, subResource, subId, finalResource] = match;
        let endpoint = '';

        // Map URI patterns to Postman API endpoints
        switch (resourceType) {
          case 'workspaces':
            endpoint = `/workspaces/${id}`;
            if (subResource === 'collections') endpoint += '/collections';
            if (subResource === 'environments') endpoint += '/environments';
            break;

          case 'apis':
            endpoint = `/apis/${id}`;
            if (subResource === 'versions') {
              endpoint += '/versions';
              if (subId) endpoint += `/${subId}`;
            }
            if (subResource === 'schemas') {
              endpoint += '/schemas';
              if (subId) {
                endpoint += `/${subId}`;
                if (finalResource === 'files') endpoint += '/files';
              }
            }
            if (subResource === 'comments') endpoint += '/comments';
            if (subResource === 'tags') endpoint += '/tags';
            break;

          case 'collections':
            endpoint = `/collections/${id}`;
            if (subResource === 'requests') endpoint += '/requests';
            if (subResource === 'folders') endpoint += '/folders';
            if (subResource === 'responses') endpoint += '/responses';
            if (subResource === 'forks') endpoint += '/forks';
            if (subResource === 'roles') endpoint += '/roles';
            break;

          case 'environments':
            endpoint = `/environments/${id}`;
            if (subResource === 'forks') endpoint += '/forks';
            break;

          case 'mocks':
            endpoint = `/mocks/${id}`;
            if (subResource === 'serverResponses') endpoint += '/serverResponses';
            if (subResource === 'callLogs') endpoint += '/callLogs';
            break;

          case 'monitors':
            endpoint = `/monitors/${id}`;
            if (subResource === 'runs') endpoint += '/runs';
            break;

          case 'pan':
            if (subResource === 'folders') {
              endpoint = `/pan/folders/${id}/elements`;
            }
            break;

          default:
            throw new McpError(ErrorCode.InvalidRequest, `Unknown resource type: ${resourceType}`);
        }

        if (!process.env.POSTMAN_API_KEY) {
          throw new McpError(ErrorCode.InternalError, 'Postman API key not configured');
        }

        // Make request to Postman API
        const response = await axios.get(`https://api.getpostman.com${endpoint}`, {
          headers: {
            'X-Api-Key': process.env.POSTMAN_API_KEY,
          },
        });

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<PostmanErrorResponse>;
          throw new McpError(
            ErrorCode.InternalError,
            `Postman API error: ${axiosError.response?.data?.error?.message || axiosError.message}`
          );
        }
        throw error;
      }
    });
  }
}
