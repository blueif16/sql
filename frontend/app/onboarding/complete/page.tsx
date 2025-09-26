'use client'
import {Button} from '@/components/ui/button'
import {useOnboarding} from '@/lib/use-onboarding'
import {getTranslation} from '@/lib/i18n-config'
import {useRouter} from 'next/navigation'
import {Check,ArrowRight} from 'lucide-react'
import {useState} from 'react'

export default function CompletePage(){
  const {data,getDbData}=useOnboarding()//入职数据
  const router=useRouter()
  const [saving,setSaving]=useState(false)//保存状态
  const t=getTranslation(data.language)//当前语言翻译

  const handleStart=async()=>{//开始使用
    setSaving(true)
    try{
      const dbData=getDbData()//获取数据库格式
      console.log('保存用户数据：',dbData)//调试输出
      //TODO: 调用API保存到数据库
      //await saveUserData(dbData)
      router.push('/')//跳转到主页面
    }catch(e){
      console.error('保存失败：',e)
    }finally{
      setSaving(false)
    }
  }

  return(
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* 成功图标 */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600"/>
          </div>

          {/* 标题 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.onboarding.complete.title}</h1>
          <p className="text-gray-600 mb-8">{t.onboarding.complete.subtitle}</p>

          {/* 偏好总结 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-medium text-gray-900 mb-4">{t.onboarding.complete.summary}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.onboarding.complete.difficulty}</span>
                <span className="font-medium">{data.difficulty||'--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.onboarding.complete.learning}</span>
                <span className="font-medium">{data.learning||'--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.onboarding.complete.interests}</span>
                <span className="font-medium">{data.interests.length?data.interests.join(data.language==='zh'?'、':', '):'--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.onboarding.complete.concepts}</span>
                <span className="font-medium font-mono text-xs">{data.concepts.length?data.concepts.join(', '):'--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.onboarding.complete.theme}</span>
                <span className="font-medium">{data.theme||'--'}</span>
              </div>
            </div>
          </div>

          {/* 开始按钮 */}
          <div className="space-y-4">
            <Button onClick={handleStart} disabled={saving} className="w-full py-3">
              {saving?t.common.saving:t.onboarding.complete.start}
              {!saving&&<ArrowRight className="w-4 h-4 ml-2"/>}
            </Button>
            <p className="text-xs text-gray-500">{t.onboarding.complete.note}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
