## Monitors

### Implemented Operations
- Get all monitors (`GET /monitors`)
  - Parameters:
    - `#/components/parameters/workspaceResultsQuery`
  - Responses:
    - 200: `#/components/responses/getMonitors`
    - 401: `#/components/responses/common401Error`
    - 403: `#/components/responses/featureUnavailable403Error`
    - 500: `#/components/responses/common500ErrorServerError`

- Create monitor (`POST /monitors`)
  - Parameters:
    - `#/components/parameters/workspaceQuery`
  - Note: Cannot create monitors for collections added to an API definition
  - Request Body: `#/components/requestBodies/createMonitor`
  - Responses:
    - 200: `#/components/responses/createMonitor`
    - 400: `#/components/responses/monitors400CreateErrors`
    - 401: `#/components/responses/common401Error`
    - 403: `#/components/responses/common403ErrorAndFeatureUnavailable`
    - 500: `#/components/responses/common500ErrorServerError`

- Get specific monitor (`GET /monitors/{monitorId}`)
  - Parameters:
    - `#/components/parameters/monitorId` (required)
  - Responses:
    - 200: `#/components/responses/getMonitor`
    - 401: `#/components/responses/common401Error`
    - 403: `#/components/responses/featureUnavailable403Error`
    - 404: `#/components/responses/instanceNotFoundMonitor`
    - 500: `#/components/responses/common500ErrorServerError`

- Update monitor (`PUT /monitors/{monitorId}`)
  - Parameters:
    - `#/components/parameters/monitorId` (required)
  - Request Body: `#/components/requestBodies/updateMonitor`
  - Responses:
    - 200: `#/components/responses/updateMonitor`
    - 400: `#/components/responses/monitors400ErrorInvalidCronPattern`
    - 401: `#/components/responses/common401Error`
    - 403: `#/components/responses/featureUnavailable403Error`
    - 404: `#/components/responses/instanceNotFoundMonitor`
    - 500: `#/components/responses/common500ErrorServerError`

- Delete monitor (`DELETE /monitors/{monitorId}`)
  - Parameters:
    - `#/components/parameters/monitorId` (required)
  - Responses:
    - 200: `#/components/responses/deleteMonitor`
    - 401: `#/components/responses/common401Error`
    - 403: `#/components/responses/featureUnavailable403Error`
    - 500: `#/components/responses/common500ErrorServerError`

- Run monitor (`POST /monitors/{monitorId}/run`)
  - Parameters:
    - `#/components/parameters/monitorId` (required)
    - `#/components/parameters/async`
  - Note: For async=true, response won't include stats, executions, and failures
  - Note: Use GET /monitors/{id} to get this information for async runs
  - Responses:
    - 200: `#/components/responses/runMonitor`
    - 401: `#/components/responses/common401Error`
    - 403: `#/components/responses/featureUnavailable403Error`
    - 500: `#/components/responses/common500ErrorServerError`

### Key Features
- Monitor CRUD operations
- Scheduled runs
- Manual run capability
- Run results and statistics
- Workspace integration
- Async/sync run modes
- Feature availability control
