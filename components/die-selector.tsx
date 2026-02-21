"use client"

import { supabase } from '@/app/supabase'
import { useState, useRef, useEffect, useMemo } from "react"
import { Search, X, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Die {
  id: number
  name: string
  code: string
}

const DIE_REQUEST_EMAIL = "mailto:hello@talohastudios.com?subject=Die%20Request%20-%20Die%20Project%20Finder&body=Hi!%20I'd%20like%20to%20request%20this%20die:%0A%0ADie%20Name:%20%0ADie%20Code:%20%0A%0AThanks!"

export default function DieSelector({
  onSelect,
}: {
  onSelect?: (die: Die | null) => void
}) {
  const [search, setSearch] = useState("")
  const [selectedDie, setSelectedDie] = useState<Die | null>(null)
  const [dies, setDies] = useState<Die[]>([])
const [isLoading, setIsLoading] = useState(true)
useEffect(() => {
  async function fetchDies() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('accuquilt_dies')
      .select('id, name, code')
      .order('name', { ascending: true })
    
    if (data && !error) {
      setDies(data)
    }
    setIsLoading(false)
  }
  
  fetchDies()
}, [])
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const filteredDies = useMemo(() => {
    if (!search.trim()) return dies
    const query = search.toLowerCase().trim()
    return dies.filter(
      (die) =>
        die.name.toLowerCase().includes(query) ||
        die.code.toLowerCase().includes(query)
    )
  }, [search, dies])

  function handleSelect(die: Die) {
    const newSelection = selectedDie?.code === die.code ? null : die
    setSelectedDie(newSelection)
    onSelect?.(newSelection)
  }

  function handleClearSearch() {
    setSearch("")
    searchInputRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">Select Your Die</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Choose the die you want to find projects for
        </p>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search by die name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 pr-10 h-12 text-base"
          aria-label="Search dies"
        />
        {search && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {filteredDies.length}
          </span>{" "}
          {filteredDies.length === 1 ? "die" : "dies"} found
        </p>
        {selectedDie && (
          <p className="text-sm font-medium text-primary truncate max-w-48">
            Selected: {selectedDie.name}
          </p>
        )}
      </div>

      {/* Die List */}
      <div
        className="flex flex-col overflow-y-auto rounded-xl border border-border bg-card"
        style={{ maxHeight: "320px" }}
        role="listbox"
        aria-label="Die options"
      >
        {filteredDies.length > 0 ? (
        <>
            {filteredDies.map((die) => {
            const isSelected = selectedDie?.code === die.code
            return (
              <button
                key={die.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(die)}
                className={`flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-border last:border-b-0 cursor-pointer ${
                  isSelected
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-secondary text-card-foreground"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">
                    {die.name}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    Code: {die.code}
                  </span>
                </div>
                {isSelected && (
                  <Check className="h-5 w-5 text-primary shrink-0" />
                )}
              </button>
            )
          })}
          {/* Persistent footer link */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border px-4 py-2.5 text-center text-xs text-muted-foreground">
            {filteredDies.length} dies •{" "}
            <a 
              href={DIE_REQUEST_EMAIL}
              className="text-primary hover:underline font-medium"
            >
              Missing a die? Request it
            </a>
          </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-foreground">
                No dies found for "{search}"
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {"Try searching by name (e.g. 'strip') or code (e.g. '55018')"}
              </p>
            </div>
            
            {/* Die Request CTA */}
            <div className="bg-accent/50 border border-border rounded-lg p-4 max-w-md mt-2">
              <p className="text-sm font-medium mb-2">Can't find your die?</p>
              <a 
                href={DIE_REQUEST_EMAIL}
                className="text-primary hover:underline font-medium text-sm inline-flex items-center gap-1"
              >
                → Request it and I'll add it within 1-2 business days!
              </a>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSearch}
              className="mt-1 bg-transparent"
            >
              Clear Search
          
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}