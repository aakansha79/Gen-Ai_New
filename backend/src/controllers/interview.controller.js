const pdfParse = require("pdf-parse")
const {generateInterviewReport, generateResumePdf} = require("../services/ai.service")
const  interviewReportModel= require("../models/interviewReport.model")

function buildFallbackTitle(jobDescription = "") {
    const firstMeaningfulLine = jobDescription
        .split("\n")
        .map((line) => line.trim())
        .find(Boolean)

    if (!firstMeaningfulLine) {
        return "Target Role"
    }

    return firstMeaningfulLine.length > 80
        ? `${firstMeaningfulLine.slice(0, 77)}...`
        : firstMeaningfulLine
}

async function generateInterviewReportController(req,res){
    try {
        const { selfDescription = "", jobDescription = "" } = req.body

        if (!jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required"
            })
        }

        if (!req.file && !selfDescription.trim()) {
            return res.status(400).json({
                message: "Either resume or self description is required"
            })
        }

        let resumeText = ""

        if (req.file) {
            if (req.file.mimetype !== "application/pdf") {
                return res.status(400).json({
                    message: "Only PDF resumes are supported right now"
                })
            }

            const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
            resumeText = resumeContent.text || ""
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const reportTitle =
            interviewReportByAi?.title?.trim?.() ||
            buildFallbackTitle(jobDescription)

        const normalizedInterviewReport = {
            ...interviewReportByAi,
            title: reportTitle
        }

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...normalizedInterviewReport
        })

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        })
    } catch (error) {
        console.error("generateInterviewReportController error:", error)
        res.status(500).json({
            message: error.message || "Failed to generate interview report"
        })
    }
}

async function getInterviewReportController(req,res){
    const { id } = req.params

    if (!id) {
        return res.status(400).json({
            message: "Interview report id is required"
        })
    }

    const interviewReport = await interviewReportModel.findOne({_id: id, user: req.user.id})
    if(!interviewReport){
        return res.status(404).json({
            message: "interview report not found"
        })
    }
    res.status(200).json({
        message: "Interview report fetched successfully",
         interviewReport
    })
}

async function getAllInterviewReportsController(req,res){
    const interviewReports = await interviewReportModel
        .find({user: req.user.id})
        .sort({createdAt: -1})
        .select("-resume -selfDescription -jobDescription -__v")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}
async function generateResumePdfController(req,res){
    try {
        const {interviewReportId} = req.params

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        })

        if(!interviewReport){
            return res.status(404).json({
                message: "Interview report not found"
            })
        }
        const { resume, jobDescription, selfDescription} = interviewReport

        const pdfBuffer = await generateResumePdf({resume, selfDescription, jobDescription})
        res.set({
            "Content-Type": "application/pdf",
            "content-Disposition": `attachment; filename="${interviewReportId}.pdf"`
        })
        res.send(pdfBuffer)
    } catch (error) {
        console.error("generateResumePdfController error:", error)
        res.status(500).json({
            message: error.message || "Failed to generate resume PDF"
        })
    }
}


module.exports = { generateInterviewReportController, getInterviewReportController, getAllInterviewReportsController, generateResumePdfController }
