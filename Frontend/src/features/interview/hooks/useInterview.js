import { useCallback, useState } from 'react'
import {
    generateInterviewReport,
    getInterviewReportById,
    getAllInterviewsReports,
    generateResumePdf
} from '../services/interviewservice'

/**
 * HOOK LAYER - useInterview
 * 
 * This custom hook manages interview form state and logic.
 * It bridges between the UI layer (presentation) and state/API layers (business logic).
 * 
 * Responsibilities:
 * - Manage form data state
 * - Handle form input changes
 * - Handle file uploads with validation
 * - Call API to generate interview report
 * - Manage loading and error states
 * - Handle drag and drop
 */
export const useInterview = () => {
    const getErrorMessage = (err, fallbackMessage) =>
        err?.response?.data?.message ||
        err?.message ||
        fallbackMessage

    const [formData, setFormData] = useState({
        jobDescription: '',
        resumeFile: null,
        selfDescription: ''
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])
    const [downloadingPdf, setDownloadingPdf] = useState(false)

    /**
     * Calculate character count for job description and self description
     */
    const charCount = formData.jobDescription.length
    const selfDescriptionCharCount = formData.selfDescription.length

    /**
     * Handle text input changes
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError(null) // Clear error when user starts typing
    }

    /**
     * Validate file before upload
     */
    const validateFile = (file) => {
        const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
        const ALLOWED_TYPES = ['application/pdf']

        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 5MB')
            return false
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Only PDF files are supported right now')
            return false
        }

        return true
    }

    /**
     * Handle file upload - accepts both File objects and events
     */
    const handleFileUpload = (fileOrEvent) => {
        let file = fileOrEvent
        
        // If it's an event object, extract the file
        if (fileOrEvent?.target?.files) {
            file = fileOrEvent.target.files[0]
        }
        
        if (file) {
            if (validateFile(file)) {
                setFormData(prev => ({
                    ...prev,
                    resumeFile: file
                }))
                setError(null)
            }
        }
    }

    /**
     * Handle drag and drop with improved logic to prevent flickering
     */
    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            // Only set to false if leaving the drop zone completely
            if (e.target.classList && e.target.classList.contains('file-upload-area')) {
                setDragActive(false)
            }
        }
    }

    /**
     * Handle drop event with file validation
     */
    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const file = e.dataTransfer?.files?.[0]
        if (file) {
            if (validateFile(file)) {
                setFormData(prev => ({
                    ...prev,
                    resumeFile: file
                }))
                setError(null)
            }
        }
    }

    /**
     * Handle generate interview report
     * TODO: Connect to API layer for actual implementation
     */
    const handleGenerateReport = useCallback(async () => {
        // Validation
        if (!formData.jobDescription.trim()) {
            setError('Job description is required')
            return null
        }

        if (!formData.resumeFile && !formData.selfDescription.trim()) {
            setError('Either a resume or self description is required')
            return null
        }

        setLoading(true)
        setError(null)

        try {
            const response = await generateInterviewReport(formData)
            setReport(response?.interviewReport || response || null)
            return response
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to generate report'))
            return null
        } finally {
            setLoading(false)
        }
    }, [formData])

    /**
     * Reset form to initial state
     */
    const resetForm = () => {
        setFormData({
            jobDescription: '',
            resumeFile: null,
            selfDescription: ''
        })
        setError(null)
    }

    /**
     * Fetch interview report by ID
     */
    const getReportById = useCallback(async (interviewId) => {
        setLoading(true)
        setError(null)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport || response)
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to fetch report'))
            console.error('Error fetching report:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    /**
     * Fetch all interview reports
     */
    const getReports = useCallback(async () => {
        try {
            const response = await getAllInterviewsReports()
            setReports(response.interviewReports || response || [])
        } catch (err) {
            console.error('Error fetching reports:', err)
            setReports([])
        }
    }, [])

    const downloadResume = useCallback(async (interviewReportId) => {
        if (!interviewReportId) {
            setError('Interview report id is missing')
            return false
        }

        setDownloadingPdf(true)
        setError(null)

        try {
            const pdfBlob = await generateResumePdf(interviewReportId)
            const blobUrl = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }))
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `tailored-resume-${interviewReportId}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(blobUrl)
            return true
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to download resume PDF'))
            return false
        } finally {
            setDownloadingPdf(false)
        }
    }, [])

    return {
        // State
        formData,
        loading,
        error,
        dragActive,
        charCount,
        selfDescriptionCharCount,
        report,
        reports,
        downloadingPdf,

        // Handlers
        handleInputChange,
        handleFileUpload,
        handleGenerateReport,
        handleDrag,
        handleDrop,
        resetForm,
        getReportById,
        getReports,
        downloadResume
    }
}
