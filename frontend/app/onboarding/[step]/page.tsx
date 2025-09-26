'use client'
import {Button} from '@/components/ui/button'
import {cfg} from '@/lib/onboarding-config'
import {useOnboarding} from '@/lib/use-onboarding'
import {useRouter} from 'next/navigation'
import {ChevronLeft,ChevronRight,Check} from 'lucide-react'
import {useEffect} from 'react'

interface StepPageProps{params:{step:string}}//页面参数类型

export default function StepPage({params}:StepPageProps){
  const router=useRouter()
  const {data,step,updateData,nextStep,prevStep,getDbData}=useOnboarding()//入职状态
  const currentStepName=params.step//当前步骤名
  const stepIndex=cfg.steps.indexOf(currentStepName)//步骤索引

  useEffect(()=>{//同步步骤状态
    if(stepIndex!==-1&&step!==stepIndex){
      //根据URL更新步骤状态
    }
  },[stepIndex,step])

  const navigateStep=(direction:'next'|'prev')=>{//导航到其他步骤
    const currentIndex=cfg.steps.indexOf(currentStepName)
    const targetIndex=direction==='next'?currentIndex+1:currentIndex-1
    if(targetIndex>=0&&targetIndex<cfg.steps.length){
      router.push(`/onboarding/${cfg.steps[targetIndex]}`)
    }else if(direction==='next'&&targetIndex>=cfg.steps.length){
      router.push('/onboarding/complete')//完成页面
    }
  }

  const renderStepContent=()=>{//渲染步骤内容
    switch(currentStepName){
      case 'difficulty':
        return(
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-6">{cfg.titles.difficulty}</h2>
            <p className="text-gray-600 text-center mb-8">{cfg.descriptions.difficulty}</p>
            {cfg.difficulty.map(d=>(
              <button key={d} onClick={()=>updateData('difficulty',d)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${data.difficulty===d?'border-gray-900 bg-gray-50':'border-gray-200 hover:border-gray-300'}`}>
                <div className="font-medium">{d}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {d==='简单'&&'适合初学者，基础SQL语法练习'}
                  {d==='中等'&&'有一定基础，包含复合查询'}
                  {d==='困难'&&'高级SQL，复杂业务逻辑实现'}
                  {d==='自适应'&&'系统根据答题情况动态调整难度'}
                </div>
              </button>
            ))}
          </div>
        )
      case 'learning':
        return(
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-6">{cfg.titles.learning}</h2>
            <p className="text-gray-600 text-center mb-8">{cfg.descriptions.learning}</p>
            {cfg.learning.map(l=>(
              <button key={l} onClick={()=>updateData('learning',l)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${data.learning===l?'border-gray-900 bg-gray-50':'border-gray-200 hover:border-gray-300'}`}>
                <div className="font-medium">{l}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {l==='引导式'&&'逐步提示解题思路，详细解释每个步骤'}
                  {l==='挑战式'&&'直接面对挑战，通过实践自主探索'}
                  {l==='逐步式'&&'分步骤学习，循序渐进掌握技能'}
                </div>
              </button>
            ))}
          </div>
        )
      case 'interests':
        return(
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-center">{cfg.titles.interests}</h2>
            <p className="text-gray-600 text-center">{cfg.descriptions.interests}</p>
            <div className="grid grid-cols-2 gap-3">
              {cfg.interests.map(i=>(
                <button key={i} onClick={()=>{
                  const newInterests=data.interests.includes(i)?data.interests.filter(x=>x!==i):[...data.interests,i]
                  updateData('interests',newInterests)
                }}
                  className={`p-4 text-center border-2 rounded-lg transition-colors ${data.interests.includes(i)?'border-gray-900 bg-gray-50':'border-gray-200 hover:border-gray-300'}`}>
                  <div className="font-medium">{i}</div>
                  {data.interests.includes(i)&&<Check className="w-4 h-4 mx-auto mt-2 text-gray-900"/>}
                </button>
              ))}
            </div>
          </div>
        )
      case 'concepts':
        return(
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-center">{cfg.titles.concepts}</h2>
            <p className="text-gray-600 text-center">{cfg.descriptions.concepts}</p>
            <div className="grid grid-cols-2 gap-3">
              {cfg.concepts.map(c=>(
                <button key={c} onClick={()=>{
                  const newConcepts=data.concepts.includes(c)?data.concepts.filter(x=>x!==c):[...data.concepts,c]
                  updateData('concepts',newConcepts)
                }}
                  className={`p-3 text-center border-2 rounded-lg transition-colors font-mono text-sm ${data.concepts.includes(c)?'border-gray-900 bg-gray-50':'border-gray-200 hover:border-gray-300'}`}>
                  <div>{c}</div>
                  {data.concepts.includes(c)&&<Check className="w-4 h-4 mx-auto mt-1 text-gray-900"/>}
                </button>
              ))}
            </div>
          </div>
        )
      case 'theme':
        return(
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-6">{cfg.titles.theme}</h2>
            <p className="text-gray-600 text-center mb-8">{cfg.descriptions.theme}</p>
            {cfg.themes.map(t=>(
              <button key={t} onClick={()=>updateData('theme',t)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${data.theme===t?'border-gray-900 bg-gray-50':'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${t==='浅色'?'bg-white border-2 border-gray-300':'bg-gray-900'}`}></div>
                  <div className="font-medium text-lg">{t}主题</div>
                  {data.theme===t&&<Check className="w-5 h-5 ml-auto text-gray-900"/>}
                </div>
              </button>
            ))}
          </div>
        )
      default:
        return<div className="text-center text-gray-500">未找到该步骤</div>
    }
  }

  if(stepIndex===-1)return<div className="min-h-screen flex items-center justify-center">页面不存在</div>//无效步骤

  return(
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* 进度指示器 */}
          <div className="flex items-center justify-center mb-8">
            {cfg.steps.map((_,i)=>(
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${i<=stepIndex?'bg-gray-900 text-white':'bg-gray-200 text-gray-400'}`}>
                  {i<stepIndex?<Check className="w-4 h-4"/>:(i+1)}
                </div>
                {i<cfg.steps.length-1&&<div className={`w-12 h-0.5 mx-2 ${i<stepIndex?'bg-gray-900':'bg-gray-200'}`}/>}
              </div>
            ))}
          </div>

          {renderStepContent()}

          {/* 导航按钮 */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={()=>navigateStep('prev')} disabled={stepIndex===0}>
              <ChevronLeft className="w-4 h-4 mr-2"/>上一步
            </Button>
            <Button onClick={()=>navigateStep('next')}>
              {stepIndex===cfg.steps.length-1?'完成设置':'下一步'}
              {stepIndex<cfg.steps.length-1&&<ChevronRight className="w-4 h-4 ml-2"/>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
