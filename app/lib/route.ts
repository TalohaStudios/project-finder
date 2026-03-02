export async function trackEvent(eventType: string, eventData?: any) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        eventData
      })
    })
  } catch (error) {
    // Silently fail - don't break user experience
    console.error('Analytics tracking failed:', error)
  }
}