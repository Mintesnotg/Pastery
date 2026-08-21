export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "House of Bread Backend API",
    version: "1.0.0",
    description: "Backend API documentation for products, orders, messages, auth, and account management.",
  },
  servers: [{ url: "http://localhost:4000" }],
  tags: [
    { name: "Health" },
    { name: "Products" },
    { name: "Testimonials" },
    { name: "Messages" },
    { name: "Orders" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Roles" },
    { name: "Permissions" },
  ],
  components: {
    schemas: {
      Error: { type: "object", properties: { error: { type: "string" }, detail: { nullable: true } } },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      LoginResponse: {
        type: "object",
        required: ["token", "roleIds"],
        properties: {
          token: { type: "string", description: "JWT access token" },
          roleIds: { type: "array", items: { type: "integer" } },
        },
      },
      User: {
        type: "object",
        required: ["id", "email", "fullName", "active", "roleIds"],
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string" },
          fullName: { type: "string" },
          active: { type: "boolean" },
          roleIds: { type: "array", items: { type: "integer" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          lastLoginAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      Role: {
        type: "object",
        properties: { id: { type: "integer" }, key: { type: "string" }, name: { type: "string" }, status: { type: "string", enum: ["ACTIVE", "INACTIVE"] } },
      },
      Permission: {
        type: "object",
        properties: { id: { type: "integer" }, key: { type: "string" }, name: { type: "string" }, status: { type: "string", enum: ["ACTIVE", "INACTIVE"] } },
      },
    },
  },
  paths: {
    "/health": { get: { tags: ["Health"], responses: { 200: { description: "OK" } } } },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          200: {
            description: "Logged in",
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } },
          },
          400: { description: "Bad Request" },
          401: { description: "Invalid credentials" },
          500: { description: "Internal Server Error" },
        },
      },
    },
    "/api/auth/me": { get: { tags: ["Auth"], responses: { 200: { description: "Session info" }, 401: { description: "Unauthenticated" } } } },
    "/api/auth/logout": { post: { tags: ["Auth"], responses: { 200: { description: "Logged out" } } } },
    "/api/users": {
      get: { tags: ["Users"], responses: { 200: { description: "List users" } } },
      post: {
        tags: ["Users"],
        summary: "Create user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  roleIds: { type: "array", items: { type: "integer" } },
                  fullName: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          400: { description: "Bad Request" },
          409: { description: "Conflict" },
        },
      },
    },
    "/api/users/{id}": { get: { tags: ["Users"] }, put: { tags: ["Users"] }, delete: { tags: ["Users"] } },
    "/api/roles": { get: { tags: ["Roles"] }, post: { tags: ["Roles"] } },
    "/api/roles/{id}": { get: { tags: ["Roles"] }, put: { tags: ["Roles"] }, delete: { tags: ["Roles"] } },
    "/api/roles/{id}/permissions": { get: { tags: ["Roles"] } },
    "/api/permissions": { get: { tags: ["Permissions"] }, post: { tags: ["Permissions"] } },
    "/api/permissions/{id}": { get: { tags: ["Permissions"] }, put: { tags: ["Permissions"] }, delete: { tags: ["Permissions"] } },
    "/api/products": { get: { tags: ["Products"] } },
    "/api/testimonials": { get: { tags: ["Testimonials"] } },
    "/api/messages": { get: { tags: ["Messages"] }, post: { tags: ["Messages"] } },
    "/api/messages/{id}": { delete: { tags: ["Messages"] } },
    "/api/orders": { get: { tags: ["Orders"] }, post: { tags: ["Orders"] } },
    "/api/orders/{id}": { put: { tags: ["Orders"] }, delete: { tags: ["Orders"] } },
  },
};
