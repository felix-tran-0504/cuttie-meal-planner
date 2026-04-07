import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiService, Ingredient } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(ingredients.length / pageSize));
  const paginatedIngredients = ingredients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const fetchIngredients = async () => {
    try {
      setLoadingIngredients(true);
      const data = await apiService.getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoadingIngredients(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [ingredients]);

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true);
      await apiService.deleteIngredient(id);
      setIngredients((current) => current.filter((ingredient) => ingredient.id !== id));
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">Ingredients</h1>
          <p className="text-muted-foreground">
            Manage your ingredient database and nutrition values per 100g.
          </p>
        </div>

        <AddIngredientDialog onIngredientAdded={fetchIngredients}>
            <Button size="lg" className="rounded-xl">
              + Add Ingredient
            </Button>
          </AddIngredientDialog>
        </div>

        {loadingIngredients ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading ingredients...</p>
          </div>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-lg">No ingredients yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {paginatedIngredients.map((ingredient) => (
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
                      <p className="font-semibold">{ingredient.calories_per_100g}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Protein</p>
                      <p className="font-semibold">{ingredient.protein_per_100g}g</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Carbs</p>
                      <p className="font-semibold">{ingredient.carbs_per_100g}g</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Fat</p>
                      <p className="font-semibold">{ingredient.fat_per_100g}g</p>
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

        {ingredients.length > pageSize && (
          <Pagination className="mt-6">
            <PaginationPrevious
              onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
              aria-disabled={currentPage === 1}
              className={currentPage === 1 ? "opacity-50 pointer-events-none" : undefined}
            />
            <PaginationContent>
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber)}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
            </PaginationContent>
            <PaginationNext
              onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
              aria-disabled={currentPage === totalPages}
              className={currentPage === totalPages ? "opacity-50 pointer-events-none" : undefined}
            />
          </Pagination>
        )}

        <div className="flex justify-end">
          <Link to="/log" className="inline-flex items-center rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </div>
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
