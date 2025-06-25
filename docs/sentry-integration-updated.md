# Sentry Integration for SnapMeal (Updated)

This document outlines the Sentry integration in the SnapMeal application for monitoring, error tracking, and performance measurement.

## Key Components

1. **Server Action Monitoring**
   - All server actions are wrapped with Sentry monitoring using the `withSentryServerAction` utility
   - Performance metrics and error tracking are automatically collected
   - User context and breadcrumbs are added for better debugging

2. **Client-Side Error Tracking**
   - User errors and exceptions are automatically captured
   - Session replay helps diagnose UI issues
   - Page load performance is tracked

3. **API Route Monitoring**
   - API routes are instrumented for error tracking and performance monitoring
   - Request/response details are captured for debugging

## Integrated Server Actions

The following server actions have Sentry integration:

- `addMeal` - Tracks meal creation with user context and performance metrics
- `updateMeal` - Monitors meal updates with detailed context
- `deleteMeal` - Tracks meal deletion operations including batch transactions
- `addUserAccount` - Monitors user account creation with breadcrumbs
- `fetchUserAccount` - Tracks user profile retrieval
- `fetchMealById` - Monitors single meal retrieval with error handling
- `fetchMealsByUserId` - Tracks paginated meal list retrieval with performance metrics

## Using Sentry in Server Actions

To add Sentry to a server action:

```typescript
// Original server action
async function myActionImplementation(param1: string, param2: number): Promise<Result> {
  // Your action code
}

// Export the wrapped version
export const myAction = withSentryServerAction(
  'myAction', 
  myActionImplementation
);
```

### Custom Context and Tags

Within a server action, you can add additional context:

```typescript
// Set user context for debugging
Sentry.setUser({ id: userId });

// Set custom tags for filtering in Sentry dashboard
Sentry.setTag('customTag', 'value');

// Add breadcrumbs to trace execution flow
Sentry.addBreadcrumb({
  category: 'business-logic',
  message: 'Starting important operation',
  level: 'info',
  data: { /* relevant data */ }
});
```

## Performance Monitoring

Performance is automatically tracked for all wrapped server actions, including:
- Total execution time
- Error rates
- Throughput

## Dashboard and Alerts

The Sentry dashboard provides:
- Error reports with full context
- Performance trends
- User impact analysis
- Real-time alerts for critical issues

## Environment Variables

The Sentry DSN is configured in the environment:
- `NEXT_PUBLIC_SENTRY_DSN`: The Sentry project Data Source Name

## Testing Sentry Integration

The application includes test routes to verify Sentry integration:

1. **Test Page**: Visit `/sentry-test` to access a test UI
   - Test frontend error capturing
   - Test API integration
   - Simulate errors and monitor results

2. **Test API Endpoint**: Call `/api/sentry-test` to test server-side integration
   - GET: Test normal operation with performance tracking
   - POST: Test error handling

## Best Practices

1. Always wrap server actions with `withSentryServerAction`
2. Add relevant user and operation context
3. Use breadcrumbs to track operation flow
4. Set meaningful tags for easier filtering
5. Keep PII (Personally Identifiable Information) out of error reports
6. Capture errors with additional context
