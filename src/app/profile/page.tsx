
"use client";

import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/context/auth-context";
import { useMealLog } from "@/context/meal-log-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCircle, Settings, BarChart3, ChevronRight, Palette, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useMemo } from "react";
import { format, differenceInCalendarDays, startOfDay } from "date-fns";

export default function ProfilePage() {
  const { user } = useAuth();
  const { meals } = useMealLog();

  const totalMealsLogged = meals.length;

  const averageDailyCaloriesLast7Days = useMemo(() => {
    const sevenDaysAgo = startOfDay(new Date(new Date().setDate(new Date().getDate() - 6)));
    const recentMeals = meals.filter(meal => new Date(meal.timestamp) >= sevenDaysAgo);
    
    if (recentMeals.length === 0) return 0;

    const calorieSum = recentMeals.reduce((sum, meal) => sum + (meal.estimatedCalories ?? 0), 0);
    
    // Calculate unique days within the last 7 days that have meals
    const uniqueDaysWithMeals = new Set(recentMeals.map(meal => format(new Date(meal.timestamp), 'yyyy-MM-dd'))).size;

    return uniqueDaysWithMeals > 0 ? calorieSum / uniqueDaysWithMeals : 0;
  }, [meals]);

  if (!user) {
    return <AppLayout><p>Loading user data...</p></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <UserCircle className="mx-auto mb-4 h-20 w-20 text-primary" />
          <h1 className="font-headline text-3xl font-bold text-foreground">Your Profile</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <div className="space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BarChart3 className="mr-3 h-6 w-6 text-primary" />
                Activity Snapshot
              </CardTitle>
              <CardDescription>A quick look at your meal logging activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <p className="font-medium text-foreground">Total Meals Logged</p>
                <p className="text-lg font-bold text-primary">{totalMealsLogged}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <p className="font-medium text-foreground">Avg. Daily Calories (Last 7 Days)</p>
                <p className="text-lg font-bold text-primary">{averageDailyCaloriesLast7Days.toFixed(0)} kcal</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Palette className="mr-3 h-6 w-6 text-primary" />
                Preferences
              </CardTitle>
              <CardDescription>Customize your app experience (coming soon).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/30">
                  <span>Theme (e.g., Light/Dark)</span>
                  <span className="text-xs">Not available</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/30">
                  <span>Notification Settings</span>
                  <span className="text-xs">Not available</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center text-xl">
                    <Settings className="mr-3 h-6 w-6 text-primary"/>
                    Account Settings
                </CardTitle>
                <CardDescription>Manage your account details and security.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Link href="/account">
                    <Button variant="outline" className="w-full justify-between">
                        <span>Go to Account Management</span>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                 </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
