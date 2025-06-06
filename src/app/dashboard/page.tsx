import AppLayout from "@/components/layout/app-layout";
import MealLogList from "@/components/meal/meal-log-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Your Meal Log
          </h1>
          <Link href="/add-meal">
            <Button variant="default" size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Meal
            </Button>
          </Link>
        </div>
        <MealLogList />
      </div>
    </AppLayout>
  );
}
