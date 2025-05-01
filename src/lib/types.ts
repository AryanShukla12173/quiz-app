import { UserRole } from "@/context/AuthContext"
import { Timestamp } from "firebase/firestore"
import { editor } from "monaco-editor"
export type ChallengesDocumentData = {
    userId: string,
    testTitle: string,
    testDescription: string,
    createdAt: Timestamp,
    testDuration: number,
    challenges: [
        {
            title: string
            description: string
            score: number
            testcases: [
                {
                    description: string
                    input: string
                    expectedOutput: string
                    hidden: boolean


                }
            ]
        }
    ]
}

export type SubmissionResult = {
    userId: string
    createdAt: Timestamp,
    earnedPoints: number,
    totalPoints: number,
    testId: string,
    testTitle: string,
    testDescription: string,
    testDuration: number,
    testStartTime: Timestamp,
    testEndTime: Timestamp,
    noOfChallengesAttempted: number,
    challenges: {
        title: string
        description: string
        attempted: boolean
        testcases: {
            description: string
            input: string
            expectedOutput: string
            hidden: boolean
        }[]
    }[]
}

type PistonLanguageInfo = {
    pistonLanguage: string,
    pistonVersion: string
}

type LanguageInfo = {
    label: string
    monacoId: string
    value: string
    pistonLanguage: string
    pistonVersion: string
}[]

export const LANGUAGES : LanguageInfo= [
    { value: "python", label: "Python", monacoId: "python", pistonLanguage: "python", pistonVersion: "3.10.0" },
    { value: "java", label: "Java", monacoId: "java", pistonLanguage: "java", pistonVersion: "15.0.2" },
    { value: "cpp", label: "C++", monacoId: "cpp", pistonLanguage: "c++", pistonVersion: "12.2.0" },
    { value: "go", label: "Go", monacoId: "go", pistonLanguage: "go", pistonVersion: "1.19.2" },
  ]

export const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    snippetSuggestions: 'inline',
    formatOnType: true,
    formatOnPaste: true,
    lineNumbers: 'on',
    glyphMargin: true,
    folding: true,
    foldingHighlight: true,
    renderLineHighlight: 'all',
    parameterHints: { enabled: true },
  };
  

type adminChallengeCreationData = {
    testTitle: string
    testDescription: string
    userId: string
    createdAt: Timestamp
    testDuration: number
    testActiveDuration: number
    challenges: [
        {
            title: string
            description: string
            score: number
            testcases: [
                {
                    description: string
                    input: string
                    expectedOutput: string
                    hidden: boolean


                }
            ]
        }
    ]
}

export type consolidatedUserProfileCollectionData = {
    department?: string,
    designation?: string,
    displayName: string,
    email : string,
    fullName?: string,
    role: string,
    createdAt: string,
    Branch?:string,
    Enrollment_ID?: string,
    Year?: string,

    
}

export type adminUserDocData = {
    id?:string,
    fullName : string,
    email : string,
    createdAt : string,
    department : string,
    designation : string,
    role : UserRole
    displayName : string,

}
export type QuizAppUserDocData = {
    id?: string
    Branch : string,
    Enrollment_ID : string,
    fullName : string,
    Year : string,
    createdAt : string,
    displayName : string,
    email: string,
    role: UserRole
}