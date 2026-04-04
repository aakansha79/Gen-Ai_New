/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

/**
 * INTERVIEW CONTEXT - STATE LAYER
 * Manages global interview data and state across the application
 */
export const InterviewContext = createContext()

export const InterviewProvider = ({ children }) => { 
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])
    const [error, setError] = useState(null)

    const value = {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
        error,
        setError
    }

    return (
        <InterviewContext.Provider value={value}>
            {children}
        </InterviewContext.Provider>
    )
}
