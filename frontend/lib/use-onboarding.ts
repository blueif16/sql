//入职流程数据管理hook
'use client'
import {useState,useCallback} from 'react'
import {cfg} from './onboarding-config'
import {Lang} from './i18n-config'

interface OnboardingData{
  difficulty?:string
  learning?:string
  interests:string[]
  concepts:string[]
  theme?:string
  language:Lang
}

export const useOnboarding=()=>{
  const [data,setData]=useState<OnboardingData>({interests:[],concepts:[],language:'zh'})//入职数据
  const [step,setStep]=useState(-1)//当前步骤(-1为语言选择)

  const updateData=useCallback((field:keyof OnboardingData,value:any)=>{//更新入职数据
    setData(prev=>({...prev,[field]:value}))
  },[])

  const nextStep=useCallback(()=>setStep(prev=>Math.min(prev+1,cfg.steps.length-1)),[])//下一步
  const prevStep=useCallback(()=>setStep(prev=>Math.max(prev-1,-1)),[])//上一步
  const goToStep=useCallback((newStep:number)=>setStep(newStep),[])//跳转步骤
  
  const getDbData=()=>({//获取数据库格式
    preferences:{
      difficulty_preference:cfg.dbMapping.difficulty[data.difficulty as keyof typeof cfg.dbMapping.difficulty],
      learning_style:cfg.dbMapping.learning[data.learning as keyof typeof cfg.dbMapping.learning],
      interest_areas:JSON.stringify(data.interests.map(i=>cfg.dbMapping.interests[i as keyof typeof cfg.dbMapping.interests])),
      learned_concepts:JSON.stringify(data.concepts),
      ui_theme:cfg.dbMapping.theme[data.theme as keyof typeof cfg.dbMapping.theme]
    }
  })

  const isOnboardingComplete=step===cfg.steps.length-1&&data.difficulty&&data.learning&&data.theme//入职是否完成

  return{data,step,updateData,nextStep,prevStep,goToStep,getDbData,isOnboardingComplete}//返回状态和方法
}
