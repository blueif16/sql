import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const GalleryView = ({ sections, expandedSections, toggleSection, jumpToConcept }) => {
  return (
    <div className="space-y-4">
      <div className="text-lg font-medium text-gray-800">SQL Learning Path</div>
      
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white border border-gray-300 rounded-lg shadow-sm">
          <button
            onClick={() => toggleSection(sectionIndex)}
            className="w-full p-4 text-left hover:bg-gray-50 transition-colors rounded-lg flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium text-sm">{section.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{section.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {section.concepts.length} concept{section.concepts.length > 1 ? 's' : ''}
              </span>
              {expandedSections.includes(sectionIndex) ? 
                <ChevronDown size={16} className="text-gray-400" /> : 
                <ChevronRight size={16} className="text-gray-400" />
              }
            </div>
          </button>
          
          {expandedSections.includes(sectionIndex) && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              {section.concepts.map((concept, conceptIndex) => (
                <div
                  key={conceptIndex}
                  onClick={() => jumpToConcept(sectionIndex, conceptIndex)}
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-gray-800">{concept.name}</h4>
                    <span className="text-xs text-gray-500">
                      {concept.problems.length} challenges
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {concept.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GalleryView;
