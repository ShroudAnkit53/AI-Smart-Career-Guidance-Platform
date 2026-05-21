const API_BASE =
  "http://localhost:8000/skill-gap"

export async function analyzeSkills(data) {

  try {

    const response = await fetch(
      `${API_BASE}/api/analyze`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(data),
      }
    )

    const result =
      await response.json()

    if (!response.ok) {

      throw new Error(
        result.error ||
        "Skill gap analysis failed"
      )
    }

    return result

  } catch (error) {

    console.error(
      "Skill Gap API Error:",
      error
    )

    throw error
  }
}

export async function getJobTitles() {
  try {
    const response = await fetch(`${API_BASE}/api/job-titles`)
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || "Failed to load job titles")
    }
    return result
  } catch (error) {
    console.error("Skill Gap API Error:", error)
    throw error
  }
}

export async function getSkillGapHealth() {

  const response = await fetch(
      `${API_BASE}/api/health`
  )

  return await response.json()
}