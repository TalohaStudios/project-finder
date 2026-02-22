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

  console.log('Total projects in database:', projects.length)
  console.log('Quiz answers:', answers)

  // Filter projects based on quiz answers
  let filteredProjects = projects.filter(project => {
    
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
      
      console.log('Selected categories from quiz:', selectedCategories)
      console.log(`Project "${project.title}" has categories:`, project.category, 'Type:', typeof project.category)
      
      if (selectedCategories.length > 0) {
        // Check if project category array includes any selected category
        const projectCategories = Array.isArray(project.category) ? project.category : []
        
        console.log(`Checking if ${JSON.stringify(projectCategories)} includes any of ${JSON.stringify(selectedCategories)}`)
        
        const hasMatchingCategory = selectedCategories.some(cat => projectCategories.includes(cat))
        
        console.log(`Has matching category: ${hasMatchingCategory}`)
        
        if (!hasMatchingCategory) {
          console.log(`Project "${project.title}" filtered out - category mismatch`)
          return false
        }
      }
    }

    // 3. Filter by stash buster
    if (answers.mood === 'stash-buster') {
      if (!project.is_stash_buster) {
        console.log(`Project "${project.title}" filtered out - not stash buster`)
        return false
      }
    }

    // 4. Filter by time estimate
    if (answers.mood === 'quick') {
      // Show only 4-6 hour projects
      if (!project.time_estimate?.includes('4-6')) {
        console.log(`Project "${project.title}" filtered out - time estimate doesn't match quick (${project.time_estimate})`)
        return false
      }
    } else if (answers.mood === 'take-time') {
      // Show 8-12 or 16-20 hour projects
      if (!project.time_estimate?.includes('8-12') && !project.time_estimate?.includes('16-20')) {
        console.log(`Project "${project.title}" filtered out - time estimate doesn't match take-time`)
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
      const requiredMachines = project.machines_required || []
      
      // User must have ALL machines that the project requires
      const hasAllMachines = requiredMachines.every((reqMachine: string) => 
        userMachines.includes(reqMachine)
      )
      
      if (!hasAllMachines) {
        console.log(`Project "${project.title}" filtered out - missing machines. Needs: ${requiredMachines.join(', ')}, Has: ${userMachines.join(', ')}`)
        return false
      }
    }

    console.log(`Project "${project.title}" PASSED all filters!`)
    return true
  })

  console.log(`Filtered projects: ${filteredProjects.length}`)
  return filteredProjects
}