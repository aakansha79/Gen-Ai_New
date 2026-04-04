const mongoose = require("mongoose")
const { PDFParse } = require("pdf-parse")
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

            const parser = new PDFParse({ data: req.file.buffer })

            try {
                const resumeContent = await parser.getText()
                resumeText = resumeContent.text || ""
            } finally {
                await parser.destroy()
            }
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
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: "Interview report id is required"
            })
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid interview report id"
            })
        }

        const interviewReport = await interviewReportModel.findOne({ _id: id, user: req.user.id })
        if(!interviewReport){
            return res.status(404).json({
                message: "Interview report not found"
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully",
            interviewReport
        })
    } catch (error) {
        console.error("getInterviewReportController error:", error)
        res.status(500).json({
            message: error.message || "Failed to fetch interview report"
        })
    }
}

async function getAllInterviewReportsController(req,res){
    try {
        const interviewReports = await interviewReportModel
            .find({user: req.user.id})
            .sort({createdAt: -1})
            .select("-resume -selfDescription -jobDescription -__v")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (error) {
        console.error("getAllInterviewReportsController error:", error)
        res.status(500).json({
            message: error.message || "Failed to fetch interview reports"
        })
    }
}
async function generateResumePdfController(req,res){
    try {
        const {interviewReportId} = req.params

        if (!mongoose.Types.ObjectId.isValid(interviewReportId)) {
            return res.status(400).json({
                message: "Invalid interview report id"
            })
        }

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
            "Content-Disposition": `attachment; filename="${interviewReportId}.pdf"`
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
