const API_BASE =
  "http://localhost:8000/interview-shortlisting"

export async function analyzeInterviewProbability(data) {

  try {

    let response

    // PDF upload
    if (data.pdfFile) {

      const formData = new FormData()

      formData.append(
        "resume_pdf",
        data.pdfFile
      )

      formData.append(
        "jd_text",
        data.jd_text
      )

      response = await fetch(
        `${API_BASE}/api/analyze`,
        {
          method: "POST",
          body: formData,
        }
      )

    } else {

      // Form mode
      response = await fetch(
        `${API_BASE}/api/analyze`,
        {
          method: "POST",

          headers: {
            "Content-Type":
            "application/json",
          },

          body: JSON.stringify({
            jd_text: data.jd_text,
            resume: data.resume,
          }),
        }
      )
    }

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error || "Analysis failed"
      )
    }

    return result

  } catch (err) {

    console.error(err)

    throw err
  }
}