import { useEffect, useState } from "react";
import { apiService, Ingredient } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddIngredientDialog } from "@/components/AddIngredientDialog";

export function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true);
      await apiService.deleteIngredient(id);
      setIngredients(ingredients.filter((ing) => ing.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete ingredient:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Ingredients</h1>
            <p className="text-muted-foreground mt-2">
              Manage your ingredient database ({ingredients.length} total)
            </p>
          </div>
          <AddIngredientDialog onIngredientAdded={fetchIngredients}>
            <Button size="lg">+ Add Ingredient</Button>
          </AddIngredientDialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Loading ingredients...</p>
          </div>
        ) : ingredients.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground text-lg">No ingredients yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {ingredients.map((ingredient) => (
              <Card key={ingredient.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                  {ingredient.description && (
                    <CardDescription className="text-sm">
                      {ingredient.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 pb-3">
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Calories</p>
                      <p className="font-semibold">
                        {ingredient.calories_per_100g}
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Protein</p>
                      <p className="font-semibold">
                        {ingredient.protein_per_100g}g
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Carbs</p>
                      <p className="font-semibold">
                        {ingredient.carbs_per_100g}g
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Fat</p>
                      <p className="font-semibold">
                        {ingredient.fat_per_100g}g
                      </p>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 py-3 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(ingredient.id)}
                    className="w-full"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ingredient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ingredient? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteId && handleDelete(deleteId)}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
