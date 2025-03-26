Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools. Whether you’re building an AI-powered IDE, enhancing a chat interface, or creating custom AI workflows, MCP provides a standardized way to connect LLMs with the context they need.

This specification defines the authoritative protocol requirements, based on the TypeScript schema in schema.ts.

For implementation guides and examples, visit modelcontextprotocol.io.

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “NOT RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in BCP 14 [RFC2119] [RFC8174] when, and only when, they appear in all capitals, as shown here.

Overview
MCP provides a standardized way for applications to:

Share contextual information with language models
Expose tools and capabilities to AI systems
Build composable integrations and workflows
The protocol uses JSON-RPC 2.0 messages to establish communication between:

Hosts: LLM applications that initiate connections
Clients: Connectors within the host application
Servers: Services that provide context and capabilities
MCP takes some inspiration from the Language Server Protocol, which standardizes how to add support for programming languages across a whole ecosystem of development tools. In a similar way, MCP standardizes how to integrate additional context and tools into the ecosystem of AI applications.

Key Details
Base Protocol
JSON-RPC message format
Stateful connections
Server and client capability negotiation
Features
Servers offer any of the following features to clients:

Resources: Context and data, for the user or the AI model to use
Prompts: Templated messages and workflows for users
Tools: Functions for the AI model to execute
Clients may offer the following feature to servers:

Sampling: Server-initiated agentic behaviors and recursive LLM interactions
Additional Utilities
Configuration
Progress tracking
Cancellation
Error reporting
Logging
Security and Trust & Safety
The Model Context Protocol enables powerful capabilities through arbitrary data access and code execution paths. With this power comes important security and trust considerations that all implementors must carefully address.

Key Principles
User Consent and Control

Users must explicitly consent to and understand all data access and operations
Users must retain control over what data is shared and what actions are taken
Implementors should provide clear UIs for reviewing and authorizing activities
Data Privacy

Hosts must obtain explicit user consent before exposing user data to servers
Hosts must not transmit resource data elsewhere without user consent
User data should be protected with appropriate access controls
Tool Safety

Tools represent arbitrary code execution and must be treated with appropriate caution
Hosts must obtain explicit user consent before invoking any tool
Users should understand what each tool does before authorizing its use
LLM Sampling Controls

Users must explicitly approve any LLM sampling requests
Users should control:
Whether sampling occurs at all
The actual prompt that will be sent
What results the server can see
The protocol intentionally limits server visibility into prompts
Implementation Guidelines
While MCP itself cannot enforce these security principles at the protocol level, implementors SHOULD:

Build robust consent and authorization flows into their applications
Provide clear documentation of security implications
Implement appropriate access controls and data protections
Follow security best practices in their integrations
Consider privacy implications in their feature designs

Architecture
The Model Context Protocol (MCP) follows a client-host-server architecture where each host can run multiple client instances. This architecture enables users to integrate AI capabilities across applications while maintaining clear security boundaries and isolating concerns. Built on JSON-RPC, MCP provides a stateful session protocol focused on context exchange and sampling coordination between clients and servers.

Core Components
Internet
Local machine
Application Host Process
Server 3
External APIs
Remote
Resource C
Server 1
Files & Git
Server 2
Database
Local
Resource A
Local
Resource B
Host
Client 1
Client 2
Client 3
Host
The host process acts as the container and coordinator:

Creates and manages multiple client instances
Controls client connection permissions and lifecycle
Enforces security policies and consent requirements
Handles user authorization decisions
Coordinates AI/LLM integration and sampling
Manages context aggregation across clients
Clients
Each client is created by the host and maintains an isolated server connection:

Establishes one stateful session per server
Handles protocol negotiation and capability exchange
Routes protocol messages bidirectionally
Manages subscriptions and notifications
Maintains security boundaries between servers
A host application creates and manages multiple clients, with each client having a 1:1 relationship with a particular server.

Servers
Servers provide specialized context and capabilities:

Expose resources, tools and prompts via MCP primitives
Operate independently with focused responsibilities
Request sampling through client interfaces
Must respect security constraints
Can be local processes or remote services
Design Principles
MCP is built on several key design principles that inform its architecture and implementation:

Servers should be extremely easy to build

Host applications handle complex orchestration responsibilities
Servers focus on specific, well-defined capabilities
Simple interfaces minimize implementation overhead
Clear separation enables maintainable code
Servers should be highly composable

Each server provides focused functionality in isolation
Multiple servers can be combined seamlessly
Shared protocol enables interoperability
Modular design supports extensibility
Servers should not be able to read the whole conversation, nor “see into” other servers

Servers receive only necessary contextual information
Full conversation history stays with the host
Each server connection maintains isolation
Cross-server interactions are controlled by the host
Host process enforces security boundaries
Features can be added to servers and clients progressively

Core protocol provides minimal required functionality
Additional capabilities can be negotiated as needed
Servers and clients evolve independently
Protocol designed for future extensibility
Backwards compatibility is maintained
Message Types
MCP defines three core message types based on JSON-RPC 2.0:

Requests: Bidirectional messages with method and parameters expecting a response
Responses: Successful results or errors matching specific request IDs
Notifications: One-way messages requiring no response
Each message type follows the JSON-RPC 2.0 specification for structure and delivery semantics.

Capability Negotiation
The Model Context Protocol uses a capability-based negotiation system where clients and servers explicitly declare their supported features during initialization. Capabilities determine which protocol features and primitives are available during a session.

Servers declare capabilities like resource subscriptions, tool support, and prompt templates
Clients declare capabilities like sampling support and notification handling
Both parties must respect declared capabilities throughout the session
Additional capabilities can be negotiated through extensions to the protocol
Server
Client
Host
Server
Client
Host
Active Session with Negotiated Features
loop
[Client Requests]
loop
[Server Requests]
loop
[Notifications]
Initialize client
Initialize session with capabilities
Respond with supported capabilities
User- or model-initiated action
Request (tools/resources)
Response
Update UI or respond to model
Request (sampling)
Forward to AI
AI response
Response
Resource updates
Status changes
Terminate
End session
Each capability unlocks specific protocol features for use during the session. For example:

Implemented server features must be advertised in the server’s capabilities
Emitting resource subscription notifications requires the server to declare subscription support
Tool invocation requires the server to declare tool capabilities
Sampling requires the client to declare support in its capabilities
This capability negotiation ensures clients and servers have a clear understanding of supported functionality while maintaining protocol extensibility.

Base Protocol
Protocol Revision: 2024-11-05
All messages between MCP clients and servers MUST follow the JSON-RPC 2.0 specification. The protocol defines three fundamental types of messages:

Type Description Requirements
Requests Messages sent to initiate an operation Must include unique ID and method name
Responses Messages sent in reply to requests Must include same ID as request
Notifications One-way messages with no reply Must not include an ID
Responses are further sub-categorized as either successful results or errors. Results can follow any JSON object structure, while errors must include an error code and message at minimum.

Protocol Layers
The Model Context Protocol consists of several key components that work together:

Base Protocol: Core JSON-RPC message types
Lifecycle Management: Connection initialization, capability negotiation, and session control
Server Features: Resources, prompts, and tools exposed by servers
Client Features: Sampling and root directory lists provided by clients
Utilities: Cross-cutting concerns like logging and argument completion
All implementations MUST support the base protocol and lifecycle management components. Other components MAY be implemented based on the specific needs of the application.

These protocol layers establish clear separation of concerns while enabling rich interactions between clients and servers. The modular design allows implementations to support exactly the features they need.

See the following pages for more details on the different components:

Lifecycle
Resources
Prompts
Tools
Logging
Sampling
Auth
Authentication and authorization are not currently part of the core MCP specification, but we are considering ways to introduce them in future. Join us in GitHub Discussions to help shape the future of the protocol!

Clients and servers MAY negotiate their own custom authentication and authorization strategies.

Schema
The full specification of the protocol is defined as a TypeScript schema. This is the source of truth for all protocol messages and structures.

There is also a JSON Schema, which is automatically generated from the TypeScript source of truth, for use with various automated tooling.

Server Features
Protocol Revision: 2024-11-05
Servers provide the fundamental building blocks for adding context to language models via MCP. These primitives enable rich interactions between clients, servers, and language models:

Prompts: Pre-defined templates or instructions that guide language model interactions
Resources: Structured data or content that provides additional context to the model
Tools: Executable functions that allow models to perform actions or retrieve information
Each primitive can be summarized in the following control hierarchy:

Primitive Control Description Example
Prompts User-controlled Interactive templates invoked by user choice Slash commands, menu options
Resources Application-controlled Contextual data attached and managed by the client File contents, git history
Tools Model-controlled Functions exposed to the LLM to take actions API POST requests, file writing
Explore these key primitives in more detail below:

Prompts
Protocol Revision: 2024-11-05
The Model Context Protocol (MCP) provides a standardized way for servers to expose prompt templates to clients. Prompts allow servers to provide structured messages and instructions for interacting with language models. Clients can discover available prompts, retrieve their contents, and provide arguments to customize them.

User Interaction Model
Prompts are designed to be user-controlled, meaning they are exposed from servers to clients with the intention of the user being able to explicitly select them for use.

Typically, prompts would be triggered through user-initiated commands in the user interface, which allows users to naturally discover and invoke available prompts.

For example, as slash commands:

Example of prompt exposed as slash command

However, implementors are free to expose prompts through any interface pattern that suits their needs—the protocol itself does not mandate any specific user interaction model.

Capabilities
Servers that support prompts MUST declare the prompts capability during initialization:

{
"capabilities": {
"prompts": {
"listChanged": true
}
}
}

listChanged indicates whether the server will emit notifications when the list of available prompts changes.

Protocol Messages
Listing Prompts
To retrieve available prompts, clients send a prompts/list request. This operation supports pagination.

Request:

{
"jsonrpc": "2.0",
"id": 1,
"method": "prompts/list",
"params": {
"cursor": "optional-cursor-value"
}
}

Response:

{
"jsonrpc": "2.0",
"id": 1,
"result": {
"prompts": [
{
"name": "code_review",
"description": "Asks the LLM to analyze code quality and suggest improvements",
"arguments": [
{
"name": "code",
"description": "The code to review",
"required": true
}
]
}
],
"nextCursor": "next-page-cursor"
}
}

Getting a Prompt
To retrieve a specific prompt, clients send a prompts/get request. Arguments may be auto-completed through the completion API.

Request:

{
"jsonrpc": "2.0",
"id": 2,
"method": "prompts/get",
"params": {
"name": "code_review",
"arguments": {
"code": "def hello():\n print('world')"
}
}
}

Response:

{
"jsonrpc": "2.0",
"id": 2,
"result": {
"description": "Code review prompt",
"messages": [
{
"role": "user",
"content": {
"type": "text",
"text": "Please review this Python code:\ndef hello():\n print('world')"
}
}
]
}
}

List Changed Notification
When the list of available prompts changes, servers that declared the listChanged capability SHOULD send a notification:

{
"jsonrpc": "2.0",
"method": "notifications/prompts/list_changed"
}

Message Flow
Server
Client
Server
Client
Discovery
Usage
Changes
opt
[listChanged]
prompts/list
List of prompts
prompts/get
Prompt content
prompts/list_changed
prompts/list
Updated prompts
Data Types
Prompt
A prompt definition includes:

name: Unique identifier for the prompt
description: Optional human-readable description
arguments: Optional list of arguments for customization
PromptMessage
Messages in a prompt can contain:

role: Either “user” or “assistant” to indicate the speaker
content: One of the following content types:
Text Content
Text content represents plain text messages:

{
"type": "text",
"text": "The text content of the message"
}

This is the most common content type used for natural language interactions.

Image Content
Image content allows including visual information in messages:

{
"type": "image",
"data": "base64-encoded-image-data",
"mimeType": "image/png"
}

The image data MUST be base64-encoded and include a valid MIME type. This enables multi-modal interactions where visual context is important.

Embedded Resources
Embedded resources allow referencing server-side resources directly in messages:

{
"type": "resource",
"resource": {
"uri": "resource://example",
"mimeType": "text/plain",
"text": "Resource content"
}
}

Resources can contain either text or binary (blob) data and MUST include:

A valid resource URI
The appropriate MIME type
Either text content or base64-encoded blob data
Embedded resources enable prompts to seamlessly incorporate server-managed content like documentation, code samples, or other reference materials directly into the conversation flow.

Error Handling
Servers SHOULD return standard JSON-RPC errors for common failure cases:

Invalid prompt name: -32602 (Invalid params)
Missing required arguments: -32602 (Invalid params)
Internal errors: -32603 (Internal error)
Implementation Considerations
Servers SHOULD validate prompt arguments before processing
Clients SHOULD handle pagination for large prompt lists
Both parties SHOULD respect capability negotiation
Security
Implementations MUST carefully validate all prompt inputs and outputs to prevent injection attacks or unauthorized access to resources.

Resources
Protocol Revision: 2024-11-05
The Model Context Protocol (MCP) provides a standardized way for servers to expose resources to clients. Resources allow servers to share data that provides context to language models, such as files, database schemas, or application-specific information. Each resource is uniquely identified by a URI.

User Interaction Model
Resources in MCP are designed to be application-driven, with host applications determining how to incorporate context based on their needs.

For example, applications could:

Expose resources through UI elements for explicit selection, in a tree or list view
Allow the user to search through and filter available resources
Implement automatic context inclusion, based on heuristics or the AI model’s selection
Example of resource context picker

However, implementations are free to expose resources through any interface pattern that suits their needs—the protocol itself does not mandate any specific user interaction model.

Capabilities
Servers that support resources MUST declare the resources capability:

{
"capabilities": {
"resources": {
"subscribe": true,
"listChanged": true
}
}
}

The capability supports two optional features:

subscribe: whether the client can subscribe to be notified of changes to individual resources.
listChanged: whether the server will emit notifications when the list of available resources changes.
Both subscribe and listChanged are optional—servers can support neither, either, or both:

{
"capabilities": {
"resources": {} // Neither feature supported
}
}

{
"capabilities": {
"resources": {
"subscribe": true // Only subscriptions supported
}
}
}

{
"capabilities": {
"resources": {
"listChanged": true // Only list change notifications supported
}
}
}

Protocol Messages
Listing Resources
To discover available resources, clients send a resources/list request. This operation supports pagination.

Request:

{
"jsonrpc": "2.0",
"id": 1,
"method": "resources/list",
"params": {
"cursor": "optional-cursor-value"
}
}

Response:

{
"jsonrpc": "2.0",
"id": 1,
"result": {
"resources": [
{
"uri": "file:///project/src/main.rs",
"name": "main.rs",
"description": "Primary application entry point",
"mimeType": "text/x-rust"
}
],
"nextCursor": "next-page-cursor"
}
}

Reading Resources
To retrieve resource contents, clients send a resources/read request:

Request:

{
"jsonrpc": "2.0",
"id": 2,
"method": "resources/read",
"params": {
"uri": "file:///project/src/main.rs"
}
}

Response:

{
"jsonrpc": "2.0",
"id": 2,
"result": {
"contents": [
{
"uri": "file:///project/src/main.rs",
"mimeType": "text/x-rust",
"text": "fn main() {\n println!(\"Hello world!\");\n}"
}
]
}
}

Resource Templates
Resource templates allow servers to expose parameterized resources using URI templates. Arguments may be auto-completed through the completion API.

Request:

{
"jsonrpc": "2.0",
"id": 3,
"method": "resources/templates/list"
}

Response:

{
"jsonrpc": "2.0",
"id": 3,
"result": {
"resourceTemplates": [
{
"uriTemplate": "file:///{path}",
"name": "Project Files",
"description": "Access files in the project directory",
"mimeType": "application/octet-stream"
}
]
}
}

List Changed Notification
When the list of available resources changes, servers that declared the listChanged capability SHOULD send a notification:

{
"jsonrpc": "2.0",
"method": "notifications/resources/list_changed"
}

Subscriptions
The protocol supports optional subscriptions to resource changes. Clients can subscribe to specific resources and receive notifications when they change:

Subscribe Request:

{
"jsonrpc": "2.0",
"id": 4,
"method": "resources/subscribe",
"params": {
"uri": "file:///project/src/main.rs"
}
}

Update Notification:

{
"jsonrpc": "2.0",
"method": "notifications/resources/updated",
"params": {
"uri": "file:///project/src/main.rs"
}
}

Message Flow
Server
Client
Server
Client
Resource Discovery
Resource Access
Subscriptions
Updates
resources/list
List of resources
resources/read
Resource contents
resources/subscribe
Subscription confirmed
notifications/resources/updated
resources/read
Updated contents
Data Types
Resource
A resource definition includes:

uri: Unique identifier for the resource
name: Human-readable name
description: Optional description
mimeType: Optional MIME type
Resource Contents
Resources can contain either text or binary data:

Text Content
{
"uri": "file:///example.txt",
"mimeType": "text/plain",
"text": "Resource content"
}

Binary Content
{
"uri": "file:///example.png",
"mimeType": "image/png",
"blob": "base64-encoded-data"
}

Common URI Schemes
The protocol defines several standard URI schemes. This list not exhaustive—implementations are always free to use additional, custom URI schemes.

https://
Used to represent a resource available on the web.

Servers SHOULD use this scheme only when the client is able to fetch and load the resource directly from the web on its own—that is, it doesn’t need to read the resource via the MCP server.

For other use cases, servers SHOULD prefer to use another URI scheme, or define a custom one, even if the server will itself be downloading resource contents over the internet.

file://
Used to identify resources that behave like a filesystem. However, the resources do not need to map to an actual physical filesystem.

MCP servers MAY identify file:// resources with an XDG MIME type, like inode/directory, to represent non-regular files (such as directories) that don’t otherwise have a standard MIME type.

git://
Git version control integration.

Error Handling
Servers SHOULD return standard JSON-RPC errors for common failure cases:

Resource not found: -32002
Internal errors: -32603
Example error:

{
"jsonrpc": "2.0",
"id": 5,
"error": {
"code": -32002,
"message": "Resource not found",
"data": {
"uri": "file:///nonexistent.txt"
}
}
}

Security Considerations
Servers MUST validate all resource URIs
Access controls SHOULD be implemented for sensitive resources
Binary data MUST be properly encoded
Resource permissions SHOULD be checked before operations

Tools
Protocol Revision: 2024-11-05
The Model Context Protocol (MCP) allows servers to expose tools that can be invoked by language models. Tools enable models to interact with external systems, such as querying databases, calling APIs, or performing computations. Each tool is uniquely identified by a name and includes metadata describing its schema.

User Interaction Model
Tools in MCP are designed to be model-controlled, meaning that the language model can discover and invoke tools automatically based on its contextual understanding and the user’s prompts.

However, implementations are free to expose tools through any interface pattern that suits their needs—the protocol itself does not mandate any specific user interaction model.

For trust & safety and security, there SHOULD always be a human in the loop with the ability to deny tool invocations.

Applications SHOULD:

Provide UI that makes clear which tools are being exposed to the AI model
Insert clear visual indicators when tools are invoked
Present confirmation prompts to the user for operations, to ensure a human is in the loop
Capabilities
Servers that support tools MUST declare the tools capability:

{
"capabilities": {
"tools": {
"listChanged": true
}
}
}

listChanged indicates whether the server will emit notifications when the list of available tools changes.

Protocol Messages
Listing Tools
To discover available tools, clients send a tools/list request. This operation supports pagination.

Request:

{
"jsonrpc": "2.0",
"id": 1,
"method": "tools/list",
"params": {
"cursor": "optional-cursor-value"
}
}

Response:

{
"jsonrpc": "2.0",
"id": 1,
"result": {
"tools": [
{
"name": "get_weather",
"description": "Get current weather information for a location",
"inputSchema": {
"type": "object",
"properties": {
"location": {
"type": "string",
"description": "City name or zip code"
}
},
"required": ["location"]
}
}
],
"nextCursor": "next-page-cursor"
}
}

Calling Tools
To invoke a tool, clients send a tools/call request:

Request:

{
"jsonrpc": "2.0",
"id": 2,
"method": "tools/call",
"params": {
"name": "get_weather",
"arguments": {
"location": "New York"
}
}
}

Response:

{
"jsonrpc": "2.0",
"id": 2,
"result": {
"content": [
{
"type": "text",
"text": "Current weather in New York:\nTemperature: 72°F\nConditions: Partly cloudy"
}
],
"isError": false
}
}

List Changed Notification
When the list of available tools changes, servers that declared the listChanged capability SHOULD send a notification:

{
"jsonrpc": "2.0",
"method": "notifications/tools/list_changed"
}

Message Flow
Server
Client
LLM
Server
Client
LLM
Discovery
Tool Selection
Invocation
Updates
tools/list
List of tools
Select tool to use
tools/call
Tool result
Process result
tools/list_changed
tools/list
Updated tools
Data Types
Tool
A tool definition includes:

name: Unique identifier for the tool
description: Human-readable description of functionality
inputSchema: JSON Schema defining expected parameters
Tool Result
Tool results can contain multiple content items of different types:

Text Content
{
"type": "text",
"text": "Tool result text"
}

Image Content
{
"type": "image",
"data": "base64-encoded-data",
"mimeType": "image/png"
}

Embedded Resources
Resources MAY be embedded, to provide additional context or data, behind a URI that can be subscribed to or fetched again by the client later:

{
"type": "resource",
"resource": {
"uri": "resource://example",
"mimeType": "text/plain",
"text": "Resource content"
}
}

Error Handling
Tools use two error reporting mechanisms:

Protocol Errors: Standard JSON-RPC errors for issues like:

Unknown tools
Invalid arguments
Server errors
Tool Execution Errors: Reported in tool results with isError: true:

API failures
Invalid input data
Business logic errors
Example protocol error:

{
"jsonrpc": "2.0",
"id": 3,
"error": {
"code": -32602,
"message": "Unknown tool: invalid_tool_name"
}
}

Example tool execution error:

{
"jsonrpc": "2.0",
"id": 4,
"result": {
"content": [
{
"type": "text",
"text": "Failed to fetch weather data: API rate limit exceeded"
}
],
"isError": true
}
}

Security Considerations
Servers MUST:

Validate all tool inputs
Implement proper access controls
Rate limit tool invocations
Sanitize tool outputs
Clients SHOULD:

Prompt for user confirmation on sensitive operations
Show tool inputs to the user before calling the server, to avoid malicious or accidental data exfiltration
Validate tool results before passing to LLM
Implement timeouts for tool calls
Log tool usage for audit purposes

oots
Protocol Revision: 2024-11-05
The Model Context Protocol (MCP) provides a standardized way for clients to expose filesystem “roots” to servers. Roots define the boundaries of where servers can operate within the filesystem, allowing them to understand which directories and files they have access to. Servers can request the list of roots from supporting clients and receive notifications when that list changes.

User Interaction Model
Roots in MCP are typically exposed through workspace or project configuration interfaces.

For example, implementations could offer a workspace/project picker that allows users to select directories and files the server should have access to. This can be combined with automatic workspace detection from version control systems or project files.

However, implementations are free to expose roots through any interface pattern that suits their needs—the protocol itself does not mandate any specific user interaction model.

Capabilities
Clients that support roots MUST declare the roots capability during initialization:

{
"capabilities": {
"roots": {
"listChanged": true
}
}
}

listChanged indicates whether the client will emit notifications when the list of roots changes.

Protocol Messages
Listing Roots
To retrieve roots, servers send a roots/list request:

Request:

{
"jsonrpc": "2.0",
"id": 1,
"method": "roots/list"
}

Response:

{
"jsonrpc": "2.0",
"id": 1,
"result": {
"roots": [
{
"uri": "file:///home/user/projects/myproject",
"name": "My Project"
}
]
}
}

Root List Changes
When roots change, clients that support listChanged MUST send a notification:

{
"jsonrpc": "2.0",
"method": "notifications/roots/list_changed"
}

Message Flow
Client
Server
Client
Server
Discovery
Changes
roots/list
Available roots
notifications/roots/list_changed
roots/list
Updated roots
Data Types
Root
A root definition includes:

uri: Unique identifier for the root. This MUST be a file:// URI in the current specification.
name: Optional human-readable name for display purposes.
Example roots for different use cases:

Project Directory
{
"uri": "file:///home/user/projects/myproject",
"name": "My Project"
}

Multiple Repositories
[
{
"uri": "file:///home/user/repos/frontend",
"name": "Frontend Repository"
},
{
"uri": "file:///home/user/repos/backend",
"name": "Backend Repository"
}
]

Error Handling
Clients SHOULD return standard JSON-RPC errors for common failure cases:

Client does not support roots: -32601 (Method not found)
Internal errors: -32603
Example error:

{
"jsonrpc": "2.0",
"id": 1,
"error": {
"code": -32601,
"message": "Roots not supported",
"data": {
"reason": "Client does not have roots capability"
}
}
}

Security Considerations
Clients MUST:

Only expose roots with appropriate permissions
Validate all root URIs to prevent path traversal
Implement proper access controls
Monitor root accessibility
Servers SHOULD:

Handle cases where roots become unavailable
Respect root boundaries during operations
Validate all paths against provided roots
Implementation Guidelines
Clients SHOULD:

Prompt users for consent before exposing roots to servers
Provide clear user interfaces for root management
Validate root accessibility before exposing
Monitor for root changes
Servers SHOULD:

Check for roots capability before usage
Handle root list changes gracefully
Respect root boundaries in operations
Cache root information appropriately

Sampling
Protocol Revision: 2024-11-05
The Model Context Protocol (MCP) provides a standardized way for servers to request LLM sampling (“completions” or “generations”) from language models via clients. This flow allows clients to maintain control over model access, selection, and permissions while enabling servers to leverage AI capabilities—with no server API keys necessary. Servers can request text or image-based interactions and optionally include context from MCP servers in their prompts.

User Interaction Model
Sampling in MCP allows servers to implement agentic behaviors, by enabling LLM calls to occur nested inside other MCP server features.

Implementations are free to expose sampling through any interface pattern that suits their needs—the protocol itself does not mandate any specific user interaction model.

For trust & safety and security, there SHOULD always be a human in the loop with the ability to deny sampling requests.

Applications SHOULD:

Provide UI that makes it easy and intuitive to review sampling requests
Allow users to view and edit prompts before sending
Present generated responses for review before delivery
Capabilities
Clients that support sampling MUST declare the sampling capability during initialization:

{
"capabilities": {
"sampling": {}
}
}

Protocol Messages
Creating Messages
To request a language model generation, servers send a sampling/createMessage request:

Request:

{
"jsonrpc": "2.0",
"id": 1,
"method": "sampling/createMessage",
"params": {
"messages": [
{
"role": "user",
"content": {
"type": "text",
"text": "What is the capital of France?"
}
}
],
"modelPreferences": {
"hints": [
{
"name": "claude-3-sonnet"
}
],
"intelligencePriority": 0.8,
"speedPriority": 0.5
},
"systemPrompt": "You are a helpful assistant.",
"maxTokens": 100
}
}

Response:

{
"jsonrpc": "2.0",
"id": 1,
"result": {
"role": "assistant",
"content": {
"type": "text",
"text": "The capital of France is Paris."
},
"model": "claude-3-sonnet-20240307",
"stopReason": "endTurn"
}
}

Message Flow
LLM
User
Client
Server
LLM
User
Client
Server
Server initiates sampling
Human-in-the-loop review
Model interaction
Response review
Complete request
sampling/createMessage
Present request for approval
Review and approve/modify
Forward approved request
Return generation
Present response for approval
Review and approve/modify
Return approved response
Data Types
Messages
Sampling messages can contain:

Text Content
{
"type": "text",
"text": "The message content"
}

Image Content
{
"type": "image",
"data": "base64-encoded-image-data",
"mimeType": "image/jpeg"
}

Model Preferences
Model selection in MCP requires careful abstraction since servers and clients may use different AI providers with distinct model offerings. A server cannot simply request a specific model by name since the client may not have access to that exact model or may prefer to use a different provider’s equivalent model.

To solve this, MCP implements a preference system that combines abstract capability priorities with optional model hints:

Capability Priorities
Servers express their needs through three normalized priority values (0-1):

costPriority: How important is minimizing costs? Higher values prefer cheaper models.
speedPriority: How important is low latency? Higher values prefer faster models.
intelligencePriority: How important are advanced capabilities? Higher values prefer more capable models.
Model Hints
While priorities help select models based on characteristics, hints allow servers to suggest specific models or model families:

Hints are treated as substrings that can match model names flexibly
Multiple hints are evaluated in order of preference
Clients MAY map hints to equivalent models from different providers
Hints are advisory—clients make final model selection
For example:

{
"hints": [
{ "name": "claude-3-sonnet" }, // Prefer Sonnet-class models
{ "name": "claude" } // Fall back to any Claude model
],
"costPriority": 0.3, // Cost is less important
"speedPriority": 0.8, // Speed is very important
"intelligencePriority": 0.5 // Moderate capability needs
}

The client processes these preferences to select an appropriate model from its available options. For instance, if the client doesn’t have access to Claude models but has Gemini, it might map the sonnet hint to gemini-1.5-pro based on similar capabilities.

Error Handling
Clients SHOULD return errors for common failure cases:

Example error:

{
"jsonrpc": "2.0",
"id": 1,
"error": {
"code": -1,
"message": "User rejected sampling request"
}
}

Security Considerations
Clients SHOULD implement user approval controls
Both parties SHOULD validate message content
Clients SHOULD respect model preference hints
Clients SHOULD implement rate limiting
Both parties MUST handle sensitive data appropriately

SCHEMA:

{
"$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "Annotated": {
            "description": "Base for objects that include optional annotations for the client. The client can use annotations to inform how objects are used or displayed",
            "properties": {
                "annotations": {
                    "properties": {
                        "audience": {
                            "description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
                            "items": {
                                "$ref": "#/definitions/Role"
},
"type": "array"
},
"priority": {
"description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
"maximum": 1,
"minimum": 0,
"type": "number"
}
},
"type": "object"
}
},
"type": "object"
},
"BlobResourceContents": {
"properties": {
"blob": {
"description": "A base64-encoded string representing the binary data of the item.",
"format": "byte",
"type": "string"
},
"mimeType": {
"description": "The MIME type of this resource, if known.",
"type": "string"
},
"uri": {
"description": "The URI of this resource.",
"format": "uri",
"type": "string"
}
},
"required": [
"blob",
"uri"
],
"type": "object"
},
"CallToolRequest": {
"description": "Used by the client to invoke a tool provided by the server.",
"properties": {
"method": {
"const": "tools/call",
"type": "string"
},
"params": {
"properties": {
"arguments": {
"additionalProperties": {},
"type": "object"
},
"name": {
"type": "string"
}
},
"required": [
"name"
],
"type": "object"
}
},
"required": [
"method",
"params"
],
"type": "object"
},
"CallToolResult": {
"description": "The server's response to a tool call.\n\nAny errors that originate from the tool SHOULD be reported inside the result\nobject, with `isError` set to true, _not_ as an MCP protocol-level error\nresponse. Otherwise, the LLM would not be able to see that an error occurred\nand self-correct.\n\nHowever, any errors in _finding_ the tool, an error indicating that the\nserver does not support tool calls, or any other exceptional conditions,\nshould be reported as an MCP error response.",
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
"type": "object"
},
"content": {
"items": {
"anyOf": [
{
"$ref": "#/definitions/TextContent"
},
{
"$ref": "#/definitions/ImageContent"
},
{
"$ref": "#/definitions/EmbeddedResource"
}
]
},
"type": "array"
},
"isError": {
"description": "Whether the tool call ended in an error.\n\nIf not set, this is assumed to be false (the call was successful).",
"type": "boolean"
}
},
"required": [
"content"
],
"type": "object"
},
"CancelledNotification": {
"description": "This notification can be sent by either side to indicate that it is cancelling a previously-issued request.\n\nThe request SHOULD still be in-flight, but due to communication latency, it is always possible that this notification MAY arrive after the request has already finished.\n\nThis notification indicates that the result will be unused, so any associated processing SHOULD cease.\n\nA client MUST NOT attempt to cancel its `initialize` request.",
"properties": {
"method": {
"const": "notifications/cancelled",
"type": "string"
},
"params": {
"properties": {
"reason": {
"description": "An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.",
"type": "string"
},
"requestId": {
"$ref": "#/definitions/RequestId",
                            "description": "The ID of the request to cancel.\n\nThis MUST correspond to the ID of a request previously issued in the same direction."
                        }
                    },
                    "required": [
                        "requestId"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "ClientCapabilities": {
            "description": "Capabilities a client may support. Known capabilities are defined here, in this schema, but this is not a closed set: any client can define its own, additional capabilities.",
            "properties": {
                "experimental": {
                    "additionalProperties": {
                        "additionalProperties": true,
                        "properties": {},
                        "type": "object"
                    },
                    "description": "Experimental, non-standard capabilities that the client supports.",
                    "type": "object"
                },
                "roots": {
                    "description": "Present if the client supports listing roots.",
                    "properties": {
                        "listChanged": {
                            "description": "Whether the client supports notifications for changes to the roots list.",
                            "type": "boolean"
                        }
                    },
                    "type": "object"
                },
                "sampling": {
                    "additionalProperties": true,
                    "description": "Present if the client supports sampling from an LLM.",
                    "properties": {},
                    "type": "object"
                }
            },
            "type": "object"
        },
        "ClientNotification": {
            "anyOf": [
                {
                    "$ref": "#/definitions/CancelledNotification"
},
{
"$ref": "#/definitions/InitializedNotification"
                },
                {
                    "$ref": "#/definitions/ProgressNotification"
},
{
"$ref": "#/definitions/RootsListChangedNotification"
                }
            ]
        },
        "ClientRequest": {
            "anyOf": [
                {
                    "$ref": "#/definitions/InitializeRequest"
},
{
"$ref": "#/definitions/PingRequest"
                },
                {
                    "$ref": "#/definitions/ListResourcesRequest"
},
{
"$ref": "#/definitions/ListResourceTemplatesRequest"
                },
                {
                    "$ref": "#/definitions/ReadResourceRequest"
},
{
"$ref": "#/definitions/SubscribeRequest"
                },
                {
                    "$ref": "#/definitions/UnsubscribeRequest"
},
{
"$ref": "#/definitions/ListPromptsRequest"
                },
                {
                    "$ref": "#/definitions/GetPromptRequest"
},
{
"$ref": "#/definitions/ListToolsRequest"
                },
                {
                    "$ref": "#/definitions/CallToolRequest"
},
{
"$ref": "#/definitions/SetLevelRequest"
                },
                {
                    "$ref": "#/definitions/CompleteRequest"
}
]
},
"ClientResult": {
"anyOf": [
{
"$ref": "#/definitions/Result"
},
{
"$ref": "#/definitions/CreateMessageResult"
},
{
"$ref": "#/definitions/ListRootsResult"
}
]
},
"CompleteRequest": {
"description": "A request from the client to the server, to ask for completion options.",
"properties": {
"method": {
"const": "completion/complete",
"type": "string"
},
"params": {
"properties": {
"argument": {
"description": "The argument's information",
"properties": {
"name": {
"description": "The name of the argument",
"type": "string"
},
"value": {
"description": "The value of the argument to use for completion matching.",
"type": "string"
}
},
"required": [
"name",
"value"
],
"type": "object"
},
"ref": {
"anyOf": [
{
"$ref": "#/definitions/PromptReference"
},
{
"$ref": "#/definitions/ResourceReference"
}
]
}
},
"required": [
"argument",
"ref"
],
"type": "object"
}
},
"required": [
"method",
"params"
],
"type": "object"
},
"CompleteResult": {
"description": "The server's response to a completion/complete request",
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
"type": "object"
},
"completion": {
"properties": {
"hasMore": {
"description": "Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.",
"type": "boolean"
},
"total": {
"description": "The total number of completion options available. This can exceed the number of values actually sent in the response.",
"type": "integer"
},
"values": {
"description": "An array of completion values. Must not exceed 100 items.",
"items": {
"type": "string"
},
"type": "array"
}
},
"required": [
"values"
],
"type": "object"
}
},
"required": [
"completion"
],
"type": "object"
},
"CreateMessageRequest": {
"description": "A request from the server to sample an LLM via the client. The client has full discretion over which model to select. The client should also inform the user before beginning sampling, to allow them to inspect the request (human in the loop) and decide whether to approve it.",
"properties": {
"method": {
"const": "sampling/createMessage",
"type": "string"
},
"params": {
"properties": {
"includeContext": {
"description": "A request to include context from one or more MCP servers (including the caller), to be attached to the prompt. The client MAY ignore this request.",
"enum": [
"allServers",
"none",
"thisServer"
],
"type": "string"
},
"maxTokens": {
"description": "The maximum number of tokens to sample, as requested by the server. The client MAY choose to sample fewer tokens than requested.",
"type": "integer"
},
"messages": {
"items": {
"$ref": "#/definitions/SamplingMessage"
                            },
                            "type": "array"
                        },
                        "metadata": {
                            "additionalProperties": true,
                            "description": "Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.",
                            "properties": {},
                            "type": "object"
                        },
                        "modelPreferences": {
                            "$ref": "#/definitions/ModelPreferences",
"description": "The server's preferences for which model to select. The client MAY ignore these preferences."
},
"stopSequences": {
"items": {
"type": "string"
},
"type": "array"
},
"systemPrompt": {
"description": "An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.",
"type": "string"
},
"temperature": {
"type": "number"
}
},
"required": [
"maxTokens",
"messages"
],
"type": "object"
}
},
"required": [
"method",
"params"
],
"type": "object"
},
"CreateMessageResult": {
"description": "The client's response to a sampling/create*message request from the server. The client should inform the user before returning the sampled message, to allow them to inspect the response (human in the loop) and decide whether to allow the server to see it.",
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
"type": "object"
},
"content": {
"anyOf": [
{
"$ref": "#/definitions/TextContent"
},
{
"$ref": "#/definitions/ImageContent"
}
]
},
"model": {
"description": "The name of the model that generated the message.",
"type": "string"
},
"role": {
"$ref": "#/definitions/Role"
                },
                "stopReason": {
                    "description": "The reason why sampling stopped, if known.",
                    "type": "string"
                }
            },
            "required": [
                "content",
                "model",
                "role"
            ],
            "type": "object"
        },
        "Cursor": {
            "description": "An opaque token used to represent a cursor for pagination.",
            "type": "string"
        },
        "EmbeddedResource": {
            "description": "The contents of a resource, embedded into a prompt or tool call result.\n\nIt is up to the client how best to render embedded resources for the benefit\nof the LLM and/or the user.",
            "properties": {
                "annotations": {
                    "properties": {
                        "audience": {
                            "description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
                            "items": {
                                "$ref": "#/definitions/Role"
},
"type": "array"
},
"priority": {
"description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
"maximum": 1,
"minimum": 0,
"type": "number"
}
},
"type": "object"
},
"resource": {
"anyOf": [
{
"$ref": "#/definitions/TextResourceContents"
},
{
"$ref": "#/definitions/BlobResourceContents"
}
]
},
"type": {
"const": "resource",
"type": "string"
}
},
"required": [
"resource",
"type"
],
"type": "object"
},
"EmptyResult": {
"$ref": "#/definitions/Result"
        },
        "GetPromptRequest": {
            "description": "Used by the client to get a prompt provided by the server.",
            "properties": {
                "method": {
                    "const": "prompts/get",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "arguments": {
                            "additionalProperties": {
                                "type": "string"
                            },
                            "description": "Arguments to use for templating the prompt.",
                            "type": "object"
                        },
                        "name": {
                            "description": "The name of the prompt or prompt template.",
                            "type": "string"
                        }
                    },
                    "required": [
                        "name"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "GetPromptResult": {
            "description": "The server's response to a prompts/get request from the client.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "description": {
                    "description": "An optional description for the prompt.",
                    "type": "string"
                },
                "messages": {
                    "items": {
                        "$ref": "#/definitions/PromptMessage"
},
"type": "array"
}
},
"required": [
"messages"
],
"type": "object"
},
"ImageContent": {
"description": "An image provided to or from an LLM.",
"properties": {
"annotations": {
"properties": {
"audience": {
"description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
"items": {
"$ref": "#/definitions/Role"
                            },
                            "type": "array"
                        },
                        "priority": {
                            "description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
                            "maximum": 1,
                            "minimum": 0,
                            "type": "number"
                        }
                    },
                    "type": "object"
                },
                "data": {
                    "description": "The base64-encoded image data.",
                    "format": "byte",
                    "type": "string"
                },
                "mimeType": {
                    "description": "The MIME type of the image. Different providers may support different image types.",
                    "type": "string"
                },
                "type": {
                    "const": "image",
                    "type": "string"
                }
            },
            "required": [
                "data",
                "mimeType",
                "type"
            ],
            "type": "object"
        },
        "Implementation": {
            "description": "Describes the name and version of an MCP implementation.",
            "properties": {
                "name": {
                    "type": "string"
                },
                "version": {
                    "type": "string"
                }
            },
            "required": [
                "name",
                "version"
            ],
            "type": "object"
        },
        "InitializeRequest": {
            "description": "This request is sent from the client to the server when it first connects, asking it to begin initialization.",
            "properties": {
                "method": {
                    "const": "initialize",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "capabilities": {
                            "$ref": "#/definitions/ClientCapabilities"
},
"clientInfo": {
"$ref": "#/definitions/Implementation"
                        },
                        "protocolVersion": {
                            "description": "The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.",
                            "type": "string"
                        }
                    },
                    "required": [
                        "capabilities",
                        "clientInfo",
                        "protocolVersion"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "InitializeResult": {
            "description": "After receiving an initialize request from the client, the server sends this response.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "capabilities": {
                    "$ref": "#/definitions/ServerCapabilities"
},
"instructions": {
"description": "Instructions describing how to use the server and its features.\n\nThis can be used by clients to improve the LLM's understanding of available tools, resources, etc. It can be thought of like a \"hint\" to the model. For example, this information MAY be added to the system prompt.",
"type": "string"
},
"protocolVersion": {
"description": "The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.",
"type": "string"
},
"serverInfo": {
"$ref": "#/definitions/Implementation"
                }
            },
            "required": [
                "capabilities",
                "protocolVersion",
                "serverInfo"
            ],
            "type": "object"
        },
        "InitializedNotification": {
            "description": "This notification is sent from the client to the server after initialization has finished.",
            "properties": {
                "method": {
                    "const": "notifications/initialized",
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "additionalProperties": {},
                            "description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "JSONRPCError": {
            "description": "A response to a request that indicates an error occurred.",
            "properties": {
                "error": {
                    "properties": {
                        "code": {
                            "description": "The error type that occurred.",
                            "type": "integer"
                        },
                        "data": {
                            "description": "Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.)."
                        },
                        "message": {
                            "description": "A short description of the error. The message SHOULD be limited to a concise single sentence.",
                            "type": "string"
                        }
                    },
                    "required": [
                        "code",
                        "message"
                    ],
                    "type": "object"
                },
                "id": {
                    "$ref": "#/definitions/RequestId"
},
"jsonrpc": {
"const": "2.0",
"type": "string"
}
},
"required": [
"error",
"id",
"jsonrpc"
],
"type": "object"
},
"JSONRPCMessage": {
"anyOf": [
{
"$ref": "#/definitions/JSONRPCRequest"
},
{
"$ref": "#/definitions/JSONRPCNotification"
},
{
"$ref": "#/definitions/JSONRPCResponse"
},
{
"$ref": "#/definitions/JSONRPCError"
}
]
},
"JSONRPCNotification": {
"description": "A notification which does not expect a response.",
"properties": {
"jsonrpc": {
"const": "2.0",
"type": "string"
},
"method": {
"type": "string"
},
"params": {
"additionalProperties": {},
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
"type": "object"
}
},
"type": "object"
}
},
"required": [
"jsonrpc",
"method"
],
"type": "object"
},
"JSONRPCRequest": {
"description": "A request that expects a response.",
"properties": {
"id": {
"$ref": "#/definitions/RequestId"
                },
                "jsonrpc": {
                    "const": "2.0",
                    "type": "string"
                },
                "method": {
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "properties": {
                                "progressToken": {
                                    "$ref": "#/definitions/ProgressToken",
"description": "If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications."
}
},
"type": "object"
}
},
"type": "object"
}
},
"required": [
"id",
"jsonrpc",
"method"
],
"type": "object"
},
"JSONRPCResponse": {
"description": "A successful (non-error) response to a request.",
"properties": {
"id": {
"$ref": "#/definitions/RequestId"
                },
                "jsonrpc": {
                    "const": "2.0",
                    "type": "string"
                },
                "result": {
                    "$ref": "#/definitions/Result"
}
},
"required": [
"id",
"jsonrpc",
"result"
],
"type": "object"
},
"ListPromptsRequest": {
"description": "Sent from the client to request a list of prompts and prompt templates the server has.",
"properties": {
"method": {
"const": "prompts/list",
"type": "string"
},
"params": {
"properties": {
"cursor": {
"description": "An opaque token representing the current pagination position.\nIf provided, the server should return results starting after this cursor.",
"type": "string"
}
},
"type": "object"
}
},
"required": [
"method"
],
"type": "object"
},
"ListPromptsResult": {
"description": "The server's response to a prompts/list request from the client.",
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
"type": "object"
},
"nextCursor": {
"description": "An opaque token representing the pagination position after the last returned result.\nIf present, there may be more results available.",
"type": "string"
},
"prompts": {
"items": {
"$ref": "#/definitions/Prompt"
                    },
                    "type": "array"
                }
            },
            "required": [
                "prompts"
            ],
            "type": "object"
        },
        "ListResourceTemplatesRequest": {
            "description": "Sent from the client to request a list of resource templates the server has.",
            "properties": {
                "method": {
                    "const": "resources/templates/list",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "cursor": {
                            "description": "An opaque token representing the current pagination position.\nIf provided, the server should return results starting after this cursor.",
                            "type": "string"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "ListResourceTemplatesResult": {
            "description": "The server's response to a resources/templates/list request from the client.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "nextCursor": {
                    "description": "An opaque token representing the pagination position after the last returned result.\nIf present, there may be more results available.",
                    "type": "string"
                },
                "resourceTemplates": {
                    "items": {
                        "$ref": "#/definitions/ResourceTemplate"
},
"type": "array"
}
},
"required": [
"resourceTemplates"
],
"type": "object"
},
"ListResourcesRequest": {
"description": "Sent from the client to request a list of resources the server has.",
"properties": {
"method": {
"const": "resources/list",
"type": "string"
},
"params": {
"properties": {
"cursor": {
"description": "An opaque token representing the current pagination position.\nIf provided, the server should return results starting after this cursor.",
"type": "string"
}
},
"type": "object"
}
},
"required": [
"method"
],
"type": "object"
},
"ListResourcesResult": {
"description": "The server's response to a resources/list request from the client.",
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
"type": "object"
},
"nextCursor": {
"description": "An opaque token representing the pagination position after the last returned result.\nIf present, there may be more results available.",
"type": "string"
},
"resources": {
"items": {
"$ref": "#/definitions/Resource"
                    },
                    "type": "array"
                }
            },
            "required": [
                "resources"
            ],
            "type": "object"
        },
        "ListRootsRequest": {
            "description": "Sent from the server to request a list of root URIs from the client. Roots allow\nservers to ask for specific directories or files to operate on. A common example\nfor roots is providing a set of repositories or directories a server should operate\non.\n\nThis request is typically used when the server needs to understand the file system\nstructure or access specific locations that the client has permission to read from.",
            "properties": {
                "method": {
                    "const": "roots/list",
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "properties": {
                                "progressToken": {
                                    "$ref": "#/definitions/ProgressToken",
"description": "If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications."
}
},
"type": "object"
}
},
"type": "object"
}
},
"required": [
"method"
],
"type": "object"
},
"ListRootsResult": {
"description": "The client's response to a roots/list request from the server.\nThis result contains an array of Root objects, each representing a root directory\nor file that the server can operate on.",
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
"type": "object"
},
"roots": {
"items": {
"$ref": "#/definitions/Root"
                    },
                    "type": "array"
                }
            },
            "required": [
                "roots"
            ],
            "type": "object"
        },
        "ListToolsRequest": {
            "description": "Sent from the client to request a list of tools the server has.",
            "properties": {
                "method": {
                    "const": "tools/list",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "cursor": {
                            "description": "An opaque token representing the current pagination position.\nIf provided, the server should return results starting after this cursor.",
                            "type": "string"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "ListToolsResult": {
            "description": "The server's response to a tools/list request from the client.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "nextCursor": {
                    "description": "An opaque token representing the pagination position after the last returned result.\nIf present, there may be more results available.",
                    "type": "string"
                },
                "tools": {
                    "items": {
                        "$ref": "#/definitions/Tool"
},
"type": "array"
}
},
"required": [
"tools"
],
"type": "object"
},
"LoggingLevel": {
"description": "The severity of a log message.\n\nThese map to syslog message severities, as specified in RFC-5424:\nhttps://datatracker.ietf.org/doc/html/rfc5424#section-6.2.1",
"enum": [
"alert",
"critical",
"debug",
"emergency",
"error",
"info",
"notice",
"warning"
],
"type": "string"
},
"LoggingMessageNotification": {
"description": "Notification of a log message passed from server to client. If no logging/setLevel request has been sent from the client, the server MAY decide which messages to send automatically.",
"properties": {
"method": {
"const": "notifications/message",
"type": "string"
},
"params": {
"properties": {
"data": {
"description": "The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here."
},
"level": {
"$ref": "#/definitions/LoggingLevel",
                            "description": "The severity of this log message."
                        },
                        "logger": {
                            "description": "An optional name of the logger issuing this message.",
                            "type": "string"
                        }
                    },
                    "required": [
                        "data",
                        "level"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "ModelHint": {
            "description": "Hints to use for model selection.\n\nKeys not declared here are currently left unspecified by the spec and are up\nto the client to interpret.",
            "properties": {
                "name": {
                    "description": "A hint for a model name.\n\nThe client SHOULD treat this as a substring of a model name; for example:\n - `claude-3-5-sonnet` should match `claude-3-5-sonnet-20241022`\n - `sonnet` should match `claude-3-5-sonnet-20241022`, `claude-3-sonnet-20240229`, etc.\n - `claude` should match any Claude model\n\nThe client MAY also map the string to a different provider's model name or a different model family, as long as it fills a similar niche; for example:\n - `gemini-1.5-flash` could match `claude-3-haiku-20240307`",
                    "type": "string"
                }
            },
            "type": "object"
        },
        "ModelPreferences": {
            "description": "The server's preferences for model selection, requested of the client during sampling.\n\nBecause LLMs can vary along multiple dimensions, choosing the \"best\" model is\nrarely straightforward.  Different models excel in different areas—some are\nfaster but less capable, others are more capable but more expensive, and so\non. This interface allows servers to express their priorities across multiple\ndimensions to help clients make an appropriate selection for their use case.\n\nThese preferences are always advisory. The client MAY ignore them. It is also\nup to the client to decide how to interpret these preferences and how to\nbalance them against other considerations.",
            "properties": {
                "costPriority": {
                    "description": "How much to prioritize cost when selecting a model. A value of 0 means cost\nis not important, while a value of 1 means cost is the most important\nfactor.",
                    "maximum": 1,
                    "minimum": 0,
                    "type": "number"
                },
                "hints": {
                    "description": "Optional hints to use for model selection.\n\nIf multiple hints are specified, the client MUST evaluate them in order\n(such that the first match is taken).\n\nThe client SHOULD prioritize these hints over the numeric priorities, but\nMAY still use the priorities to select from ambiguous matches.",
                    "items": {
                        "$ref": "#/definitions/ModelHint"
},
"type": "array"
},
"intelligencePriority": {
"description": "How much to prioritize intelligence and capabilities when selecting a\nmodel. A value of 0 means intelligence is not important, while a value of 1\nmeans intelligence is the most important factor.",
"maximum": 1,
"minimum": 0,
"type": "number"
},
"speedPriority": {
"description": "How much to prioritize sampling speed (latency) when selecting a model. A\nvalue of 0 means speed is not important, while a value of 1 means speed is\nthe most important factor.",
"maximum": 1,
"minimum": 0,
"type": "number"
}
},
"type": "object"
},
"Notification": {
"properties": {
"method": {
"type": "string"
},
"params": {
"additionalProperties": {},
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
"type": "object"
}
},
"type": "object"
}
},
"required": [
"method"
],
"type": "object"
},
"PaginatedRequest": {
"properties": {
"method": {
"type": "string"
},
"params": {
"properties": {
"cursor": {
"description": "An opaque token representing the current pagination position.\nIf provided, the server should return results starting after this cursor.",
"type": "string"
}
},
"type": "object"
}
},
"required": [
"method"
],
"type": "object"
},
"PaginatedResult": {
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
"type": "object"
},
"nextCursor": {
"description": "An opaque token representing the pagination position after the last returned result.\nIf present, there may be more results available.",
"type": "string"
}
},
"type": "object"
},
"PingRequest": {
"description": "A ping, issued by either the server or the client, to check that the other party is still alive. The receiver must promptly respond, or else may be disconnected.",
"properties": {
"method": {
"const": "ping",
"type": "string"
},
"params": {
"additionalProperties": {},
"properties": {
"\_meta": {
"properties": {
"progressToken": {
"$ref": "#/definitions/ProgressToken",
                                    "description": "If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications."
                                }
                            },
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "ProgressNotification": {
            "description": "An out-of-band notification used to inform the receiver of a progress update for a long-running request.",
            "properties": {
                "method": {
                    "const": "notifications/progress",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "progress": {
                            "description": "The progress thus far. This should increase every time progress is made, even if the total is unknown.",
                            "type": "number"
                        },
                        "progressToken": {
                            "$ref": "#/definitions/ProgressToken",
"description": "The progress token which was given in the initial request, used to associate this notification with the request that is proceeding."
},
"total": {
"description": "Total number of items to process (or total progress required), if known.",
"type": "number"
}
},
"required": [
"progress",
"progressToken"
],
"type": "object"
}
},
"required": [
"method",
"params"
],
"type": "object"
},
"ProgressToken": {
"description": "A progress token, used to associate progress notifications with the original request.",
"type": [
"string",
"integer"
]
},
"Prompt": {
"description": "A prompt or prompt template that the server offers.",
"properties": {
"arguments": {
"description": "A list of arguments to use for templating the prompt.",
"items": {
"$ref": "#/definitions/PromptArgument"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "An optional description of what this prompt provides",
                    "type": "string"
                },
                "name": {
                    "description": "The name of the prompt or prompt template.",
                    "type": "string"
                }
            },
            "required": [
                "name"
            ],
            "type": "object"
        },
        "PromptArgument": {
            "description": "Describes an argument that a prompt can accept.",
            "properties": {
                "description": {
                    "description": "A human-readable description of the argument.",
                    "type": "string"
                },
                "name": {
                    "description": "The name of the argument.",
                    "type": "string"
                },
                "required": {
                    "description": "Whether this argument must be provided.",
                    "type": "boolean"
                }
            },
            "required": [
                "name"
            ],
            "type": "object"
        },
        "PromptListChangedNotification": {
            "description": "An optional notification from the server to the client, informing it that the list of prompts it offers has changed. This may be issued by servers without any previous subscription from the client.",
            "properties": {
                "method": {
                    "const": "notifications/prompts/list_changed",
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "additionalProperties": {},
                            "description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "PromptMessage": {
            "description": "Describes a message returned as part of a prompt.\n\nThis is similar to `SamplingMessage`, but also supports the embedding of\nresources from the MCP server.",
            "properties": {
                "content": {
                    "anyOf": [
                        {
                            "$ref": "#/definitions/TextContent"
},
{
"$ref": "#/definitions/ImageContent"
                        },
                        {
                            "$ref": "#/definitions/EmbeddedResource"
}
]
},
"role": {
"$ref": "#/definitions/Role"
                }
            },
            "required": [
                "content",
                "role"
            ],
            "type": "object"
        },
        "PromptReference": {
            "description": "Identifies a prompt.",
            "properties": {
                "name": {
                    "description": "The name of the prompt or prompt template",
                    "type": "string"
                },
                "type": {
                    "const": "ref/prompt",
                    "type": "string"
                }
            },
            "required": [
                "name",
                "type"
            ],
            "type": "object"
        },
        "ReadResourceRequest": {
            "description": "Sent from the client to the server, to read a specific resource URI.",
            "properties": {
                "method": {
                    "const": "resources/read",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "uri": {
                            "description": "The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.",
                            "format": "uri",
                            "type": "string"
                        }
                    },
                    "required": [
                        "uri"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "ReadResourceResult": {
            "description": "The server's response to a resources/read request from the client.",
            "properties": {
                "_meta": {
                    "additionalProperties": {},
                    "description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
                    "type": "object"
                },
                "contents": {
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "#/definitions/TextResourceContents"
},
{
"$ref": "#/definitions/BlobResourceContents"
                            }
                        ]
                    },
                    "type": "array"
                }
            },
            "required": [
                "contents"
            ],
            "type": "object"
        },
        "Request": {
            "properties": {
                "method": {
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "properties": {
                                "progressToken": {
                                    "$ref": "#/definitions/ProgressToken",
"description": "If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications."
}
},
"type": "object"
}
},
"type": "object"
}
},
"required": [
"method"
],
"type": "object"
},
"RequestId": {
"description": "A uniquely identifying ID for a request in JSON-RPC.",
"type": [
"string",
"integer"
]
},
"Resource": {
"description": "A known resource that the server is capable of reading.",
"properties": {
"annotations": {
"properties": {
"audience": {
"description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
"items": {
"$ref": "#/definitions/Role"
                            },
                            "type": "array"
                        },
                        "priority": {
                            "description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
                            "maximum": 1,
                            "minimum": 0,
                            "type": "number"
                        }
                    },
                    "type": "object"
                },
                "description": {
                    "description": "A description of what this resource represents.\n\nThis can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a \"hint\" to the model.",
                    "type": "string"
                },
                "mimeType": {
                    "description": "The MIME type of this resource, if known.",
                    "type": "string"
                },
                "name": {
                    "description": "A human-readable name for this resource.\n\nThis can be used by clients to populate UI elements.",
                    "type": "string"
                },
                "size": {
                    "description": "The size of the raw resource content, in bytes (i.e., before base64 encoding or any tokenization), if known.\n\nThis can be used by Hosts to display file sizes and estimate context window usage.",
                    "type": "integer"
                },
                "uri": {
                    "description": "The URI of this resource.",
                    "format": "uri",
                    "type": "string"
                }
            },
            "required": [
                "name",
                "uri"
            ],
            "type": "object"
        },
        "ResourceContents": {
            "description": "The contents of a specific resource or sub-resource.",
            "properties": {
                "mimeType": {
                    "description": "The MIME type of this resource, if known.",
                    "type": "string"
                },
                "uri": {
                    "description": "The URI of this resource.",
                    "format": "uri",
                    "type": "string"
                }
            },
            "required": [
                "uri"
            ],
            "type": "object"
        },
        "ResourceListChangedNotification": {
            "description": "An optional notification from the server to the client, informing it that the list of resources it can read from has changed. This may be issued by servers without any previous subscription from the client.",
            "properties": {
                "method": {
                    "const": "notifications/resources/list_changed",
                    "type": "string"
                },
                "params": {
                    "additionalProperties": {},
                    "properties": {
                        "_meta": {
                            "additionalProperties": {},
                            "description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
                            "type": "object"
                        }
                    },
                    "type": "object"
                }
            },
            "required": [
                "method"
            ],
            "type": "object"
        },
        "ResourceReference": {
            "description": "A reference to a resource or resource template definition.",
            "properties": {
                "type": {
                    "const": "ref/resource",
                    "type": "string"
                },
                "uri": {
                    "description": "The URI or URI template of the resource.",
                    "format": "uri-template",
                    "type": "string"
                }
            },
            "required": [
                "type",
                "uri"
            ],
            "type": "object"
        },
        "ResourceTemplate": {
            "description": "A template description for resources available on the server.",
            "properties": {
                "annotations": {
                    "properties": {
                        "audience": {
                            "description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
                            "items": {
                                "$ref": "#/definitions/Role"
},
"type": "array"
},
"priority": {
"description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
"maximum": 1,
"minimum": 0,
"type": "number"
}
},
"type": "object"
},
"description": {
"description": "A description of what this template is for.\n\nThis can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a \"hint\" to the model.",
"type": "string"
},
"mimeType": {
"description": "The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.",
"type": "string"
},
"name": {
"description": "A human-readable name for the type of resource this template refers to.\n\nThis can be used by clients to populate UI elements.",
"type": "string"
},
"uriTemplate": {
"description": "A URI template (according to RFC 6570) that can be used to construct resource URIs.",
"format": "uri-template",
"type": "string"
}
},
"required": [
"name",
"uriTemplate"
],
"type": "object"
},
"ResourceUpdatedNotification": {
"description": "A notification from the server to the client, informing it that a resource has changed and may need to be read again. This should only be sent if the client previously sent a resources/subscribe request.",
"properties": {
"method": {
"const": "notifications/resources/updated",
"type": "string"
},
"params": {
"properties": {
"uri": {
"description": "The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.",
"format": "uri",
"type": "string"
}
},
"required": [
"uri"
],
"type": "object"
}
},
"required": [
"method",
"params"
],
"type": "object"
},
"Result": {
"additionalProperties": {},
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.",
"type": "object"
}
},
"type": "object"
},
"Role": {
"description": "The sender or recipient of messages and data in a conversation.",
"enum": [
"assistant",
"user"
],
"type": "string"
},
"Root": {
"description": "Represents a root directory or file that the server can operate on.",
"properties": {
"name": {
"description": "An optional name for the root. This can be used to provide a human-readable\nidentifier for the root, which may be useful for display purposes or for\nreferencing the root in other parts of the application.",
"type": "string"
},
"uri": {
"description": "The URI identifying the root. This \_must* start with file:// for now.\nThis restriction may be relaxed in future versions of the protocol to allow\nother URI schemes.",
"format": "uri",
"type": "string"
}
},
"required": [
"uri"
],
"type": "object"
},
"RootsListChangedNotification": {
"description": "A notification from the client to the server, informing it that the list of roots has changed.\nThis notification should be sent whenever the client adds, removes, or modifies any root.\nThe server should then request an updated list of roots using the ListRootsRequest.",
"properties": {
"method": {
"const": "notifications/roots/list_changed",
"type": "string"
},
"params": {
"additionalProperties": {},
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
"type": "object"
}
},
"type": "object"
}
},
"required": [
"method"
],
"type": "object"
},
"SamplingMessage": {
"description": "Describes a message issued to or received from an LLM API.",
"properties": {
"content": {
"anyOf": [
{
"$ref": "#/definitions/TextContent"
},
{
"$ref": "#/definitions/ImageContent"
}
]
},
"role": {
"$ref": "#/definitions/Role"
                }
            },
            "required": [
                "content",
                "role"
            ],
            "type": "object"
        },
        "ServerCapabilities": {
            "description": "Capabilities that a server may support. Known capabilities are defined here, in this schema, but this is not a closed set: any server can define its own, additional capabilities.",
            "properties": {
                "experimental": {
                    "additionalProperties": {
                        "additionalProperties": true,
                        "properties": {},
                        "type": "object"
                    },
                    "description": "Experimental, non-standard capabilities that the server supports.",
                    "type": "object"
                },
                "logging": {
                    "additionalProperties": true,
                    "description": "Present if the server supports sending log messages to the client.",
                    "properties": {},
                    "type": "object"
                },
                "prompts": {
                    "description": "Present if the server offers any prompt templates.",
                    "properties": {
                        "listChanged": {
                            "description": "Whether this server supports notifications for changes to the prompt list.",
                            "type": "boolean"
                        }
                    },
                    "type": "object"
                },
                "resources": {
                    "description": "Present if the server offers any resources to read.",
                    "properties": {
                        "listChanged": {
                            "description": "Whether this server supports notifications for changes to the resource list.",
                            "type": "boolean"
                        },
                        "subscribe": {
                            "description": "Whether this server supports subscribing to resource updates.",
                            "type": "boolean"
                        }
                    },
                    "type": "object"
                },
                "tools": {
                    "description": "Present if the server offers any tools to call.",
                    "properties": {
                        "listChanged": {
                            "description": "Whether this server supports notifications for changes to the tool list.",
                            "type": "boolean"
                        }
                    },
                    "type": "object"
                }
            },
            "type": "object"
        },
        "ServerNotification": {
            "anyOf": [
                {
                    "$ref": "#/definitions/CancelledNotification"
},
{
"$ref": "#/definitions/ProgressNotification"
                },
                {
                    "$ref": "#/definitions/ResourceListChangedNotification"
},
{
"$ref": "#/definitions/ResourceUpdatedNotification"
                },
                {
                    "$ref": "#/definitions/PromptListChangedNotification"
},
{
"$ref": "#/definitions/ToolListChangedNotification"
                },
                {
                    "$ref": "#/definitions/LoggingMessageNotification"
}
]
},
"ServerRequest": {
"anyOf": [
{
"$ref": "#/definitions/PingRequest"
},
{
"$ref": "#/definitions/CreateMessageRequest"
},
{
"$ref": "#/definitions/ListRootsRequest"
}
]
},
"ServerResult": {
"anyOf": [
{
"$ref": "#/definitions/Result"
},
{
"$ref": "#/definitions/InitializeResult"
},
{
"$ref": "#/definitions/ListResourcesResult"
},
{
"$ref": "#/definitions/ListResourceTemplatesResult"
},
{
"$ref": "#/definitions/ReadResourceResult"
},
{
"$ref": "#/definitions/ListPromptsResult"
},
{
"$ref": "#/definitions/GetPromptResult"
},
{
"$ref": "#/definitions/ListToolsResult"
},
{
"$ref": "#/definitions/CallToolResult"
},
{
"$ref": "#/definitions/CompleteResult"
}
]
},
"SetLevelRequest": {
"description": "A request from the client to the server, to enable or adjust logging.",
"properties": {
"method": {
"const": "logging/setLevel",
"type": "string"
},
"params": {
"properties": {
"level": {
"$ref": "#/definitions/LoggingLevel",
                            "description": "The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/message."
                        }
                    },
                    "required": [
                        "level"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "SubscribeRequest": {
            "description": "Sent from the client to request resources/updated notifications from the server whenever a particular resource changes.",
            "properties": {
                "method": {
                    "const": "resources/subscribe",
                    "type": "string"
                },
                "params": {
                    "properties": {
                        "uri": {
                            "description": "The URI of the resource to subscribe to. The URI can use any protocol; it is up to the server how to interpret it.",
                            "format": "uri",
                            "type": "string"
                        }
                    },
                    "required": [
                        "uri"
                    ],
                    "type": "object"
                }
            },
            "required": [
                "method",
                "params"
            ],
            "type": "object"
        },
        "TextContent": {
            "description": "Text provided to or from an LLM.",
            "properties": {
                "annotations": {
                    "properties": {
                        "audience": {
                            "description": "Describes who the intended customer of this object or data is.\n\nIt can include multiple entries to indicate content useful for multiple audiences (e.g., `[\"user\", \"assistant\"]`).",
                            "items": {
                                "$ref": "#/definitions/Role"
},
"type": "array"
},
"priority": {
"description": "Describes how important this data is for operating the server.\n\nA value of 1 means \"most important,\" and indicates that the data is\neffectively required, while 0 means \"least important,\" and indicates that\nthe data is entirely optional.",
"maximum": 1,
"minimum": 0,
"type": "number"
}
},
"type": "object"
},
"text": {
"description": "The text content of the message.",
"type": "string"
},
"type": {
"const": "text",
"type": "string"
}
},
"required": [
"text",
"type"
],
"type": "object"
},
"TextResourceContents": {
"properties": {
"mimeType": {
"description": "The MIME type of this resource, if known.",
"type": "string"
},
"text": {
"description": "The text of the item. This must only be set if the item can actually be represented as text (not binary data).",
"type": "string"
},
"uri": {
"description": "The URI of this resource.",
"format": "uri",
"type": "string"
}
},
"required": [
"text",
"uri"
],
"type": "object"
},
"Tool": {
"description": "Definition for a tool the client can call.",
"properties": {
"description": {
"description": "A human-readable description of the tool.",
"type": "string"
},
"inputSchema": {
"description": "A JSON Schema object defining the expected parameters for the tool.",
"properties": {
"properties": {
"additionalProperties": {
"additionalProperties": true,
"properties": {},
"type": "object"
},
"type": "object"
},
"required": {
"items": {
"type": "string"
},
"type": "array"
},
"type": {
"const": "object",
"type": "string"
}
},
"required": [
"type"
],
"type": "object"
},
"name": {
"description": "The name of the tool.",
"type": "string"
}
},
"required": [
"inputSchema",
"name"
],
"type": "object"
},
"ToolListChangedNotification": {
"description": "An optional notification from the server to the client, informing it that the list of tools it offers has changed. This may be issued by servers without any previous subscription from the client.",
"properties": {
"method": {
"const": "notifications/tools/list_changed",
"type": "string"
},
"params": {
"additionalProperties": {},
"properties": {
"\_meta": {
"additionalProperties": {},
"description": "This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.",
"type": "object"
}
},
"type": "object"
}
},
"required": [
"method"
],
"type": "object"
},
"UnsubscribeRequest": {
"description": "Sent from the client to request cancellation of resources/updated notifications from the server. This should follow a previous resources/subscribe request.",
"properties": {
"method": {
"const": "resources/unsubscribe",
"type": "string"
},
"params": {
"properties": {
"uri": {
"description": "The URI of the resource to unsubscribe from.",
"format": "uri",
"type": "string"
}
},
"required": [
"uri"
],
"type": "object"
}
},
"required": [
"method",
"params"
],
"type": "object"
}
}
}
