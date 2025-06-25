'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import * as Sentry from '@sentry/nextjs';
import { useEffect, useState } from 'react';

/**
 * SentryTest component for testing Sentry integration
 * This component demonstrates how to use Sentry for error tracking and performance monitoring
 */
export default function SentryTestPage() {
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Test Sentry on component mount
  useEffect(() => {
    // Add breadcrumb for component mount
    Sentry.addBreadcrumb({
      category: 'component',
      message: 'SentryTest component mounted',
      level: 'info',
    });
  }, []);

  // Handler for triggering a frontend error
  const handleTriggerError = () => {
    try {
      // Intentionally cause an error
      throw new Error('This is an intentional frontend error for testing Sentry');
    } catch (error) {
      // Capture the error with Sentry
      Sentry.captureException(error, {
        tags: { source: 'frontend-test' },
        contexts: {
          test: {
            component: 'SentryTestPage',
            action: 'handleTriggerError',
          },
        },
      });

      // Show alert to user
      alert('Error captured! Check Sentry dashboard.');
    }
  };

  // Handler for testing API endpoint
  const handleTestApiEndpoint = async () => {
    setLoading(true);

    try {
      // Add a breadcrumb before the API call
      Sentry.addBreadcrumb({
        category: 'api',
        message: 'Making test API call',
        level: 'info',
      });

      const response = await fetch('/api/sentry-test');
      const data = await response.json();

      setApiResponse(JSON.stringify(data, null, 2));

      // Add breadcrumb for successful API call
      Sentry.addBreadcrumb({
        category: 'api',
        message: 'API call completed successfully',
        level: 'info',
        data: { status: data.status },
      });
    } catch (error) {
      // Capture the error with Sentry
      Sentry.captureException(error, {
        tags: { action: 'testApiEndpoint' },
      });

      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handler for testing API error endpoint
  const handleTestApiError = async () => {
    setLoading(true);

    try {
      // Add a breadcrumb before the API call
      Sentry.addBreadcrumb({
        category: 'api',
        message: 'Making test API error call',
        level: 'info',
      });

      const response = await fetch('/api/sentry-test', {
        method: 'POST',
      });
      const data = await response.json();

      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      // Capture the error with Sentry
      Sentry.captureException(error, {
        tags: { action: 'testApiError' },
      });

      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-4 max-w-3xl'>
      <h1 className='text-2xl font-bold mb-6'>Sentry Integration Test</h1>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Frontend Error Test</CardTitle>
            <CardDescription>Test Sentry's ability to capture frontend errors</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleTriggerError} variant='destructive'>
              Trigger Frontend Error
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Integration Test</CardTitle>
            <CardDescription>Test Sentry's API integration</CardDescription>
          </CardHeader>
          <CardFooter className='flex gap-4'>
            <Button onClick={handleTestApiEndpoint} disabled={loading}>
              {loading ? 'Loading...' : 'Test API Success'}
            </Button>
            <Button onClick={handleTestApiError} variant='outline' disabled={loading}>
              {loading ? 'Loading...' : 'Test API Error'}
            </Button>
          </CardFooter>
        </Card>

        {apiResponse && (
          <Card>
            <CardHeader>
              <CardTitle>API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className='bg-gray-100 p-4 rounded-md overflow-auto max-h-60'>{apiResponse}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
