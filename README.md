# PetNeeds API

A comprehensive RESTful API for PetNeeds e-commerce platform with Midtrans payment integration.

## Features

- **Role-based Authentication**: Admin and Customer roles with JWT tokens
- **Product Management**: CRUD operations for products, categories, and product images
- **Shopping Cart**: Add, update, and manage cart items
- **Order Management**: Complete order lifecycle from creation to delivery
- **Payment Integration**: Midtrans payment gateway with webhooks
- **Address Management**: Multiple delivery addresses per customer
- **Shipment Tracking**: Track order shipments with carriers
- **Rate Limiting**: Protection against abuse
- **Soft Delete**: Data preservation with soft delete functionality

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Midtrans Payment Gateway
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Email**: Nodemailer (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd petneeds-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Run migrations to create tables
   npm run migrate

   # Or test database connection
   npm run db:test
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Environment Variables

Copy `env.example` to `.env` and configure:

### Database
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 3306)
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password

### JWT
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: Refresh token secret
- `JWT_EXPIRE`: Token expiration (default: 7d)
- `JWT_REFRESH_EXPIRE`: Refresh token expiration (default: 30d)

### Midtrans
- `MIDTRANS_SERVER_KEY`: Midtrans server key
- `MIDTRANS_CLIENT_KEY`: Midtrans client key
- `MIDTRANS_MERCHANT_ID`: Merchant ID
- `MIDTRANS_SANDBOX`: Sandbox mode (true/false)

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

### Admin Endpoints (`/api/v1/admin/*`)
- **Products**: CRUD operations for products
- **Categories**: CRUD operations for categories
- **Product Images**: Manage product images
- **Payments**: View and manage payments
- **Shipments**: Manage order shipments

### Customer Endpoints (`/api/v1/customer/*`)
- **Addresses**: Manage delivery addresses
- **Cart**: Shopping cart operations
- **Orders**: Order management and history
- **Order Items**: Order item details
- **Payments**: Payment processing

### Webhooks
- `POST /api/v1/webhook/midtrans/notification` - Midtrans payment notifications

## Database Schema

### Core Tables
- `users` - User accounts (admin/customer)
- `categories` - Product categories
- `products` - Product catalog
- `product_images` - Product image gallery
- `addresses` - User delivery addresses
- `cart` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment transactions
- `shipments` - Order shipment tracking

## Migration Commands

```bash
# Run all migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback:1

# Rollback multiple migrations
npm run migrate:rollback
```

## API Documentation

API documentation is available via Swagger UI at `/api-docs` when the server is running.

## Testing

The API includes comprehensive test coverage with unit and integration tests.

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Generate coverage report
npm run test:coverage

# Generate HTML coverage report
npm run test:coverage:html

# CI mode (for continuous integration)
npm run test:ci
```

### Test Coverage

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

### Test Structure

- **Unit Tests**: Individual endpoint testing with mocked dependencies
- **Integration Tests**: Complete user workflows from registration to payment
- **Webhook Tests**: Midtrans payment notification handling

See `tests/README.md` for detailed testing documentation.

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- SQL injection protection
- CORS configuration
- Helmet security headers

## Midtrans Integration

### Payment Flow
1. Customer creates order
2. System generates Midtrans Snap token
3. Frontend redirects to Midtrans payment page
4. Midtrans processes payment
5. Webhook updates payment status
6. System updates order status

### Webhook Security
- Signature verification for webhook authenticity
- Rate limiting on webhook endpoints
- Comprehensive logging for audit trails

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
