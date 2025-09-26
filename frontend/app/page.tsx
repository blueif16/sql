"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, Play, RotateCcw, Settings, User, Code2, MessageCircle, BookOpen, Sparkles, Bot } from "lucide-react"

const cfg = { // Unified config management
  sql: `SELECT \n    \nFROM \n    \nWHERE \n    ;`,
  problem: "1. Two Sum",
  diff: "Easy",
  status: "Solved",
  lang: "SQL"
}

export default function CodingInterface() {
  const [code, setCode] = useState(cfg.sql) // Code state
  const [msgs, setMsgs] = useState([{id: 1, type: "ai", text: "Hello! I'm your AI programming assistant. How can I help you?"}]) // AI messages
  const [input, setInput] = useState("") // Input state
  const [tab, setTab] = useState("desc") // Current tab

  const examples = [ // Example data
    {title: "Example 1:", input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]"},
    {title: "Example 2:", input: "nums = [3,2,4], target = 6", output: "[1,2]"},
    {title: "Example 3:", input: "nums = [3,3], target = 6", output: "[0,1]"}
  ]

  const sendMsg = () => { // Send message
    if (!input.trim()) return
    setMsgs([...msgs, {id: Date.now(), type: "user", text: input}, {id: Date.now() + 1, type: "ai", text: "Got your question, let me analyze it for you..."}])
    setInput("")
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-white/95 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">LeetCode SQL</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
            <Play className="w-3 h-3 mr-1" />
            Run
          </Button>
          <Button size="sm" className="h-8 px-3 text-xs bg-gray-900 hover:bg-gray-800">
            <Sparkles className="w-3 h-3 mr-1" />
            Submit
          </Button>
          <button onClick={()=>window.open('/onboarding','_blank')} className="p-1.5 hover:bg-gray-100 rounded" title="Onboarding Settings">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-6 h-6 rounded bg-gray-900 flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex pt-12">
        {/* 左侧：题目描述 */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <button 
              onClick={() => setTab("desc")} 
              className="w-full px-5 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2 inline" />
              Problem Description
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <h1 className="text-lg font-semibold text-gray-900">{cfg.problem}</h1>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">{cfg.diff}</span>
              <span className="ml-auto text-xs text-gray-500 font-medium">{cfg.status}</span>
            </div>

            <div className="space-y-6 text-sm text-gray-700 leading-6">
              <p>
                Given an array of integers <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">nums</code> and an integer <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">target</code>, return <strong className="text-gray-900">indices of the two numbers</strong> such that they add up to <strong className="text-gray-900">target</strong>.
              </p>
              <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>

              <div className="space-y-3">
                {examples.map((ex, i) => (
                  <div key={i} className="bg-gray-50/80 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2 text-xs">{ex.title}</h3>
                    <div className="space-y-1 text-xs font-mono text-gray-600">
                      <div><span className="text-gray-500">Input: </span>{ex.input}</div>
                      <div><span className="text-gray-500">Output: </span><span className="text-gray-900 font-medium">{ex.output}</span></div>
                      {ex.explanation && <div><span className="text-gray-500">Explanation: </span><span className="text-gray-600">{ex.explanation}</span></div>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50/80 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2 text-xs">Constraints:</h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                  <li>2 ≤ nums.length ≤ 10⁴</li>
                  <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                  <li>-10⁹ ≤ target ≤ 10⁹</li>
                  <li className="font-medium text-gray-900">Only one valid answer exists.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 中间：代码编辑 */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Code Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                <span className="text-xs font-medium text-gray-600">{cfg.lang}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="absolute inset-0 flex">
              <div className="w-12 bg-gray-50/50 border-r border-gray-200 flex flex-col text-xs text-gray-400 font-mono"> {/* 行号 */}
                {Array.from({length: 6}, (_, i) => (
                  <div key={i + 1} className="h-6 flex items-center justify-end pr-3 hover:bg-gray-100/50 transition-colors">
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="absolute inset-0 w-full h-full p-4 bg-white border-none outline-none resize-none font-mono text-sm leading-6 text-gray-900 placeholder-gray-400"
                  spellCheck={false}
                  placeholder="Write your SQL code here..."
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-2.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-600">
              <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              Saved
            </span>
            <span className="text-gray-400 font-mono">Line 6, Col 3</span>
          </div>
        </div>

        {/* 右侧：AI聊天 */}
        <div className="w-1/3 bg-white flex flex-col">
          <div className="border-b border-gray-200 bg-gray-50/30">
            <div className="flex items-center gap-2 px-4 py-3">
              <Bot className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">AI Assistant</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3"> {/* 消息区域 */}
            {msgs.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${msg.type === "ai" ? "bg-gray-100" : "bg-gray-900"}`}>
                  {msg.type === "ai" ? <Bot className="w-3.5 h-3.5 text-gray-700" /> : <User className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className={`flex-1 max-w-xs px-3 py-2 rounded-lg text-sm leading-relaxed ${msg.type === "ai" ? "bg-gray-50/80 text-gray-800" : "bg-gray-900 text-white"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 p-4"> {/* 输入区域 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && sendMsg()}
                placeholder="Ask AI about this problem..."
                className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors placeholder-gray-400"
              />
              <button
                onClick={sendMsg}
                className="px-3 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}