const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface Ingredient {
  id: number;
  name: string;
  description?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  created_at: string;
  updated_at?: string;
}

export interface MealIngredientLine {
  amount_grams: number;
  ingredient: Ingredient;
}

export interface Meal {
  id: number;
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
  updated_at?: string;
  ingredients?: MealIngredientLine[];
}

export interface CreateMealRequest {
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: { ingredient_id: number; amount_grams: number }[];
}

export interface CreateIngredientRequest {
  name: string;
  description?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Fetch error for ${endpoint}:`, error);
      throw error;
    }
  }

  async getMeals(): Promise<Meal[]> {
    return this.request('/meals/');
  }

  async createMeal(meal: CreateMealRequest): Promise<Meal> {
    return this.request('/meals/', {
      method: 'POST',
      body: JSON.stringify(meal),
    });
  }

  async updateMeal(id: number, meal: CreateMealRequest): Promise<Meal> {
    return this.request(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meal),
    });
  }

  async deleteMeal(id: number): Promise<void> {
    await this.request(`/meals/${id}`, {
      method: 'DELETE',
    });
  }

  // Ingredient methods
  async getIngredients(): Promise<Ingredient[]> {
    return this.request('/ingredients/');
  }

  async getIngredient(id: number): Promise<Ingredient> {
    return this.request(`/ingredients/${id}`);
  }

  async createIngredient(ingredient: CreateIngredientRequest): Promise<Ingredient> {
    return this.request('/ingredients/', {
      method: 'POST',
      body: JSON.stringify(ingredient),
    });
  }

  async updateIngredient(id: number, ingredient: CreateIngredientRequest): Promise<Ingredient> {
    return this.request(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ingredient),
    });
  }

  async deleteIngredient(id: number): Promise<void> {
    await this.request(`/ingredients/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();