'use server';

import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

// Handler function for the API route
export async function GET(request: Request) {
  return Sentry.startSpan(
    {
      name: 'api.test.endpoint.get',
      op: 'http.server',
    },
    async () => {
      try {
        // Add request info as breadcrumb
        Sentry.addBreadcrumb({
          category: 'http.request',
          message: 'API test endpoint received GET request',
          level: 'info',
          data: {
            url: request.url,
            method: 'GET',
          },
        });

        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Test capturing a message
        Sentry.captureMessage('Sentry test API endpoint was called', 'info');

        // Return success response
        return NextResponse.json({
          status: 'success',
          message: 'Sentry test completed successfully',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // Capture the error with context
        Sentry.captureException(error, {
          tags: {
            endpoint: 'sentry-test-api',
            method: 'GET',
          },
        });

        // Return error response
        return NextResponse.json(
          {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          },
          { status: 500 },
        );
      }
    },
  );
}

// Force error handler for testing error tracking
export async function POST() {
  return Sentry.startSpan(
    {
      name: 'api.test.endpoint.error',
      op: 'http.server',
    },
    async () => {
      try {
        // Add context that this is a test
        Sentry.setTag('test.type', 'intentional_error');

        // Force an error
        throw new Error('Sentry test error - This is an intentional error for testing purposes');
      } catch (error) {
        // Capture the exception with tags
        Sentry.captureException(error, {
          tags: {
            testing: 'true',
            errorType: 'intentional',
            endpoint: 'sentry-test-api',
            method: 'POST',
          },
        }); // Return error response
        return NextResponse.json(
          {
            status: 'error',
            message: 'Intentional error triggered for testing',
            timestamp: new Date().toISOString(),
          },
          { status: 500 },
        );
      }
    },
  );
}
