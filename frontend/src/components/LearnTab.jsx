import React from 'react';
import { BookOpen, Info } from 'lucide-react';
import { UI_TEXTS } from '../config/constants'; // UI文本配置
import { useLanguage } from '../hooks/useLanguage'; // 语言钩子

const LearnTab = ({ selectedConcept, conceptInfo }) => { // conceptInfo 用于题目详情页传入的额外信息
  const { language } = useLanguage(); // 获取当前语言
  const t = UI_TEXTS[language].learnTab; // 获取当前语言的文本配置
  
  if (!selectedConcept) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-600">
          {t.noConcept}
        </div>
      </div>
    );
  }

  const getSyntaxExample = (conceptName) => { // 根据概念名称返回语法示例
    const examples = {
      'SELECT': 'SELECT column1, column2\nFROM table_name;',
      'WHERE': 'SELECT column1, column2\nFROM table_name\nWHERE condition;',
      'ORDER_BY': 'SELECT column1, column2\nFROM table_name\nORDER BY column_name ASC;',
      'LIMIT': 'SELECT * FROM table_name\nLIMIT 10;',
      'DISTINCT': 'SELECT DISTINCT column_name\nFROM table_name;',
      'COUNT': 'SELECT COUNT(*) FROM table_name;',
      'SUM': 'SELECT SUM(amount) FROM orders;',
      'AVG': 'SELECT AVG(score) FROM students;',
      'MAX_MIN': 'SELECT MAX(price), MIN(price)\nFROM products;',
      'GROUP_BY': 'SELECT category, COUNT(*)\nFROM products\nGROUP BY category;',
      'HAVING': 'SELECT category, COUNT(*)\nFROM products\nGROUP BY category\nHAVING COUNT(*) > 5;',
      'INNER_JOIN': 'SELECT *\nFROM table1\nINNER JOIN table2\nON table1.id = table2.foreign_id;',
      'LEFT_JOIN': 'SELECT *\nFROM table1\nLEFT JOIN table2\nON table1.id = table2.foreign_id;',
      'RIGHT_JOIN': 'SELECT *\nFROM table1\nRIGHT JOIN table2\nON table1.id = table2.foreign_id;',
      'SUBQUERY': 'SELECT * FROM table\nWHERE id IN (\n  SELECT id FROM other_table\n  WHERE condition\n);',
      'UNION': 'SELECT column FROM table1\nUNION\nSELECT column FROM table2;',
      'CASE_WHEN': 'SELECT\n  CASE\n    WHEN condition THEN result1\n    ELSE result2\n  END\nFROM table;',
      'WINDOW_FUNCTION': 'SELECT\n  ROW_NUMBER() OVER (\n    PARTITION BY category\n    ORDER BY price\n  )\nFROM products;'
    };
    return examples[conceptName] || 'SELECT * FROM table_name;';
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-blue-600" />
          <span className="font-medium text-sm">{selectedConcept.localized_name || selectedConcept.name}</span>
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
            {selectedConcept.difficulty_level}
          </span>
        </div>
        
        <div className="space-y-4">
          {/* Concept Description */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-start gap-2 mb-2">
              <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs font-medium text-blue-900">{t.conceptDescription}</div>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed">
              {selectedConcept.localized_description || selectedConcept.description}
            </div>
          </div>

          {/* Syntax Example */}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">{t.syntaxExample}</div>
            <div className="p-3 bg-gray-900 text-white rounded text-xs font-mono">
              <pre className="whitespace-pre-line">
                {selectedConcept.syntax || conceptInfo?.syntax || getSyntaxExample(selectedConcept.name)}
              </pre>
            </div>
          </div>

          {/* Examples from conceptInfo */}
          {(conceptInfo?.examples && conceptInfo.examples.length > 0) && (
            <div className="pt-2 border-t border-gray-200">
              <div className="font-medium text-sm text-gray-800 mb-3">{t.examples}</div>
              <div className="space-y-3 text-xs">
                {conceptInfo.examples.map((example, index) => (
                  <div key={index}>
                    {example.description && (
                      <div className="text-gray-700 mb-1">• {example.description}</div>
                    )}
                    <code className="bg-gray-100 px-2 py-1 rounded block font-mono whitespace-pre-wrap">
                      {example.code}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Points */}
          {(conceptInfo?.key_points && conceptInfo.key_points.length > 0) && (
            <div className="pt-2 border-t border-gray-200">
              <div className="font-medium text-sm text-gray-800 mb-2">{t.keyPoints}</div>
              <div className="space-y-1.5 text-xs text-gray-700">
                {conceptInfo.key_points.map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {selectedConcept.prerequisites && selectedConcept.prerequisites.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-xs font-medium text-yellow-900 mb-2">{t.prerequisites}</div>
              <div className="flex flex-wrap gap-2">
                {selectedConcept.prerequisites.map((prereq, index) => (
                  <span key={index} className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Progress Info */}
          {selectedConcept.total > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-xs font-medium text-green-900 mb-2">{t.learningProgress}</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${selectedConcept.progress_percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-green-900">
                  {selectedConcept.solved}/{selectedConcept.total} {t.problems}
                </span>
              </div>
            </div>
          )}
          
          {/* Tips */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="text-xs font-medium text-gray-700 mb-2">{t.learningTips}</div>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>{t.tip1}</li>
              <li>{t.tip2}</li>
              <li>{t.tip3}</li>
              <li>{t.tip4}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnTab;
