import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { mealsQueryKey } from "@/lib/queryKeys";

export function MealDeleteButton({
  mealId,
  mealName,
  className,
}: {
  mealId: number;
  mealName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => apiService.deleteMeal(mealId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mealsQueryKey });
      toast.success(`Removed “${mealName}”`);
      setOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not delete meal");
    },
  });

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={className ?? "h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"}
        aria-label={`Delete ${mealName}`}
        disabled={mutation.isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="z-[100]" onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete meal?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove “{mealName}” from your log. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={mutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                mutation.mutate();
              }}
            >
              {mutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
