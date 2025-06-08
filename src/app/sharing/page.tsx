"use client";

import AppLayout from "@/components/layout/app-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/lib/config"; // Import config for feature flags
import type { Meal } from "@/types";
import {
  ChevronRight,
  Construction,
  Eye,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const PROFILE_SHARED_EMAILS_KEY = "snapmeal_shared_emails";
// const LOGS_SHARED_WITH_ME_KEY = 'snapmeal_logs_shared_with_me_by_emails'; // Key for who shared with current user

// Mock sharer data
const MOCK_SHARERS = [
  {
    id: "nutritionist@demo.com",
    name: "Demo Nutritionist",
    mealStorageKey: "snapmeal_log_nutritionist@demo.com",
  },
  {
    id: "friend@demo.com",
    name: "Active Friend",
    mealStorageKey: "snapmeal_log_friend@demo.com",
  },
];

const generateMockMeals = (sharerId: string): Meal[] => {
  const today = new Date().getTime();
  const yesterday = new Date(today - 24 * 60 * 60 * 1000).getTime();
  return [
    {
      id: `${sharerId}-meal1-${crypto.randomUUID()}`,
      timestamp: today,
      photoDataUri: "https://placehold.co/400x225.png",
      estimatedCalories: 550,
      protein: 30,
      carbs: 60,
      fat: 20,
      mealType: "Lunch",
      notes: `Sample lunch for ${sharerId}.`,
      recognizedItems: ["Chicken Sandwich", "Apple Slices"],
    },
    {
      id: `${sharerId}-meal2-${crypto.randomUUID()}`,
      timestamp: yesterday,
      photoDataUri: "https://placehold.co/400x225.png",
      estimatedCalories: 300,
      protein: 15,
      carbs: 40,
      fat: 10,
      mealType: "Breakfast",
      notes: `Sample breakfast for ${sharerId}.`,
      recognizedItems: ["Oatmeal", "Berries"],
    },
  ];
};

export default function SharingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [sharedEmails, setSharedEmails] = useState<string[]>([]);
  const [logsSharedWithMe, setLogsSharedWithMe] = useState<typeof MOCK_SHARERS>(
    [],
  );

  useEffect(() => {
    if (!config.features.enableSharing) return;

    const storedSharedEmails = localStorage.getItem(PROFILE_SHARED_EMAILS_KEY);
    if (storedSharedEmails) {
      try {
        setSharedEmails(JSON.parse(storedSharedEmails));
      } catch (e) {
        console.error("Failed to parse shared emails from localStorage", e);
        setSharedEmails([]);
      }
    }

    setLogsSharedWithMe(MOCK_SHARERS);
    MOCK_SHARERS.forEach((sharer) => {
      if (!localStorage.getItem(sharer.mealStorageKey)) {
        localStorage.setItem(
          sharer.mealStorageKey,
          JSON.stringify(generateMockMeals(sharer.id)),
        );
      }
    });
  }, []);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendInvitation = () => {
    if (!isValidEmail(inviteEmail)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description:
          "Please enter a valid email address to send an invitation.",
      });
      return;
    }
    if (sharedEmails.includes(inviteEmail)) {
      toast({
        variant: "default",
        title: "Already Shared",
        description: `You are already sharing your meal log with ${inviteEmail}.`,
      });
      setInviteEmail("");
      return;
    }

    const updatedSharedEmails = [...sharedEmails, inviteEmail];
    setSharedEmails(updatedSharedEmails);
    localStorage.setItem(
      PROFILE_SHARED_EMAILS_KEY,
      JSON.stringify(updatedSharedEmails),
    );
    toast({
      title: "Invitation Sent (Mocked)",
      description: `An invitation to register for SnapMeal and view your log has been notionally sent to ${inviteEmail}. They have been added to your shared list.`,
    });
    setInviteEmail("");
  };

  const handleUnshareEmail = (emailToUnshare: string) => {
    const updatedSharedEmails = sharedEmails.filter(
      (email) => email !== emailToUnshare,
    );
    setSharedEmails(updatedSharedEmails);
    localStorage.setItem(
      PROFILE_SHARED_EMAILS_KEY,
      JSON.stringify(updatedSharedEmails),
    );
    toast({
      title: "Sharing Stopped (Mocked)",
      description: `You have stopped sharing your meal log with ${emailToUnshare}.`,
    });
  };

  if (!user) {
    return (
      <AppLayout>
        <p>Loading user data...</p>
      </AppLayout>
    );
  }

  if (!config.features.enableSharing) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 text-center">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-center text-xl">
                <Construction className="mr-3 h-8 w-8 text-primary" />
                Sharing Feature Not Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The meal log sharing functionality is currently under
                development and not available.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <Users className="mx-auto mb-4 h-16 w-16 text-primary" />
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Manage Sharing
          </h1>
          <p className="text-muted-foreground">
            Control who can view your meal logs and view logs shared with you.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Send className="mr-3 h-6 w-6 text-primary" />
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
                <h4 className="mb-2 text-md font-medium text-foreground">
                  Currently Sharing With:
                </h4>
                {sharedEmails.length > 0 ? (
                  <ul className="space-y-2">
                    {sharedEmails.map((email) => (
                      <li
                        key={email}
                        className="flex items-center justify-between rounded-md bg-muted/30 p-3"
                      >
                        <span className="text-sm text-foreground">{email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnshareEmail(email)}
                          title={`Stop sharing with ${email}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Unshare</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You haven&apos;t shared your meal log with anyone yet.
                  </p>
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
              <CardDescription>
                View meal logs that others have shared with you (mocked data).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsSharedWithMe.length > 0 ? (
                <ul className="space-y-3">
                  {logsSharedWithMe.map((sharer) => (
                    <li key={sharer.id}>
                      <Link href={`/view-shared-log/${sharer.id}`} passHref>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <span>
                            View {sharer.name}&apos;s Log ({sharer.id})
                          </span>
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No meal logs have been shared with you yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
