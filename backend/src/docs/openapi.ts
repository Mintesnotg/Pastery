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
    { name: "Banners" },
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
      BannerCta: {
        type: "object",
        required: ["label", "link"],
        properties: { label: { type: "string" }, link: { type: "string" } },
      },
      BannerOverlayText: {
        type: "object",
        required: ["heading", "subheading"],
        properties: { heading: { type: "string" }, subheading: { type: "string" } },
      },
      BannerPublic: {
        type: "object",
        required: ["id", "title", "alt_text", "image_url", "cta", "overlay_text"],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          alt_text: { type: "string" },
          image_url: { type: "string", format: "uri" },
          cta: { $ref: "#/components/schemas/BannerCta" },
          overlay_text: { $ref: "#/components/schemas/BannerOverlayText" },
        },
      },
      BannerAdmin: {
        allOf: [
          { $ref: "#/components/schemas/BannerPublic" },
          {
            type: "object",
            required: ["is_active", "sort_order", "created_at", "updated_at"],
            properties: {
              is_active: { type: "boolean" },
              sort_order: { type: "integer" },
              created_at: { type: "string", format: "date-time" },
              updated_at: { type: "string", format: "date-time" },
            },
          },
        ],
      },
      BannerCreateRequest: {
        type: "object",
        required: ["title", "alt_text", "image_url", "cta", "overlay_text"],
        properties: {
          title: { type: "string" },
          alt_text: { type: "string" },
          image_url: { type: "string", format: "uri" },
          cta: { $ref: "#/components/schemas/BannerCta" },
          overlay_text: { $ref: "#/components/schemas/BannerOverlayText" },
          is_active: { type: "boolean" },
          sort_order: { type: "integer" },
        },
      },
      BannerListResponse: {
        type: "object",
        required: ["data", "total", "page", "pageSize", "totalPages"],
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/BannerAdmin" } },
          total: { type: "integer" },
          page: { type: "integer" },
          pageSize: { type: "integer" },
          totalPages: { type: "integer" },
        },
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
        summary: "Create user (public registration forces customer role id 2 when unauthenticated)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "firstName", "lastName"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  roleIds: {
                    type: "array",
                    items: { type: "integer" },
                    description: "Ignored on public register; forced to [2]. Honored when authenticated admin creates a user.",
                  },
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
    "/api/banners": {
      get: {
        tags: ["Banners"],
        summary: "List active banners for public carousel",
        responses: {
          200: {
            description: "Active banners sorted by sort_order",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/BannerPublic" } } } },
          },
        },
      },
      post: {
        tags: ["Banners"],
        summary: "Create banner",
        parameters: [{ name: "X-Permission", in: "header", required: true, schema: { type: "string", example: "create.banner" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/BannerCreateRequest" } } },
        },
        responses: {
          201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/BannerAdmin" } } } },
          400: { description: "Bad Request" },
          401: { description: "Unauthenticated" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/banners/admin": {
      get: {
        tags: ["Banners"],
        summary: "Paginated admin banner list",
        parameters: [
          { name: "X-Permission", in: "header", required: true, schema: { type: "string", example: "view.banner" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } },
          { name: "includeInactive", in: "query", schema: { type: "boolean" } },
        ],
        responses: {
          200: { description: "Paginated banners", content: { "application/json": { schema: { $ref: "#/components/schemas/BannerListResponse" } } } },
        },
      },
    },
    "/api/banners/{id}": {
      get: {
        tags: ["Banners"],
        parameters: [{ name: "X-Permission", in: "header", required: true, schema: { type: "string", example: "view.banner" } }],
        responses: { 200: { description: "Banner", content: { "application/json": { schema: { $ref: "#/components/schemas/BannerAdmin" } } } } },
      },
      put: {
        tags: ["Banners"],
        parameters: [{ name: "X-Permission", in: "header", required: true, schema: { type: "string", example: "update.banner" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/BannerCreateRequest" } } } },
        responses: { 200: { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/BannerAdmin" } } } } },
      },
      delete: {
        tags: ["Banners"],
        parameters: [{ name: "X-Permission", in: "header", required: true, schema: { type: "string", example: "delete.banner" } }],
        responses: { 204: { description: "Soft deleted" } },
      },
    },
    "/api/messages": { get: { tags: ["Messages"] }, post: { tags: ["Messages"] } },
    "/api/messages/{id}": { delete: { tags: ["Messages"] } },
    "/api/orders": { get: { tags: ["Orders"] }, post: { tags: ["Orders"] } },
    "/api/orders/{id}": { put: { tags: ["Orders"] }, delete: { tags: ["Orders"] } },
  },
};
