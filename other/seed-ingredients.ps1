# Seed ingredients from CSV data
# Run from project root: .\seed-ingredients.ps1

$API = "http://localhost:3001/api/ingredients"

# FoodGroup map: Carnes->Protein, Harinas->Grain, Verduras->Vegetable,
#                Grasas->Fat, Frutas->Fruit, Lacteos->Dairy, Libre->null
# PortionUnit map: gramos->Grams, tazas->Cup, unidades/cdas/cdtas/rebanadas/cm/paquetes->Unit

$ingredients = @(
    @{ Name="Carne molida";             FoodGroup="Protein";    PortionUnit="Grams" },
    @{ Name="Masa tortilla";            FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Ensalada";                 FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Queso semiduro";           FoodGroup="Protein";    PortionUnit="Grams" },
    @{ Name="Huevo";                    FoodGroup="Protein";    PortionUnit="Unit"  },
    @{ Name="Espaguetti";               FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Salsa de hongos";          FoodGroup=$null;        PortionUnit="Cup"   },
    @{ Name="Pollo";                    FoodGroup="Protein";    PortionUnit="Grams" },
    @{ Name="Verduras cocidas";         FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Margarina";                FoodGroup="Fat";        PortionUnit="Unit"  },
    @{ Name="Salsa de tomate natural";  FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Cebolla y chile dulce";    FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Caracolitos cocidos";      FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Huevo duro";               FoodGroup="Protein";    PortionUnit="Unit"  },
    @{ Name="Atun";                     FoodGroup="Protein";    PortionUnit="Grams" },
    @{ Name="Aderezo light";            FoodGroup="Fat";        PortionUnit="Unit"  },
    @{ Name="Platano";                  FoodGroup="Grain";      PortionUnit="Unit"  },
    @{ Name="Verduras fritas";          FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Aceite";                   FoodGroup="Fat";        PortionUnit="Unit"  },
    @{ Name="Cebollino y perejil";      FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Jamon";                    FoodGroup="Protein";    PortionUnit="Unit"  },
    @{ Name="Tomate, Rabano, pepino";   FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Arroz";                    FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Frijoles blancos";         FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Costilla de cerdo";        FoodGroup="Protein";    PortionUnit="Grams" },
    @{ Name="Pico de gallo";            FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Zanahoria cocida";         FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Salchicha";                FoodGroup="Fat";        PortionUnit="Unit"  },
    @{ Name="Papa cocida";              FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Tortilla de harina";       FoodGroup="Grain";      PortionUnit="Unit"  },
    @{ Name="Carne desmechada";         FoodGroup="Protein";    PortionUnit="Grams" },
    @{ Name="Frutas";                   FoodGroup="Fruit";      PortionUnit="Cup"   },
    @{ Name="Avena";                    FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Leche";                    FoodGroup="Dairy";      PortionUnit="Cup"   },
    @{ Name="Yogurt griego";            FoodGroup="Dairy";      PortionUnit="Cup"   },
    @{ Name="Soda";                     FoodGroup="Grain";      PortionUnit="Unit"  },
    @{ Name="Pure de papa";             FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Margarina light";          FoodGroup="Fat";        PortionUnit="Unit"  },
    @{ Name="Tortilla horneada";        FoodGroup="Grain";      PortionUnit="Unit"  },
    @{ Name="Frijoles molidos";         FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Pan rallado";              FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Papas casera";             FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Zanahoria casera";         FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Queso mozzarella";         FoodGroup="Protein";    PortionUnit="Unit"  },
    @{ Name="Tortillas tostadas";       FoodGroup="Grain";      PortionUnit="Unit"  },
    @{ Name="Sopa de tortilla";         FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Repollo";                  FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Tomate";                   FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Zanahoria y vainica";      FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Tocineta";                 FoodGroup="Fat";        PortionUnit="Grams" },
    @{ Name="Cebollino";                FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Aderezo";                  FoodGroup="Fat";        PortionUnit="Unit"  },
    @{ Name="Cereal azucarado";         FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Pinto";                    FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Baguette";                 FoodGroup="Grain";      PortionUnit="Unit"  },
    @{ Name="Lechuga";                  FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Banano";                   FoodGroup="Fruit";      PortionUnit="Unit"  },
    @{ Name="Mantequilla de mani";      FoodGroup="Fat";        PortionUnit="Unit"  },
    @{ Name="Tomate cocido";            FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Granola";                  FoodGroup="Grain";      PortionUnit="Cup"   },
    @{ Name="Pan blanco";               FoodGroup="Grain";      PortionUnit="Unit"  },
    @{ Name="Espinaca";                 FoodGroup="Vegetable";  PortionUnit="Cup"   },
    @{ Name="Yogurt regular";           FoodGroup="Dairy";      PortionUnit="Cup"   }
)

$ok    = 0
$fail  = 0
$total = $ingredients.Count

foreach ($ing in $ingredients) {
    $body = @{
        Name        = $ing.Name
        InStock     = $false
        FoodGroup   = $ing.FoodGroup
        PortionUnit = $ing.PortionUnit
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri $API -Method POST -Body $body -ContentType "application/json" | Out-Null
        Write-Host "[$($ok + $fail + 1)/$total] OK  $($ing.Name)" -ForegroundColor Green
        $ok++
    } catch {
        Write-Host "[$($ok + $fail + 1)/$total] ERR $($ing.Name): $_" -ForegroundColor Red
        $fail++
    }
}

Write-Host ""
Write-Host "Done - $ok inserted, $fail failed." -ForegroundColor Cyan
