# PetNeeds API - Testing Documentation

This document provides comprehensive information about testing the PetNeeds REST API.

## Test Structure

```
tests/
├── setup.js                 # Jest setup and database initialization
├── unit/                    # Unit tests for individual components
│   ├── auth.test.js        # Authentication endpoints
│   ├── admin/
│   │   └── products.test.js # Admin product management
│   ├── customer/
│   │   └── payments.test.js # Customer payment endpoints
│   ├── webhook/
│   │   └── midtrans.test.js # Midtrans webhook handling
│   ├── health.test.js      # Health check endpoint
│   └── error-handling.test.js # Error handling and 404s
└── integration/            # End-to-end integration tests
    └── user-flow.test.js   # Complete user journey
```

## Test Categories

### Unit Tests
- Test individual endpoints and functions
- Mock external dependencies (Midtrans API)
- Fast execution, isolated components
- Located in `tests/unit/`

### Integration Tests
- Test complete user workflows
- Real database interactions
- End-to-end functionality
- Located in `tests/integration/`

## Running Tests

### Prerequisites
1. Ensure database is accessible
2. Install dependencies: `npm install`
3. Set up test environment variables in `.env.test`

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

## Test Environment

### Database
Tests use a separate test database (`petneeds_test`) to avoid affecting production data.

### Environment Variables
Create `.env.test` file with test-specific configuration:

```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=3306
DB_NAME=petneeds_test
DB_USER=root
DB_PASSWORD=

JWT_SECRET=test-jwt-secret-key
JWT_REFRESH_SECRET=test-refresh-secret-key

MIDTRANS_SERVER_KEY=test-server-key
MIDTRANS_CLIENT_KEY=test-client-key
WEBHOOK_SECRET_KEY=test-webhook-secret
```

## Test Database Setup

Tests automatically:
1. Connect to test database
2. Create all tables (force sync)
3. Clean up data between tests
4. Close connection after all tests

## Coverage Report

Coverage reports are generated in the `coverage/` directory with:
- Text summary in terminal
- HTML report at `coverage/lcov-report/index.html`
- LCOV format for CI/CD integration

### Coverage Goals
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

## Test Data

### Test Users
- **Admin**: `admin@test.com` / `password123`
- **Customer**: `customer@test.com` / `password123`

### Test Products
- Auto-generated test products and categories
- Realistic pricing and inventory data

### Mock Data
- Midtrans API responses are mocked
- External service calls are stubbed

## API Endpoint Coverage

### ✅ Fully Covered Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/profile` - Profile retrieval
- `PUT /api/v1/auth/profile` - Profile updates
- `PUT /api/v1/auth/change-password` - Password changes

#### Admin Endpoints
- `GET /api/v1/admin/products` - Product listing with filters
- `GET /api/v1/admin/products/:id` - Single product retrieval
- `POST /api/v1/admin/products` - Product creation
- `PUT /api/v1/admin/products/:id` - Product updates
- `DELETE /api/v1/admin/products/:id` - Product deletion

#### Customer Endpoints
- `POST /api/v1/customer/payments` - Payment creation
- `GET /api/v1/customer/payments/:id` - Payment retrieval
- `GET /api/v1/customer/orders/:orderId/payment` - Order payment

#### Webhooks
- `POST /api/v1/webhook/midtrans/notification` - Payment notifications

#### Utilities
- `GET /api/v1/health` - Health check
- Error handling and 404 responses

### 🔄 Integration Test Coverage

#### Complete User Flow
1. **Registration** → User account creation
2. **Authentication** → Login and token generation
3. **Address Management** → Delivery address setup
4. **Product Browsing** → Category and product retrieval
5. **Shopping Cart** → Add/update/remove items
6. **Order Creation** → Checkout process
7. **Payment Processing** → Midtrans integration
8. **Webhook Handling** → Payment status updates
9. **Order Management** → Status tracking
10. **Admin Monitoring** → Payment and order oversight

## Test Scenarios

### Authentication Tests
- ✅ Valid registration and login
- ✅ Invalid credentials handling
- ✅ Token refresh functionality
- ✅ Profile management
- ✅ Password changes
- ✅ Role-based access control

### Product Management Tests
- ✅ CRUD operations for products
- ✅ Pagination and filtering
- ✅ Search functionality
- ✅ Category associations
- ✅ Validation and error handling
- ✅ Soft delete functionality

### Payment Integration Tests
- ✅ Payment creation with Midtrans
- ✅ Webhook signature verification
- ✅ Status update handling
- ✅ Order status synchronization
- ✅ Error handling for failed payments

### Security Tests
- ✅ Authentication middleware
- ✅ Authorization checks
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention

## Mocking Strategy

### External Services
- **Midtrans API**: Fully mocked for consistent testing
- **Email Service**: Stubbed to prevent actual emails
- **File Upload**: Mocked for image handling

### Database Isolation
- **Test Database**: Separate database for testing
- **Transaction Rollback**: Automatic cleanup between tests
- **Fixture Data**: Controlled test data setup

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v2
        with:
          file: ./coverage/lcov.info
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure test database exists
   - Check database credentials in `.env.test`
   - Verify MySQL server is running

2. **Tests Hanging**
   - Check for unclosed database connections
   - Ensure all async operations complete
   - Review timeout settings

3. **Mock Errors**
   - Verify mock implementations match actual API
   - Check jest.mock() placement
   - Ensure mocks are reset between tests

4. **Coverage Issues**
   - Check excluded files in jest config
   - Verify test files are in correct directories
   - Review coverage thresholds

### Debug Mode

Run tests with verbose output:
```bash
DEBUG=jest:* npm test
```

Run specific test file:
```bash
npm test -- tests/unit/auth.test.js
```

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure 80%+ code coverage
3. Test both success and error scenarios
4. Update this documentation
5. Run full test suite before committing

## Performance Benchmarks

- **Unit Tests**: < 30 seconds for full suite
- **Integration Tests**: < 60 seconds for full suite
- **Memory Usage**: < 200MB during test execution
- **Database Load**: Minimal impact on production systems
