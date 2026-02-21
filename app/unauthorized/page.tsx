'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground text-lg">
            You do not have permission to access this resource.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/login">
            <Button variant="outline">Back to Login</Button>
          </Link>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
