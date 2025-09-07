import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, Link } from 'react-router-dom';
import { useProblemStore } from '../store/useProblemStore';
import { useAuthStore } from '../store/useAuthStore';
import { useExecutionStore } from "../store/useExcuationStore"
import {
    FileText,
    MessageSquare,
    Lightbulb,
    Bookmark,
    Share2,
    Clock,
    ChevronRight,
    Code2,
    Users,
    ThumbsUp,
    Home,
    Terminal,
    Play,
} from "lucide-react";

import { getLanguageId } from '../libs/lang';
import SubmissionResults from '../component/Submission';

const ProblemPage = () => {
    const { id } = useParams();
    const { getProblemById, problem, isProblemLoading } = useProblemStore();
    const { executeCode, submission, isExecuting } = useExecutionStore();

    const [code, setCode] = useState("");
    const [activeTab, setActiveTab] = useState("description");
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [testcases, setTestCases] = useState([]);
    const submissionCount = problem?.submissions?.length || 0;

    // Fetch problem on mount or id change
    useEffect(() => {
        getProblemById(id);
    }, [id, getProblemById]);

    // Update code and testcases when problem or language changes
    useEffect(() => {
        if (problem) {
            setCode(problem.codeSnippets?.[selectedLanguage] || "");
            setTestCases(
                problem.testCases?.map(tc => ({ input: tc.input, output: tc.output })) || []
            );
        }
    }, [problem, selectedLanguage]);

    const handleLanguageChange = (e) => {
        const language = e.target.value;
        setSelectedLanguage(language);
        setCode(problem?.codeSnippets?.[language] || "");
    };

    const handleRunCode = (e) => {
        e.preventDefault();
        try {
            const language_id = getLanguageId(selectedLanguage);
            const stdin = problem?.testCases?.map(tc => tc.input) || [];
            const expected_outputs = problem?.testCases?.map(tc => tc.output) || [];
            executeCode(code, language_id, stdin, expected_outputs, id);
        } catch (error) {
            console.log("Error executing code", error);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "description":
                return (
                    <div className="prose max-w-none">
                        <p className="text-lg mb-6">{problem?.description}</p>

                        {problem?.examples && (
                            <>
                                <h3 className="text-xl font-bold mb-4">Examples:</h3>
                                {Object.entries(problem.examples).map(([lang, example]) => (
                                    <div key={lang} className="bg-base-200 p-6 rounded-xl mb-6 font-mono">
                                        <div className="mb-4">
                                            <div className="text-indigo-300 mb-2 text-base font-semibold">Input:</div>
                                            <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white">
                                                {example.input}
                                            </span>
                                        </div>
                                        <div className="mb-4">
                                            <div className="text-indigo-300 mb-2 text-base font-semibold">Output:</div>
                                            <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white">
                                                {example.output}
                                            </span>
                                        </div>
                                        {example.explanation && (
                                            <div>
                                                <div className="text-emerald-300 mb-2 text-base font-semibold">Explanation:</div>
                                                <p className="text-base-content/70 text-lg font-sem">{example.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {problem?.constraints && (
                            <>
                                <h3 className="text-xl font-bold mb-4">Constraints:</h3>
                                <div className="bg-base-200 p-6 rounded-xl mb-6">
                                    <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white text-lg">
                                        {problem.constraints}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                );
            case "submissions":
                return <div className="p-4 text-center text-base-content/70">No submissions yet</div>;
            case "discussion":
                return <div className="p-4 text-center text-base-content/70">No discussions yet</div>;
            case "hints":
                return (
                    <div className="p-4">
                        {problem?.hints ? (
                            <div className="bg-base-200 p-6 rounded-xl">
                                <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white text-lg">
                                    {problem.hints}
                                </span>
                            </div>
                        ) : (
                            <div className="text-center text-base-content/70">No hints available</div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    if (isProblemLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">Loading problem...</div>
        );
    }

    if (!problem) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                Problem not found
                <Link to="/" className="btn btn-primary mt-4">Go Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-300 to-base-200 max-w-7xl w-full mx-auto p-4">

            {/* Navbar */}
            <nav className="navbar bg-base-100 shadow-lg px-4 mb-6 rounded-lg">
                <div className="flex-1 gap-2">
                    <Link to={"/"} className="flex items-center gap-2 text-primary">
                        <Home className="w-6 h-6" />
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                    <div className="mt-2">
                        <h1 className="text-xl font-bold">{problem.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-base-content/70 mt-2 flex-wrap">
                            <Clock className="w-4 h-4" />
                            <span>
                                Updated{" "}
                                {problem.createdAt &&
                                    new Date(problem.createdAt).toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                            </span>
                            <span className="text-base-content/30">•</span>
                            <Users className="w-4 h-4" />
                            <span>{submissionCount} Submissions</span>
                            <span className="text-base-content/30">•</span>
                            <ThumbsUp className="w-4 h-4" />
                            <span>95% Success Rate</span>
                        </div>
                    </div>
                </div>
                <div className="flex-none gap-4 flex items-center">
                    <button
                        className={`btn btn-ghost btn-circle ${isBookmarked ? "text-primary" : ""}`}
                        onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                        <Bookmark className="w-5 h-5" />
                    </button>
                    <button className="btn btn-ghost btn-circle">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <select
                        className="select select-bordered select-primary w-40"
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                    >
                        {Object.keys(problem.codeSnippets || {}).map((lang) => (
                            <option key={lang} value={lang}>
                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </nav>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Description & Tabs */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body p-0">
                        <div className="tabs tabs-bordered">
                            <button
                                className={`tab gap-2 ${activeTab === "description" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("description")}
                            >
                                <FileText className="w-4 h-4" />
                                Description
                            </button>
                            <button
                                className={`tab gap-2 ${activeTab === "submissions" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("submissions")}
                            >
                                <Code2 className="w-4 h-4" />
                                Submissions
                            </button>
                            <button
                                className={`tab gap-2 ${activeTab === "discussion" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("discussion")}
                            >
                                <MessageSquare className="w-4 h-4" />
                                Discussion
                            </button>
                            <button
                                className={`tab gap-2 ${activeTab === "hints" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("hints")}
                            >
                                <Lightbulb className="w-4 h-4" />
                                Hints
                            </button>
                        </div>
                        <div className="p-6">{renderTabContent()}</div>
                    </div>
                </div>

                {/* Code Editor */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body p-0">
                        <div className="tabs tabs-bordered">
                            <button className="tab tab-active gap-2">
                                <Terminal className="w-4 h-4" />
                                Code Editor
                            </button>
                        </div>
                        <div className="h-[600px] w-full">
                            <Editor
                                height="100%"
                                language={selectedLanguage.toLowerCase()}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || "")}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 20,
                                    lineNumbers: "on",
                                    roundedSelection: false,
                                    scrollBeyondLastLine: false,
                                    readOnly: false,
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                        <div className="p-4 border-t border-base-300 bg-base-200 flex justify-between">
                            <button
                                className={`btn btn-primary gap-2 ${isExecuting ? "loading" : ""}`}
                                onClick={handleRunCode}
                                disabled={isExecuting}
                            >
                                {!isExecuting && <Play className="w-4 h-4" />}
                                Run Code
                            </button>
                            <button className="btn btn-success gap-2">
                                Submit Solution
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Test Cases */}
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    {submission ? (
                        <SubmissionResults submission={submission} />
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Test Cases</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="table table-zebra w-full">
                                    <thead>
                                        <tr>
                                            <th>Input</th>
                                            <th>Expected Output</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {testcases.map((testCase, index) => (
                                            <tr key={index}>
                                                <td className="font-mono">{testCase.input}</td>
                                                <td className="font-mono">{testCase.output}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ProblemPage;
