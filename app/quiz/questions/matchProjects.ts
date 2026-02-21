import { supabase } from '@/app/supabase'

type QuizAnswers = {
  selectedDieId?: number
  projectTypes: string[]
  mood: string
  machines: string[]
}

export async function matchProjects(answers: QuizAnswers) {
  // Fetch all projects from database
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
  
  if (error || !projects) {
    console.error('Error fetching projects:', error)
    return []
  }

  // Filter projects based on quiz answers
  let filteredProjects = projects.filter(project => {
    // 1. Check if project uses the selected die (if die was selected)
    if (answers.selectedDieId) {
      // Assuming project_dies table links projects to dies
      // We'll need to fetch this separately or join it
      // For now, we'll skip this filter until we set up the join
    }

    // 2. Filter by project type
    if (answers.projectTypes.length > 0 && !answers.projectTypes.includes('surprise')) {
      // Map quiz answers to database categories
      const categoryMap: { [key: string]: string } = {
        'gifts': 'Gifts',
        'home-decor': 'Home Decor',
        'kitchen': 'Kitchen',
        'baby-kids': 'Baby',
        'seasonal': 'Seasonal',
      }
      
      const selectedCategories = answers.projectTypes.map(type => categoryMap[type]).filter(Boolean)
      
      if (selectedCategories.length > 0) {
        // Check if project category matches any selected category
        const projectCategory = project.category
        if (!selectedCategories.includes(projectCategory)) {
          return false
        }
      }
    }

    // 3. Filter by stash buster
    if (answers.mood === 'stash-buster') {
      if (!project.is_stash_buster) {
        return false
      }
    }

    // 4. Filter by time estimate
    if (answers.mood === 'quick') {
      // Show only 4-6 hour projects
      if (!project.time_estimate?.includes('4-6')) {
        return false
      }
    } else if (answers.mood === 'take-time') {
      // Show 8-12 or 16-20 hour projects
      if (!project.time_estimate?.includes('8-12') && !project.time_estimate?.includes('16-20')) {
        return false
      }
    }

    // 5. Filter by machines
    if (answers.machines.length > 0) {
      // Map quiz answers to database machine names
      const machineMap: { [key: string]: string } = {
        'accuquilt': 'AccuQuilt',
        'embroidery': 'Embroidery',
        'scan-n-cut': 'Scan N Cut',
      }
      
      const userMachines = answers.machines.map(m => machineMap[m]).filter(Boolean)
      
      // Check if user has all required machines for this project
      const requiredMachines = project.machines_required?.split(',').map((m: string) => m.trim()) || []
      
      // User must have ALL machines that the project requires
      const hasAllMachines = requiredMachines.every((reqMachine: string) => 
        userMachines.includes(reqMachine)
      )
      
      if (!hasAllMachines) {
        return false
      }
    }

    return true
  })

  return filteredProjects
}