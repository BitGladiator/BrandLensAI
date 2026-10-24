import React from 'react';
import { Finding } from '../types/review';

interface FindingFiltersProps {
  findings: Finding[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const FindingFilters: React.FC<FindingFiltersProps> = ({
  findings,
  selectedCategory,
  onSelectCategory,
}) => {
  // Extract unique categories present in the active findings
  const rawCategories = Array.from(new Set(findings.map((f) => f.category)));

  // Add any category from findings
  const allCategories = ['All'];
  if (findings.some((f) => f.category.toLowerCase().includes('term'))) {
    allCategories.push('Terminology');
  }
  if (findings.some((f) => f.category.toLowerCase().includes('tone') || f.category.toLowerCase().includes('voice'))) {
    allCategories.push('Tone');
  }
  if (findings.some((f) => f.category.toLowerCase().includes('claim') || f.category.toLowerCase().includes('fact'))) {
    allCategories.push('Claims & Facts');
  }

  // Include any other non-standard categories
  rawCategories.forEach((cat) => {
    const isStandard =
      cat.toLowerCase().includes('term') ||
      cat.toLowerCase().includes('tone') ||
      cat.toLowerCase().includes('voice') ||
      cat.toLowerCase().includes('claim') ||
      cat.toLowerCase().includes('fact');
    if (!isStandard && !allCategories.includes(cat)) {
      allCategories.push(cat);
    }
  });

  const getCount = (cat: string) => {
    if (cat === 'All') return findings.length;
    if (cat === 'Terminology') {
      return findings.filter((f) => f.category.toLowerCase().includes('term')).length;
    }
    if (cat === 'Tone') {
      return findings.filter((f) => f.category.toLowerCase().includes('tone') || f.category.toLowerCase().includes('voice')).length;
    }
    if (cat === 'Claims & Facts') {
      return findings.filter((f) => f.category.toLowerCase().includes('claim') || f.category.toLowerCase().includes('fact')).length;
    }
    return findings.filter((f) => f.category === cat).length;
  };

  return (
    <div className="filter-tabs" role="tablist" aria-label="Finding category filters">
      {allCategories.map((cat) => {
        const count = getCount(cat);
        const isActive = selectedCategory === cat;
        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`filter-tab ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            <span>{cat}</span>
            <span className="filter-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
};
