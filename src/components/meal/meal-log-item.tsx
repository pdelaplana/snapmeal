
import type { Meal } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarDays, Flame, Beef, Wheat, Drumstick, Pencil, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MealLogItemProps {
  meal: Meal;
}

export default function MealLogItem({ meal }: MealLogItemProps) {
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
          <Button asChild variant="outline" size="icon" className="absolute right-2 top-2 bg-background/70 hover:bg-background">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>{new Date(meal.timestamp).toLocaleDateString()} - {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {meal.mealType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {meal.mealType}
            </Badge>
          )}
        </div>
        
        <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="flex items-center">
            <Flame className="mr-2 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{meal.estimatedCalories.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
          </div>
          <div className="flex items-center">
            <Beef className="mr-2 h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium">{meal.protein.toFixed(1)}g</p>
              <p className="text-xs text-muted-foreground">Protein</p>
            </div>
          </div>
          <div className="flex items-center">
            <Wheat className="mr-2 h-5 w-5 text-yellow-500" />
            <div>
              <p className="font-medium">{meal.carbs.toFixed(1)}g</p>
              <p className="text-xs text-muted-foreground">Carbs</p>
            </div>
          </div>
          <div className="flex items-center">
            <Drumstick className="mr-2 h-5 w-5 text-orange-500" />
            <div>
              <p className="font-medium">{meal.fat.toFixed(1)}g</p>
              <p className="text-xs text-muted-foreground">Fat</p>
            </div>
          </div>
        </div>
        {meal.notes && (
          <div className="mt-3">
            <p className="text-xs font-medium text-foreground">Notes:</p>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{meal.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
