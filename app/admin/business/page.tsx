"use client";

import Link from "next/link";
import ProtectedBusiness from "@/components/business/protected-business";

export default function BusinessHome() {
  return (
    <ProtectedBusiness>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Business Hub</h1>
        <p className="text-muted-foreground mb-6">
          Access all Business Engines and tools for student startups.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
          <Link
            href="/admin/business/strategy"
            className="p-4 border rounded-lg hover:shadow"
          >
            Strategy Engine
          </Link>
          <Link
            href="/admin/business/product"
            className="p-4 border rounded-lg hover:shadow"
          >
            Product & Execution
          </Link>
          <Link
            href="/admin/business/revenue"
            className="p-4 border rounded-lg hover:shadow"
          >
            Revenue & Monetization
          </Link>
          <Link
            href="/admin/business/marketing"
            className="p-4 border rounded-lg hover:shadow"
          >
            Marketing & Growth
          </Link>
          <Link
            href="/admin/business/operations"
            className="p-4 border rounded-lg hover:shadow"
          >
            Operations & Systems
          </Link>
          <Link
            href="/admin/business/legal"
            className="p-4 border rounded-lg hover:shadow"
          >
            Legal & Risk
          </Link>
          <Link
            href="/admin/business/fundraising"
            className="p-4 border rounded-lg hover:shadow"
          >
            Investor & Fundraising
          </Link>
        </div>
      </div>
    </ProtectedBusiness>
  );
}
