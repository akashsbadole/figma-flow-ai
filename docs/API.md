openapi: 3.0.3
info:
  title: AI Design Studio API
  description: API for the Figma Flow AI Design Studio application
  version: 1.0.0
  contact:
    name: Development Team

servers:
  - url: http://localhost:3001
    description: Development server
  - url: https://api.figma-flow.ai
    description: Production server

tags:
  - name: Authentication
    description: User authentication endpoints
  - name: Projects
    description: Project management endpoints
  - name: Designs
    description: Design generation and management endpoints
  - name: Templates
    description: Template browsing and saving endpoints
  - name: Design Systems
    description: Design system generation endpoints
  - name: History
    description: Generation history endpoints
  - name: AI
    description: AI-powered generation endpoints
  - name: Admin
    description: Admin panel endpoints

paths:
  /api/health:
    get:
      summary: Health check
      tags: [Authentication]
      responses:
        '200':
          description: Server is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok

  /api/profile:
    get:
      summary: Get user profile
      tags: [Authentication]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    post:
      summary: Update user profile
      tags: [Authentication]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                display_name:
                  type: string
                avatar_url:
                  type: string
                  format: uri
      responses:
        '200':
          description: Profile updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/subscription:
    get:
      summary: Get user subscription
      tags: [Authentication]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Subscription details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Subscription'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/increment-usage:
    post:
      summary: Increment usage counter
      tags: [Authentication]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Usage incremented
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Subscription'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/projects:
    get:
      summary: Get all user projects
      tags: [Projects]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of projects
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Project'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    post:
      summary: Create a new project
      tags: [Projects]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - description
                - type
              properties:
                name:
                  type: string
                description:
                  type: string
                type:
                  type: string
                  enum: [web, mobile, desktop]
      responses:
        '201':
          description: Project created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Project'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/projects/{id}:
    delete:
      summary: Delete a project
      tags: [Projects]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Project deleted
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

  /api/designs:
    get:
      summary: Get all user designs
      tags: [Designs]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of designs
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Design'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    post:
      summary: Create a new design
      tags: [Designs]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - prompt
              properties:
                project_id:
                  type: string
                  format: uuid
                prompt:
                  type: string
                html_code:
                  type: string
                css_code:
                  type: string
                svg_code:
                  type: string
                image_url:
                  type: string
                  format: uri
      responses:
        '201':
          description: Design created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Design'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/designs/{id}:
    get:
      summary: Get a design by ID
      tags: [Designs]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Design details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Design'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
    
    delete:
      summary: Delete a design
      tags: [Designs]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Design deleted
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

  /api/templates:
    get:
      summary: Get all templates
      tags: [Templates]
      responses:
        '200':
          description: List of templates
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Template'

  /api/templates/{id}:
    get:
      summary: Get a template by ID
      tags: [Templates]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Template details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Template'
        '404':
          $ref: '#/components/responses/NotFound'

  /api/saved-templates:
    get:
      summary: Get user's saved templates
      tags: [Templates]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of saved templates
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Template'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    post:
      summary: Save a template
      tags: [Templates]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - template_id
              properties:
                template_id:
                  type: string
                  format: uuid
      responses:
        '200':
          description: Template saved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SavedTemplate'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/saved-templates/{templateId}:
    delete:
      summary: Unsave a template
      tags: [Templates]
      security:
        - BearerAuth: []
      parameters:
        - name: templateId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Template unsaved
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/design-systems:
    get:
      summary: Get user's design systems
      tags: [Design Systems]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of design systems
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/DesignSystem'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    post:
      summary: Create a new design system
      tags: [Design Systems]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
              properties:
                project_id:
                  type: string
                  format: uuid
                name:
                  type: string
                colors:
                  type: object
                typography:
                  type: object
                spacing:
                  type: object
                components:
                  type: object
      responses:
        '201':
          description: Design system created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DesignSystem'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/generation-history:
    get:
      summary: Get user's generation history
      tags: [History]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of generation history
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/GenerationHistory'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    post:
      summary: Create generation history entry
      tags: [History]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - type
                - prompt
                - result
              properties:
                type:
                  type: string
                  enum: [design, template, design_system, image_to_design]
                prompt:
                  type: string
                result:
                  type: object
                metadata:
                  type: object
      responses:
        '201':
          description: History entry created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GenerationHistory'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/generation-history/{id}:
    delete:
      summary: Delete generation history entry
      tags: [History]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: History entry deleted
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

  /api/ai/generate-design:
    post:
      summary: Generate UI design variants
      tags: [AI]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - prompt
              properties:
                prompt:
                  type: string
                  maxLength: 5000
                deviceType:
                  type: string
                  enum: [mobile, tablet, desktop]
                  default: mobile
                variantCount:
                  type: integer
                  enum: [1, 2, 4, 6, 8]
                  default: 4
      responses:
        '200':
          description: Generated designs
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DesignResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          description: Rate limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/ai/generate-design-system:
    post:
      summary: Generate design system tokens
      tags: [AI]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - prompt
              properties:
                prompt:
                  type: string
      responses:
        '200':
          description: Generated design system
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DesignSystem'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/ai/generate-templates:
    post:
      summary: Generate templates from AI
      tags: [AI]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - prompt
                - deviceType
              properties:
                prompt:
                  type: string
                deviceType:
                  type: string
                  enum: [mobile, tablet, desktop]
      responses:
        '200':
          description: Generated templates
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Template'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/ai/image-to-design:
    post:
      summary: Convert image to design
      tags: [AI]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - image
              properties:
                image:
                  type: string
                  description: Base64 encoded image or URL
                prompt:
                  type: string
      responses:
        '200':
          description: Generated design from image
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DesignResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /api/admin/users:
    get:
      summary: Get all users (admin only)
      tags: [Admin]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of all users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/AdminUser'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

  /api/admin/update-role:
    post:
      summary: Update user role (admin only)
      tags: [Admin]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - user_id
                - role
              properties:
                user_id:
                  type: string
                  format: uuid
                role:
                  type: string
                  enum: [user, admin]
      responses:
        '200':
          description: Role updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AdminUser'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

  /api/admin/update-subscription:
    post:
      summary: Update user subscription (admin only)
      tags: [Admin]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - user_id
                - plan
                - status
                - generations_limit
              properties:
                user_id:
                  type: string
                  format: uuid
                plan:
                  type: string
                  enum: [free, pro, enterprise]
                status:
                  type: string
                  enum: [active, inactive, cancelled]
                generations_limit:
                  type: integer
      responses:
        '200':
          description: Subscription updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AdminUser'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

  /api/admin/toggle-user:
    post:
      summary: Enable/disable user (admin only)
      tags: [Admin]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - user_id
                - is_enabled
              properties:
                user_id:
                  type: string
                  format: uuid
                is_enabled:
                  type: boolean
      responses:
        '200':
          description: User toggled
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AdminUser'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: User ID from Clerk authentication

  schemas:
    UserProfile:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
        display_name:
          type: string
          nullable: true
        avatar_url:
          type: string
          format: uri
          nullable: true
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Subscription:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
        plan:
          type: string
          enum: [free, pro, enterprise]
        status:
          type: string
          enum: [active, inactive, cancelled]
        generations_limit:
          type: integer
        generations_used:
          type: integer
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Project:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
        name:
          type: string
        description:
          type: string
        type:
          type: string
          enum: [web, mobile, desktop]
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Design:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
        project_id:
          type: string
          format: uuid
          nullable: true
        prompt:
          type: string
        html_code:
          type: string
          nullable: true
        css_code:
          type: string
          nullable: true
        svg_code:
          type: string
          nullable: true
        image_url:
          type: string
          format: uri
          nullable: true
        device_type:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    DesignVariant:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        html:
          type: string
        css:
          type: string

    DesignResponse:
      type: object
      properties:
        variants:
          type: array
          items:
            $ref: '#/components/schemas/DesignVariant'
        deviceType:
          type: string
        deviceWidth:
          type: integer
        deviceHeight:
          type: integer
        deviceLabel:
          type: string

    Template:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        description:
          type: string
        category:
          type: string
        tags:
          type: array
          items:
            type: string
        html_code:
          type: string
        css_code:
          type: string
        preview_url:
          type: string
          format: uri
        created_at:
          type: string
          format: date-time
        is_premium:
          type: boolean

    SavedTemplate:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
        template_id:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time

    DesignSystem:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
        project_id:
          type: string
          format: uuid
          nullable: true
        name:
          type: string
        colors:
          type: object
          properties:
            primary:
              type: string
            secondary:
              type: string
            accent:
              type: string
            background:
              type: string
            surface:
              type: string
            text:
              type: string
        typography:
          type: object
        spacing:
          type: object
        components:
          type: object
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    GenerationHistory:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
        type:
          type: string
          enum: [design, template, design_system, image_to_design]
        prompt:
          type: string
        result:
          type: object
        metadata:
          type: object
          nullable: true
        created_at:
          type: string
          format: date-time

    AdminUser:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        display_name:
          type: string
          nullable: true
        avatar_url:
          type: string
          format: uri
          nullable: true
        role:
          type: string
          enum: [user, admin]
        is_enabled:
          type: boolean
        created_at:
          type: string
          format: date-time
        subscription:
          $ref: '#/components/schemas/Subscription'

    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            timestamp:
              type: string
              format: date-time

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            error:
              code: UNAUTHORIZED
              message: Unauthorized - Authentication required
              timestamp: "2026-03-19T00:00:00.000Z"

    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            error:
              code: FORBIDDEN
              message: Forbidden - Admin access required
              timestamp: "2026-03-19T00:00:00.000Z"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            success: false
            error:
              code: NOT_FOUND
              message: Resource not found
              timestamp: "2026-03-19T00:00:00.000Z"
