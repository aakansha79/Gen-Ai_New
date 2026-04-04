const  {GoogleGenAI} =require ("@google/genai")
const { z } = require("zod")
const {zodToJsonSchema} = require ("zod-to-json-schema")
const puppeteer = require("puppeteer")
 
const apiKey =
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env["GOOGLE_GENAI_API_KEY "] ||
    process.env.GOOGLE_API_KEY

const ai  = new GoogleGenAI({
    apiKey
})

const textModel = "gemini-2.5-flash"

const interviewReportSchema= z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidat's profile match the job describe"),

    technicalQuestion: z.array(z.object({
        question: z.string().describe("The technicl question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical question that can be asked in the interviewalong with their intention and how to answer them "),
    behaviouralQuestion: z.array(z.object({
        question: z.string().describe("The technicl question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")

    })).describe("Behavioral question that can be asked in the interview along with the intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe(" The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap , i.e how important it is "),
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, e.g from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, systen design, mock interview"),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g read a specific book"),

    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

function inferTitle(jobDescription = "") {
    const lines = jobDescription
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)

    const firstLine = lines[0] || "Target Role"
    return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine
}

function inferSkills(jobDescription = "") {
    const normalized = jobDescription.toLowerCase()
    const candidates = [
        "javascript",
        "typescript",
        "react",
        "node.js",
        "node",
        "express",
        "mongodb",
        "sql",
        "python",
        "java",
        "system design",
        "data structures",
        "algorithms",
        "aws",
        "docker",
        "kubernetes",
        "redis",
        "communication"
    ]

    return candidates.filter((skill) => normalized.includes(skill)).slice(0, 4)
}

function buildFallbackInterviewReport({ resume = "", selfDescription = "", jobDescription = "" }) {
    const highlightedSkills = inferSkills(jobDescription)
    const combinedProfile = `${resume}\n${selfDescription}`.toLowerCase()
    const missingSkills = highlightedSkills.filter((skill) => !combinedProfile.includes(skill.toLowerCase()))

    return {
        matchScore: missingSkills.length === 0 ? 78 : Math.max(45, 78 - missingSkills.length * 8),
        technicalQuestion: [
            {
                question: "Walk me through a project from your resume that best matches this role.",
                intention: "The interviewer wants to connect your real experience to the target job.",
                answer: "Explain the project context, your contribution, the stack you used, and the measurable result."
            },
            {
                question: "Which technical decisions did you make, and why?",
                intention: "This checks ownership, depth, and engineering judgment.",
                answer: "Discuss tradeoffs, alternatives you considered, and why your final choice fit the project."
            }
        ],
        behaviouralQuestion: [
            {
                question: "Tell me about a time you handled a difficult challenge during a project.",
                intention: "This evaluates problem solving, ownership, and communication.",
                answer: "Use STAR format and focus on your actions, decisions, and the final outcome."
            },
            {
                question: "How do you learn a new tool or concept quickly when a role demands it?",
                intention: "This checks adaptability and self-driven learning.",
                answer: "Mention your learning process, how you validate understanding, and an example where you applied it."
            }
        ],
        skillGaps: (missingSkills.length > 0 ? missingSkills : ["system design", "communication"]).slice(0, 3).map((skill) => ({
            skill,
            severity: "medium"
        })),
        preparationPlan: [
            {
                day: 1,
                focus: "Understand the role requirements",
                tasks: ["Review the job description carefully", "Map your projects to role expectations"]
            },
            {
                day: 2,
                focus: "Strengthen project storytelling",
                tasks: ["Prepare 2 strong project explanations", "Practice impact-focused answers"]
            },
            {
                day: 3,
                focus: "Interview practice",
                tasks: ["Practice technical questions", "Prepare behavioral STAR answers"]
            }
        ],
        title: inferTitle(jobDescription)
    }
}

function mergeInterviewReportWithFallback(parsedReport = {}, source = {}) {
    const fallback = buildFallbackInterviewReport(source)

    return {
        ...fallback,
        ...parsedReport,
        title: parsedReport?.title?.trim?.() || fallback.title,
        matchScore:
            typeof parsedReport?.matchScore === "number"
                ? parsedReport.matchScore
                : fallback.matchScore,
        technicalQuestion:
            Array.isArray(parsedReport?.technicalQuestion) && parsedReport.technicalQuestion.length > 0
                ? parsedReport.technicalQuestion
                : fallback.technicalQuestion,
        behaviouralQuestion:
            Array.isArray(parsedReport?.behaviouralQuestion) && parsedReport.behaviouralQuestion.length > 0
                ? parsedReport.behaviouralQuestion
                : fallback.behaviouralQuestion,
        skillGaps:
            Array.isArray(parsedReport?.skillGaps) && parsedReport.skillGaps.length > 0
                ? parsedReport.skillGaps
                : fallback.skillGaps,
        preparationPlan:
            Array.isArray(parsedReport?.preparationPlan) && parsedReport.preparationPlan.length > 0
                ? parsedReport.preparationPlan
                : fallback.preparationPlan
    }
}

function buildFallbackResumeHtml({ resume = "", selfDescription = "", jobDescription = "" }) {
    const title = inferTitle(jobDescription)
    const summary = selfDescription || "Candidate profile tailored for the target role."
    const resumePoints = resume
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 12)
        .map((line) => `<li>${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</li>`)
        .join("")

    return `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
                    h1 { margin: 0 0 8px; font-size: 28px; }
                    h2 { margin-top: 24px; font-size: 18px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
                    p, li { font-size: 14px; line-height: 1.6; }
                    ul { padding-left: 18px; }
                    .muted { color: #6b7280; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <p class="muted">Tailored resume draft generated for the selected role</p>
                <h2>Professional Summary</h2>
                <p>${summary.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                <h2>Relevant Background</h2>
                <ul>${resumePoints || "<li>Add your strongest project and experience details here.</li>"}</ul>
                <h2>Target Role Focus</h2>
                <p>${jobDescription.replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 1200)}</p>
            </body>
        </html>
    `
}

async function generateInterviewReport({resume, selfDescription, jobDescription}){
    if (!apiKey) {
        return buildFallbackInterviewReport({ resume, selfDescription, jobDescription })
    }

    const prompt= `Generate an interview report for a candidate with the following details:
                    Resume:${resume}
                    Self describe:${selfDescription}
                    Job describe:${jobDescription} `
    try {
        const  response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config:{
                responseMimeType: "application/json",
                responseJsonSchema: zodToJsonSchema(interviewReportSchema)
            }
        })

        const parsed = JSON.parse(response.text)
        return mergeInterviewReportWithFallback({
            ...parsed,
            behaviouralQuestion: parsed.behaviouralQuestion || parsed.behaviourQuestions || []
        }, { resume, selfDescription, jobDescription })
    } catch (error) {
        console.error("AI interview generation failed, using fallback:", error.message)
        return buildFallbackInterviewReport({ resume, selfDescription, jobDescription })
    }
}
async function generatePdfFromHtml(htmlContent){
    const browser = await puppeteer.launch({
        headless: true
    })
    const page = await browser.newPage();
    await page.setContent(htmlContent, {waitUntil: "networkidle0"})

    const pdfBuffer = await page.pdf({
        format: "A4",})
        await browser.close()
        return pdfBuffer
    }

async function generateResumePdf({resume, selfDescription, jobDescription}) {
    if (!apiKey) {
        return generatePdfFromHtml(buildFallbackResumeHtml({ resume, selfDescription, jobDescription }))
    }

    const resumePdfSchema = z.object({
        html:z.string().describe("he HTML content of the resume which can be convert to PDF using aany library like puppeteer")
    })
    const prompt = `Generate resume PDF for a candidate with the following details:
                    Resume:${resume}
                    Self describe:${selfDescription}
                    Job describe:${jobDescription}
                    the response should be in JSON formate with a single field "html" which contains the HTML content of the resume which can be convert to PDF using any Library like puppeteer
                    The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visible pdf
                    The content of resume should be not sound like it's generated by AI and should  be as close as possible to a human-written resume.
                    You can highlight the content using some colors or different font size but the overall design should be simple and professional.
                    The content should be ATS friendly, i.e. it should be easly parsable by ATS sysyem without losing important information.
                    The resume shhould not be lengthy, it should ideally be 1-2 pages long when convert to PDF. focus on quality rather than quantity and make sure to include all the relevent information that can be increase the candidate's chances of getting an interview call for the given job description.
                    `

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config:{
                responseMimeType: "application/json",
                responseJsonSchema: zodToJsonSchema(resumePdfSchema)
            }
        })
        const JsonContent = JSON.parse(response.text)
        const pdfBuffer = await generatePdfFromHtml(JsonContent.html)
        return pdfBuffer
    } catch (error) {
        console.error("AI resume generation failed, using fallback:", error.message)
        return generatePdfFromHtml(buildFallbackResumeHtml({ resume, selfDescription, jobDescription }))
    }
}


module.exports = {generateInterviewReport, generateResumePdf}
