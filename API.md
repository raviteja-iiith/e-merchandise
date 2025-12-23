# API Documentation

Complete API reference for the Multi-Vendor E-Commerce Marketplace.

**Base URL**: `http://localhost:5000/api`

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User
```http
POST /auth/register
```

**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### Login
```http
POST /auth/login
```

**Body**:
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### Get Current User
```http
GET /auth/me
```
**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "avatar": "...",
    "addresses": [],
    "loyaltyPoints": 0
  }
}
```

### Verify Email
```http
GET /auth/verify-email/:token
```

### Forgot Password
```http
POST /auth/forgot-password
```

**Body**:
```json
{
  "email": "john@example.com"
}
```

### Reset Password
```http
POST /auth/reset-password/:token
```

**Body**:
```json
{
  "password": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

### Refresh Token
```http
POST /auth/refresh-token
```

**Body**:
```json
{
  "refreshToken": "..."
}
```

### Logout
```http
POST /auth/logout
```

### OAuth - Google
```http
GET /auth/google
GET /auth/google/callback
```

### OAuth - GitHub
```http
GET /auth/github
GET /auth/github/callback
```

---

## Product Endpoints

### Get All Products
```http
GET /products
```

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 12)
- `sort` (e.g., `-createdAt`, `price`, `-rating`)
- `category` (category ID)
- `minPrice`, `maxPrice`
- `rating` (minimum rating)
- `search` (text search)

**Example**:
```
GET /products?page=1&limit=12&category=electronics&minPrice=100&maxPrice=1000&sort=-rating
```

**Response** (200):
```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "_id": "...",
      "name": "Product Name",
      "slug": "product-name",
      "description": "...",
      "price": 99.99,
      "images": ["url1", "url2"],
      "category": { ... },
      "vendor": { ... },
      "stock": 50,
      "averageRating": 4.5,
      "totalReviews": 120
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "pages": 4
  }
}
```

### Get Single Product
```http
GET /products/:id
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Product Name",
    "description": "...",
    "price": 99.99,
    "compareAtPrice": 129.99,
    "images": [...],
    "category": { ... },
    "vendor": { ... },
    "variants": [
      {
        "name": "Size",
        "options": ["S", "M", "L"],
        "sku": "...",
        "stock": 10,
        "price": 99.99
      }
    ],
    "specifications": { ... },
    "stock": 50,
    "averageRating": 4.5,
    "totalReviews": 120,
    "ratingDistribution": { ... }
  }
}
```

### Create Product
```http
POST /products
```
**Headers**: `Authorization: Bearer <token>`, `Role: vendor`

**Body** (multipart/form-data):
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category": "category_id",
  "stock": 100,
  "images": [File, File]
}
```

### Update Product
```http
PUT /products/:id
```
**Headers**: `Authorization: Bearer <token>`, `Role: vendor`

### Delete Product
```http
DELETE /products/:id
```
**Headers**: `Authorization: Bearer <token>`, `Role: vendor`

### Get Featured Products
```http
GET /products/featured
```

### Get Related Products
```http
GET /products/:id/related
```

### Bulk Upload Products
```http
POST /products/bulk-upload
```
**Headers**: `Authorization: Bearer <token>`, `Role: vendor`
**Body**: CSV file with product data

---

## Category Endpoints

### Get All Categories
```http
GET /categories
```

### Get Category by Slug
```http
GET /categories/slug/:slug
```

### Create Category
```http
POST /categories
```
**Headers**: `Authorization: Bearer <token>`, `Role: admin`

### Update Category
```http
PUT /categories/:id
```

### Delete Category
```http
DELETE /categories/:id
```

---

## Cart Endpoints

### Get Cart
```http
GET /cart
```
**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "user": "...",
    "items": [
      {
        "product": { ... },
        "variant": { ... },
        "quantity": 2,
        "price": 99.99,
        "subtotal": 199.98
      }
    ],
    "subtotal": 199.98,
    "tax": 19.99,
    "shipping": 10.00,
    "discount": 20.00,
    "total": 209.97,
    "appliedCoupon": { ... }
  }
}
```

### Add to Cart
```http
POST /cart/add
```

**Body**:
```json
{
  "productId": "...",
  "variantId": "...",
  "quantity": 1
}
```

### Update Cart Item
```http
PUT /cart/:itemId
```

**Body**:
```json
{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /cart/:itemId
```

### Clear Cart
```http
DELETE /cart/clear
```

### Apply Coupon
```http
POST /cart/apply-coupon
```

**Body**:
```json
{
  "code": "SAVE20"
}
```

### Remove Coupon
```http
DELETE /cart/remove-coupon
```

---

## Wishlist Endpoints

### Get Wishlist
```http
GET /wishlist
```

### Add to Wishlist
```http
POST /wishlist/add
```

**Body**:
```json
{
  "productId": "..."
}
```

### Remove from Wishlist
```http
DELETE /wishlist/:productId
```

### Move to Cart
```http
POST /wishlist/:productId/move-to-cart
```

### Clear Wishlist
```http
DELETE /wishlist/clear
```

---

## Order Endpoints

### Create Order
```http
POST /orders
```

**Body**:
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "stripe",
  "paymentDetails": {
    "stripePaymentIntentId": "..."
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1234567890-ABCD",
    "_id": "...",
    "user": "...",
    "items": [...],
    "subtotal": 199.98,
    "tax": 19.99,
    "shipping": 10.00,
    "total": 229.97,
    "status": "pending",
    "paymentStatus": "paid"
  }
}
```

### Get User Orders
```http
GET /orders
```

**Query Parameters**:
- `page`, `limit`
- `status` (pending, processing, shipped, delivered, cancelled)

### Get Order Details
```http
GET /orders/:orderId
```

### Cancel Order
```http
PUT /orders/:orderId/cancel
```

**Body**:
```json
{
  "reason": "Changed my mind"
}
```

### Request Return
```http
POST /orders/:orderId/return
```

**Body**:
```json
{
  "items": ["item_id_1", "item_id_2"],
  "reason": "Defective product"
}
```

---

## Review Endpoints

### Get Product Reviews
```http
GET /reviews/product/:productId
```

**Query Parameters**:
- `page`, `limit`
- `rating` (filter by rating)
- `sort` (e.g., `-createdAt`, `helpfulCount`)

### Create Review
```http
POST /reviews
```

**Body** (multipart/form-data):
```json
{
  "product": "product_id",
  "rating": 5,
  "title": "Great product!",
  "comment": "Really satisfied with this purchase.",
  "images": [File, File]
}
```

### Update Review
```http
PUT /reviews/:id
```

### Delete Review
```http
DELETE /reviews/:id
```

### Mark Review as Helpful
```http
POST /reviews/:id/helpful
```

### Vendor Response
```http
POST /reviews/:id/vendor-response
```

**Body**:
```json
{
  "response": "Thank you for your feedback!"
}
```

---

## Vendor Endpoints

### Register as Vendor
```http
POST /vendors/register
```

**Body** (multipart/form-data):
```json
{
  "storeName": "My Store",
  "description": "We sell quality products",
  "phone": "+1234567890",
  "businessDetails": {
    "businessName": "My Business LLC",
    "registrationNumber": "123456",
    "taxId": "TAX123"
  },
  "bankDetails": {
    "accountName": "John Doe",
    "accountNumber": "1234567890",
    "bankName": "Bank of America",
    "routingNumber": "123456789"
  },
  "logo": File,
  "banner": File
}
```

### Get Vendor Profile
```http
GET /vendors/profile
```

### Update Vendor Profile
```http
PUT /vendors/profile
```

### Get Vendor Analytics
```http
GET /vendors/analytics
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalRevenue": 15000.00,
    "totalOrders": 250,
    "totalProducts": 45,
    "averageRating": 4.5,
    "monthlySales": [
      { "month": "2024-01", "sales": 2500, "orders": 50 },
      { "month": "2024-02", "sales": 3000, "orders": 60 }
    ],
    "topProducts": [...],
    "recentOrders": [...]
  }
}
```

### Get Vendor Orders
```http
GET /vendors/orders
```

### Update Order Status
```http
PUT /vendors/orders/:orderId/status
```

**Body**:
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

### Get Vendor Products
```http
GET /vendors/products
```

---

## Payment Endpoints

### Create Payment Intent
```http
POST /payment/create-intent
```

**Body**:
```json
{
  "amount": 99.99
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_..."
  }
}
```

### Stripe Webhook
```http
POST /payment/webhook
```
(Handles Stripe events)

---

## Search Endpoints

### Search Products
```http
GET /search
```

**Query Parameters**:
- `q` (search query)
- `category`
- `minPrice`, `maxPrice`
- `rating`
- `inStock` (boolean)

### Search Suggestions
```http
GET /search/suggestions
```

**Query Parameters**:
- `q` (search query)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "products": [...],
    "categories": [...],
    "vendors": [...]
  }
}
```

---

## Admin Endpoints

### Dashboard Stats
```http
GET /admin/dashboard
```
**Headers**: `Authorization: Bearer <token>`, `Role: admin`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "totalVendors": 50,
    "totalProducts": 500,
    "totalOrders": 2000,
    "totalRevenue": 100000,
    "recentUsers": [...],
    "recentOrders": [...],
    "salesByMonth": [...]
  }
}
```

### Get All Users
```http
GET /admin/users
```

### Block/Unblock User
```http
PUT /admin/users/:userId/block
```

### Get All Vendors
```http
GET /admin/vendors
```

### Approve Vendor
```http
PUT /admin/vendors/:vendorId/approve
```

### Reject Vendor
```http
PUT /admin/vendors/:vendorId/reject
```

**Body**:
```json
{
  "reason": "Incomplete documentation"
}
```

### Get All Orders
```http
GET /admin/orders
```

### Get All Products
```http
GET /admin/products
```

### Moderate Product
```http
PUT /admin/products/:productId/moderate
```

**Body**:
```json
{
  "action": "approve" // or "reject"
}
```

### Create Coupon
```http
POST /admin/coupons
```

**Body**:
```json
{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "minPurchaseAmount": 100,
  "maxDiscount": 50,
  "validFrom": "2024-01-01",
  "validUntil": "2024-12-31",
  "usageLimit": 100
}
```

---

## Notification Endpoints

### Get User Notifications
```http
GET /notifications
```

### Mark as Read
```http
PUT /notifications/:id/read
```

### Mark All as Read
```http
PUT /notifications/read-all
```

### Delete Notification
```http
DELETE /notifications/:id
```

---

## Chat Endpoints

### Get User Conversations
```http
GET /chat/conversations
```

### Get Conversation Messages
```http
GET /chat/conversations/:conversationId/messages
```

### Send Message
```http
POST /chat/send
```

**Body**:
```json
{
  "recipientId": "...",
  "message": "Hello!"
}
```

### Mark Messages as Read
```http
PUT /chat/conversations/:conversationId/read
```

---

## User Endpoints

### Update Profile
```http
PUT /users/profile
```

**Body** (multipart/form-data):
```json
{
  "name": "John Updated",
  "phone": "+1234567890",
  "avatar": File
}
```

### Change Password
```http
PUT /users/change-password
```

**Body**:
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

### Add Address
```http
POST /users/addresses
```

**Body**:
```json
{
  "label": "Home",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "isDefault": true
}
```

### Update Address
```http
PUT /users/addresses/:addressId
```

### Delete Address
```http
DELETE /users/addresses/:addressId
```

### Set Default Address
```http
PUT /users/addresses/:addressId/set-default
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error info"
}
```

**Common Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

**Validation Error Example**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **File uploads**: 10 requests per hour

---

## WebSocket Events

Connect to: `http://localhost:5000`

### Client → Server

```javascript
// Join user room
socket.emit('join', { userId: '...' });

// Send message
socket.emit('send-message', {
  recipientId: '...',
  message: 'Hello!'
});
```

### Server → Client

```javascript
// New notification
socket.on('notification', (notification) => {
  console.log(notification);
});

// New message
socket.on('new-message', (message) => {
  console.log(message);
});

// Order status update
socket.on('order-update', (order) => {
  console.log(order);
});

// Stock update
socket.on('stock-update', (product) => {
  console.log(product);
});
```

---

**Need help?** Contact support at support@marketplace.com
