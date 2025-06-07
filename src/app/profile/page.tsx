
"use client";

import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/context/auth-context";
import { useMealLog } from "@/context/meal-log-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Settings, BarChart3, ChevronRight, Palette, Camera, Edit2, Send, Trash2, Users, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo, useEffect, useCallback } from "react";
import { format, startOfDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MealCapture from "@/components/meal/meal-capture";
import { useToast } from "@/hooks/use-toast";
import type { Meal } from "@/types";

const PROFILE_PHOTO_STORAGE_KEY = 'snapmeal_profile_photo_uri';
const PROFILE_SHARED_EMAILS_KEY = 'snapmeal_shared_emails';
const LOGS_SHARED_WITH_ME_KEY = 'snapmeal_logs_shared_with_me_by_emails'; // Key for who shared with current user

// Mock sharer data
const MOCK_SHARERS = [
  { id: 'nutritionist@demo.com', name: 'Demo Nutritionist', mealStorageKey: 'snapmeal_log_nutritionist@demo.com' },
  { id: 'friend@demo.com', name: 'Active Friend', mealStorageKey: 'snapmeal_log_friend@demo.com' },
];

const generateMockMeals = (sharerId: string): Meal[] => {
  const today = new Date().getTime();
  const yesterday = new Date(today - 24 * 60 * 60 * 1000).getTime();
  return [
    {
      id: `${sharerId}-meal1-${crypto.randomUUID()}`,
      timestamp: today,
      photoDataUri: 'https://placehold.co/400x225.png',
      estimatedCalories: 550,
      protein: 30,
      carbs: 60,
      fat: 20,
      mealType: 'Lunch',
      notes: `Sample lunch for ${sharerId}.`,
      recognizedItems: ['Chicken Sandwich', 'Apple Slices'],
    },
    {
      id: `${sharerId}-meal2-${crypto.randomUUID()}`,
      timestamp: yesterday,
      photoDataUri: 'https://placehold.co/400x225.png',
      estimatedCalories: 300,
      protein: 15,
      carbs: 40,
      fat: 10,
      mealType: 'Breakfast',
      notes: `Sample breakfast for ${sharerId}.`,
      recognizedItems: ['Oatmeal', 'Berries'],
    },
  ];
};


export default function ProfilePage() {
  const { user } = useAuth();
  const { meals } = useMealLog();
  const { toast } = useToast();
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sharedEmails, setSharedEmails] = useState<string[]>([]);
  const [logsSharedWithMe, setLogsSharedWithMe] = useState<typeof MOCK_SHARERS>([]);


  useEffect(() => {
    const storedPhotoUri = localStorage.getItem(PROFILE_PHOTO_STORAGE_KEY);
    if (storedPhotoUri) {
      setProfilePhotoUri(storedPhotoUri);
    }
    const storedSharedEmails = localStorage.getItem(PROFILE_SHARED_EMAILS_KEY);
    if (storedSharedEmails) {
      try {
        setSharedEmails(JSON.parse(storedSharedEmails));
      } catch (e) {
        console.error("Failed to parse shared emails from localStorage", e);
        setSharedEmails([]);
      }
    }

    // Simulate fetching list of who shared with current user & pre-populate their data if needed
    // In a real app, this list would come from a backend.
    setLogsSharedWithMe(MOCK_SHARERS); 
    MOCK_SHARERS.forEach(sharer => {
      if (!localStorage.getItem(sharer.mealStorageKey)) {
        localStorage.setItem(sharer.mealStorageKey, JSON.stringify(generateMockMeals(sharer.id)));
        console.log(`Pre-populated mock meals for ${sharer.id} in localStorage.`);
      }
    });

  }, []);

  const handleProfilePhotoCaptured = useCallback((dataUri: string) => {
    if (dataUri) {
      setProfilePhotoUri(dataUri);
      localStorage.setItem(PROFILE_PHOTO_STORAGE_KEY, dataUri);
    } else {
      setProfilePhotoUri(null);
      localStorage.removeItem(PROFILE_PHOTO_STORAGE_KEY);
    }
  }, []);
  
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "?";
  const totalMealsLogged = meals.length;

  const averageDailyCaloriesLast7Days = useMemo(() => {
    const sevenDaysAgo = startOfDay(new Date(new Date().setDate(new Date().getDate() - 6)));
    const recentMeals = meals.filter(meal => new Date(meal.timestamp) >= sevenDaysAgo);
    
    if (recentMeals.length === 0) return 0;

    const calorieSum = recentMeals.reduce((sum, meal) => sum + (meal.estimatedCalories ?? 0), 0);
    const uniqueDaysWithMeals = new Set(recentMeals.map(meal => format(new Date(meal.timestamp), 'yyyy-MM-dd'))).size;

    return uniqueDaysWithMeals > 0 ? calorieSum / uniqueDaysWithMeals : 0;
  }, [meals]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendInvitation = () => {
    if (!isValidEmail(inviteEmail)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address to send an invitation.",
      });
      return;
    }
    if (sharedEmails.includes(inviteEmail)) {
      toast({
        variant: "default",
        title: "Already Shared",
        description: `You are already sharing your meal log with ${inviteEmail}.`,
      });
      setInviteEmail('');
      return;
    }

    const updatedSharedEmails = [...sharedEmails, inviteEmail];
    setSharedEmails(updatedSharedEmails);
    localStorage.setItem(PROFILE_SHARED_EMAILS_KEY, JSON.stringify(updatedSharedEmails));
    toast({
      title: "Invitation Sent (Mocked)",
      description: `An invitation to register for SnapMeal and view your log has been notionally sent to ${inviteEmail}. They have been added to your shared list.`,
    });
    setInviteEmail('');
  };

  const handleUnshareEmail = (emailToUnshare: string) => {
    const updatedSharedEmails = sharedEmails.filter(email => email !== emailToUnshare);
    setSharedEmails(updatedSharedEmails);
    localStorage.setItem(PROFILE_SHARED_EMAILS_KEY, JSON.stringify(updatedSharedEmails));
    toast({
      title: "Sharing Stopped (Mocked)",
      description: `You have stopped sharing your meal log with ${emailToUnshare}.`,
    });
  };


  if (!user) {
    return <AppLayout><p>Loading user data...</p></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <Avatar className="mx-auto mb-4 h-24 w-24 text-3xl">
            <AvatarImage src={profilePhotoUri || undefined} alt={user.email || "User"} data-ai-hint="person portrait"/>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <h1 className="font-headline text-3xl font-bold text-foreground">Your Profile</h1>
          <p className="text-muted-foreground">{user.email}</p>
          {!isEditingPhoto && (
            <Button onClick={() => setIsEditingPhoto(true)} variant="outline" className="mt-4">
              <Edit2 className="mr-2 h-4 w-4" />
              Change Profile Photo
            </Button>
          )}
        </div>

        <div className="space-y-8">
          {isEditingPhoto && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Camera className="mr-3 h-6 w-6 text-primary" />
                  Update Profile Photo
                </CardTitle>
                <CardDescription>Upload an image or take a new one with your camera.</CardDescription>
              </CardHeader>
              <CardContent>
                <MealCapture 
                  onPhotoCaptured={handleProfilePhotoCaptured} 
                  initialPhotoDataUri={profilePhotoUri}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Note: Labels in the photo capture tool might refer to "meal photo". This tool is reused for profile picture functionality.
                </p>
                <Button onClick={() => setIsEditingPhoto(false)} variant="default" className="mt-4 w-full">
                  Done Editing Photo
                </Button>
              </CardContent>
            </Card>
          )}

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
                <Users className="mr-3 h-6 w-6 text-primary" />
                Share Your Meal Log
              </CardTitle>
              <CardDescription>
                Invite someone (e.g., your nutritionist) to view your meal log. 
                They will receive a (mocked) email to register for SnapMeal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="inviteEmail">Recipient&apos;s Email</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="nutritionist@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleSendInvitation} 
                className="w-full"
                disabled={!isValidEmail(inviteEmail) || !inviteEmail.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>

              <Separator />
              <div>
                <h4 className="mb-2 text-md font-medium text-foreground">Currently Sharing With:</h4>
                {sharedEmails.length > 0 ? (
                  <ul className="space-y-2">
                    {sharedEmails.map((email) => (
                      <li key={email} className="flex items-center justify-between rounded-md bg-muted/30 p-3">
                        <span className="text-sm text-foreground">{email}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleUnshareEmail(email)} title={`Stop sharing with ${email}`}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Unshare</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">You haven&apos;t shared your meal log with anyone yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Eye className="mr-3 h-6 w-6 text-primary" />
                Meal Logs Shared With You
              </CardTitle>
              <CardDescription>View meal logs that others have shared with you (mocked data).</CardDescription>
            </CardHeader>
            <CardContent>
              {logsSharedWithMe.length > 0 ? (
                <ul className="space-y-3">
                  {logsSharedWithMe.map((sharer) => (
                    <li key={sharer.id}>
                      <Link href={`/view-shared-log/${sharer.id}`} passHref>
                        <Button variant="outline" className="w-full justify-between">
                          <span>View {sharer.name}&apos;s Log ({sharer.id})</span>
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No meal logs have been shared with you yet.</p>
              )}
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
    

    