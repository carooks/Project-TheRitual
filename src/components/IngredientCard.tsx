import React from 'react'
import { Ingredient } from '@/lib/types'

export default function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  const isCorrupting = ingredient.corruptionValue > 0
  
  return (
    <div className={`ingredient-card ${isCorrupting ? 'ingredient-card--corrupt' : 'ingredient-card--pure'}`}>
      <div className="ingredient-card__icon-container">
        <div className="ingredient-card__icon">{ingredient.icon}</div>
      </div>
      <div className="ingredient-card__content">
        <h3 className="ingredient-card__name">{ingredient.name}</h3>
        <p className="ingredient-card__effect">{ingredient.effect}</p>
        <p className="ingredient-card__flavor">{ingredient.flavor}</p>
      </div>
      <div className="ingredient-card__corruption">
        {isCorrupting ? '+' : ''}{Math.round(ingredient.corruptionValue * 100)}%
      </div>
    </div>
  )
}
