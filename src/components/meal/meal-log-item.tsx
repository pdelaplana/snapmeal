import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Meal } from "@/types";
import {
  Beef,
  CalendarDays,
  Drumstick,
  Flame,
  Pencil,
  Wheat,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MealLogItemProps {
  meal: Meal;
}

export default function MealLogItem({ meal }: MealLogItemProps) {
  const displayValue = (value: number | null, unit = "", fixed = 0) => {
    return value != null ? `${value.toFixed(fixed)}${unit}` : "N/A";
  };

  let titleToDisplay: string;
  if (meal.mealType && meal.mealType.trim() !== "") {
    titleToDisplay = meal.mealType;
  } else {
    const mealDate = new Date(meal.timestamp);
    const hour = mealDate.getHours();
    if (hour >= 5 && hour < 12) {
      // 5:00 AM - 11:59 AM
      titleToDisplay = "Morning Meal";
    } else if (hour >= 12 && hour < 17) {
      // 12:00 PM - 4:59 PM
      titleToDisplay = "Afternoon Meal";
    } else if (hour >= 17 && hour < 22) {
      // 5:00 PM - 9:59 PM
      titleToDisplay = "Evening Meal";
    } else {
      // 10:00 PM - 4:59 AM
      titleToDisplay = "Night Meal";
    }
  }

  const mealDateTime = new Date(meal.timestamp);
  const formattedDate = mealDateTime.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = mealDateTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Card className="overflow-hidden shadow-lg transition-all hover:shadow-xl">
      <CardHeader className="relative p-0">
        {meal.photoDataUri && (
          <div className="aspect-video w-full overflow-hidden">
            <Image
              src={meal.photoDataUri}
              alt="Meal photo"
              width={400}
              height={225}
              className="object-cover"
              data-ai-hint="food meal"
            />
          </div>
        )}
        <Link href={`/edit-meal/${meal.id}`}>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-2 bg-background/70 hover:bg-background"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="mb-1">
          <h3 className="text-xl font-semibold text-foreground">
            {titleToDisplay}
          </h3>
        </div>

        <div className="mb-3 flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>{`${formattedDate}, ${formattedTime}`}</span>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {meal.estimatedCalories != null && (
            <div className="flex items-center">
              <Flame className="mr-2 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  {displayValue(meal.estimatedCalories)}
                </p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
            </div>
          )}
          {meal.protein != null && (
            <div className="flex items-center">
              <Beef className="mr-2 h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium">
                  {displayValue(meal.protein, "g", 1)}
                </p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
            </div>
          )}
          {meal.carbs != null && (
            <div className="flex items-center">
              <Wheat className="mr-2 h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">
                  {displayValue(meal.carbs, "g", 1)}
                </p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
            </div>
          )}
          {meal.fat != null && (
            <div className="flex items-center">
              <Drumstick className="mr-2 h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">{displayValue(meal.fat, "g", 1)}</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>
          )}
        </div>

        {meal.recognizedItems && meal.recognizedItems.length > 0 && (
          <div className="mb-3 space-y-1">
            <div className="flex flex-wrap gap-1.5">
              {meal.recognizedItems.map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {meal.notes && (
          <div className="mt-3">
            <p className="text-xs font-medium text-foreground">Notes:</p>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
              {meal.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
