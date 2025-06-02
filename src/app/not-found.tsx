'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          {/* Main Message */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-800">
              We're Sorry!
            </h2>
            <div className="space-y-3">
              <p className="text-slate-600 leading-relaxed">
                We sincerely apologize for the inconvenience. The page you're
                looking for seems to have moved or no longer exists.
              </p>
              <p className="text-slate-600 leading-relaxed">
                We understand how frustrating this can be, and we're working
                hard to ensure this doesn't happen again.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotFoundPage;
