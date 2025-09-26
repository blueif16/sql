'use client'
import {Button} from '@/components/ui/button'
import {cfg} from '@/lib/onboarding-config'
import {useOnboarding} from '@/lib/use-onboarding'
import {getTranslation} from '@/lib/i18n-config'
import {ChevronLeft,ChevronRight,Check,Globe} from 'lucide-react'
import {useRouter} from 'next/navigation'

export default function Onboarding(){
  const {data,step,updateData,nextStep,prevStep,goToStep,getDbData,isOnboardingComplete}=useOnboarding()//入职状态
  const router=useRouter()
  const t=getTranslation(data.language)//当前语言翻译

  // 语言选择页面
  if(step===-1){
    return(
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 text-gray-600"/>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Language / 选择语言</h1>
            <p className="text-gray-600 mb-8">Select your preferred language for the onboarding process</p>
            
            <div className="grid grid-cols-1 gap-3 mb-6">
              <button onClick={()=>{updateData('language','zh');goToStep(0)}}
                className="p-4 text-center border-2 rounded-lg border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                🇨🇳 中文 (Chinese)
              </button>
              <button onClick={()=>{updateData('language','en');goToStep(0)}}
                className="p-4 text-center border-2 rounded-lg border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                🇺🇸 English
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(step>=cfg.steps.length)return null//无效步骤

  const currentStep=cfg.steps[step]//当前步骤

  const renderStep=()=>{//渲染当前步骤
    switch(currentStep){
      case 'difficulty':
        const difficultyOptions=[t.onboarding.difficulty.easy,t.onboarding.difficulty.medium,t.onboarding.difficulty.hard,t.onboarding.difficulty.adaptive]
        const difficultyDescs=[t.onboarding.difficulty.easyDesc,t.onboarding.difficulty.mediumDesc,t.onboarding.difficulty.hardDesc,t.onboarding.difficulty.adaptiveDesc]
        return(
          <div className="space-y-4">
            {difficultyOptions.map((d,i)=>(
              <button key={d} onClick={()=>updateData('difficulty',d)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${data.difficulty===d?'border-gray-900 bg-gray-50':'border-gray-200 hover:border-gray-300'}`}>
                <div className="font-medium">{d}</div>
                <div className="text-sm text-gray-500 mt-1">{difficultyDescs[i]}</div>
              </button>
            ))}
          </div>
        )
      case 'learning':
        const learningOptions=[t.onboarding.learning.guided,t.onboarding.learning.challenge,t.onboarding.learning.stepByStep]
        const learningDescs=[t.onboarding.learning.guidedDesc,t.onboarding.learning.challengeDesc,t.onboarding.learning.stepByStepDesc]
        return(
          <div className="space-y-4">
            {learningOptions.map((l,i)=>(
              <button key={l} onClick={()=>updateData('learning',l)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${data.learning===l?'border-gray-900 bg-gray-50':'border-gray-200 hover:border-gray-300'}`}>
                <div className="font-medium">{l}</div>
                <div className="text-sm text-gray-500 mt-1">{learningDescs[i]}</div>
              </button>
            ))}
          </div>
        )
      case 'interests':
        const interestOptions=[t.onboarding.interests.movie,t.onboarding.interests.football,t.onboarding.interests.ecommerce,t.onboarding.interests.database,t.onboarding.interests.system,t.onboarding.interests.entertainment,t.onboarding.interests.sports]
        return(
          <div className="grid grid-cols-2 gap-3">
            {interestOptions.map(i=>(
              <button key={i} onClick={()=>{
                const newInterests=data.interests.includes(i)?data.interests.filter(x=>x!==i):[...data.interests,i]
                updateData('interests',newInterests)
              }}
                className={`p-3 text-center border-2 rounded-lg transition-colors ${data.interests.includes(i)?'border-gray-900 bg-gray-50':'border-gray-200 hover:border-gray-300'}`}>
                <div>{i}</div>
                {data.interests.includes(i)&&<Check className="w-4 h-4 mx-auto mt-1 text-gray-900"/>}
              </button>
            ))}
          </div>
        )
      case 'concepts':
        return(
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
        )
      case 'theme':
        const themeOptions=[t.onboarding.theme.light,t.onboarding.theme.dark]
        return(
          <div className="space-y-4">
            {themeOptions.map((theme,i)=>(
              <button key={theme} onClick={()=>updateData('theme',theme)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${data.theme===theme?'border-gray-900 bg-gray-50':'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${i===0?'bg-white border-2 border-gray-300':'bg-gray-900'}`}></div>
                  <div className="font-medium text-lg">{theme}</div>
                  {data.theme===theme&&<Check className="w-5 h-5 ml-auto text-gray-900"/>}
                </div>
              </button>
            ))}
          </div>
        )
      default:return null
    }
  }

  const handleComplete=async()=>{//完成入职
    console.log('保存数据：',getDbData())
    router.push('/onboarding/complete')//跳转到完成页面
  }

  return(
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* 进度条 */}
          <div className="flex items-center justify-between mb-8">
            {t.onboarding.steps.map((_,i)=>(
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i<=step?'bg-gray-900 text-white':'bg-gray-200 text-gray-400'}`}>
                  {i<step?<Check className="w-4 h-4"/>:(i+1)}
                </div>
                {i<cfg.steps.length-1&&<div className={`w-12 h-0.5 mx-2 ${i<step?'bg-gray-900':'bg-gray-200'}`}/>}
              </div>
            ))}
          </div>

          {/* 步骤内容 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStep==='difficulty'?t.onboarding.difficulty.title:
               currentStep==='learning'?t.onboarding.learning.title:
               currentStep==='interests'?t.onboarding.interests.title:
               currentStep==='concepts'?t.onboarding.concepts.title:
               currentStep==='theme'?t.onboarding.theme.title:''}
            </h1>
            <p className="text-gray-600">
              {currentStep==='difficulty'?t.onboarding.difficulty.desc:
               currentStep==='learning'?t.onboarding.learning.desc:
               currentStep==='interests'?t.onboarding.interests.desc:
               currentStep==='concepts'?t.onboarding.concepts.desc:
               currentStep==='theme'?t.onboarding.theme.desc:''}
            </p>
          </div>

          {renderStep()}

          {/* 导航按钮 */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStep} disabled={step===0}>
              <ChevronLeft className="w-4 h-4 mr-2"/>{t.common.prev}
            </Button>
            {step===cfg.steps.length-1?(
              <Button onClick={handleComplete} disabled={!isOnboardingComplete}>{t.common.complete}</Button>
            ):(
              <Button onClick={nextStep}>{t.common.next}<ChevronRight className="w-4 h-4 ml-2"/></Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
