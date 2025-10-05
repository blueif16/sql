import React from 'react';
import { BookOpen } from 'lucide-react';

const LearnTab = ({ sections, currentSectionIndex, currentConceptIndex }) => {
  const currentConcept = sections[currentSectionIndex]?.concepts[currentConceptIndex];
  
  if (!currentConcept) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-gray-600" />
          <span className="font-medium text-sm">{currentConcept.name}</span>
        </div>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="text-sm text-gray-700 leading-relaxed mb-3">
              {currentConcept.explanation}
            </div>
          </div>

          <div className="p-2 bg-black text-white rounded text-xs font-mono flex justify-center">
            <pre className="text-left whitespace-pre-line">
              {currentConcept.name === 'SELECT FROM' && 'SELECT column1, column2\nFROM table_name;'}
              {currentConcept.name === 'ORDER BY' && 'SELECT column1, column2\nFROM table_name\nORDER BY column_name ASC;'}
              {currentConcept.name === 'WHERE' && 'SELECT column1, column2\nFROM table_name\nWHERE condition;'}
              {currentConcept.name === 'DISTINCT' && 'SELECT DISTINCT column_name\nFROM table_name;'}
            </pre>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <code className="bg-gray-100 px-2 py-1 rounded font-mono">SELECT</code>
              <span className="text-gray-700">Choose which columns to get</span>
            </div>
            
            <div className="ml-6 space-y-1 text-xs text-gray-600">
              <div>• <code className="bg-gray-50 px-1 rounded font-mono">*</code> = Get ALL columns</div>
              <div>• <code className="bg-gray-50 px-1 rounded font-mono">column1</code> = Get one column</div>
              <div>• <code className="bg-gray-50 px-1 rounded font-mono">col1, col2</code> = Get multiple</div>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <code className="bg-gray-100 px-2 py-1 rounded font-mono">FROM</code>
              <span className="text-gray-700">Choose which table to use</span>
            </div>
            
            {currentConcept.name === 'ORDER BY' && (
              <>
                <div className="flex items-center gap-2 text-xs">
                  <code className="bg-gray-100 px-2 py-1 rounded font-mono">ORDER BY</code>
                  <span className="text-gray-700">Sort results by column</span>
                </div>
                <div className="ml-6 space-y-1 text-xs text-gray-600">
                  <div>• <code className="bg-gray-50 px-1 rounded font-mono">ASC</code> = Ascending (A-Z, 1-9)</div>
                  <div>• <code className="bg-gray-50 px-1 rounded font-mono">DESC</code> = Descending (Z-A, 9-1)</div>
                </div>
              </>
            )}
            
            {currentConcept.name === 'WHERE' && (
              <>
                <div className="flex items-center gap-2 text-xs">
                  <code className="bg-gray-100 px-2 py-1 rounded font-mono">WHERE</code>
                  <span className="text-gray-700">Filter rows by condition</span>
                </div>
                <div className="ml-6 space-y-1 text-xs text-gray-600">
                  <div>• <code className="bg-gray-50 px-1 rounded font-mono">column = 'value'</code> = Exact match</div>
                  <div>• <code className="bg-gray-50 px-1 rounded font-mono">AND</code> = Both conditions true</div>
                  <div>• <code className="bg-gray-50 px-1 rounded font-mono">OR</code> = Either condition true</div>
                </div>
              </>
            )}
            
            {currentConcept.name === 'DISTINCT' && (
              <div className="flex items-center gap-2 text-xs">
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">DISTINCT</code>
                <span className="text-gray-700">Remove duplicate rows</span>
              </div>
            )}
          </div>
          
          <div className="pt-2 border-t border-gray-200 text-xs space-y-2 text-gray-700">
            <div className="font-medium text-sm text-gray-800 mb-2">Examples:</div>
            {currentConcept.name === 'SELECT FROM' && (
              <>
                <div>
                  <div>• All columns:</div>
                  <code className="bg-gray-100 px-2 py-1 rounded block mt-1 font-mono whitespace-pre-line">
                    SELECT *{'\n'}FROM customers;
                  </code>
                </div>
                <div>
                  <div>• Multiple columns:</div>
                  <code className="bg-gray-100 px-2 py-1 rounded block mt-1 font-mono whitespace-pre-line">
                    SELECT name, country{'\n'}FROM customers;
                  </code>
                </div>
              </>
            )}
            {currentConcept.name === 'ORDER BY' && (
              <>
                <div>
                  <div>• Sort ascending:</div>
                  <code className="bg-gray-100 px-2 py-1 rounded block mt-1 font-mono whitespace-pre-line">
                    SELECT *{'\n'}FROM customers{'\n'}ORDER BY name;
                  </code>
                </div>
                <div>
                  <div>• Sort descending:</div>
                  <code className="bg-gray-100 px-2 py-1 rounded block mt-1 font-mono whitespace-pre-line">
                    SELECT *{'\n'}FROM customers{'\n'}ORDER BY name DESC;
                  </code>
                </div>
              </>
            )}
            {currentConcept.name === 'WHERE' && (
              <>
                <div>
                  <div>• Filter by condition:</div>
                  <code className="bg-gray-100 px-2 py-1 rounded block mt-1 font-mono whitespace-pre-line">
                    SELECT *{'\n'}FROM customers{'\n'}WHERE country = 'France';
                  </code>
                </div>
                <div>
                  <div>• Multiple conditions:</div>
                  <code className="bg-gray-100 px-2 py-1 rounded block mt-1 font-mono whitespace-pre-line">
                    SELECT product_id{'\n'}FROM products{'\n'}WHERE low_fats = 'Y'{'\n'}AND recyclable = 'Y';
                  </code>
                </div>
              </>
            )}
            {currentConcept.name === 'DISTINCT' && (
              <>
                <div>
                  <div>• Unique values:</div>
                  <code className="bg-gray-100 px-2 py-1 rounded block mt-1 font-mono whitespace-pre-line">
                    SELECT DISTINCT country{'\n'}FROM customers;
                  </code>
                </div>
                <div>
                  <div>• Unique companies:</div>
                  <code className="bg-gray-100 px-2 py-1 rounded block mt-1 font-mono whitespace-pre-line">
                    SELECT DISTINCT company{'\n'}FROM customers;
                  </code>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnTab;
