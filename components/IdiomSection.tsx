
import React from 'react';

interface IdiomSectionProps {
  idiom: { text: string; meaning: string; tone: string } | null;
}

const IdiomSection: React.FC<IdiomSectionProps> = ({ idiom }) => {
  if (!idiom) return <div className="text-gray-300 text-xs italic">Finding some wisdom...</div>;

  const toneEmoji = idiom.tone === 'cynical' ? '🙄' : idiom.tone === 'motivational' ? '✨' : '🌸';

  return (
    <div className="mt-8 text-center px-6">
      <div className="inline-block px-3 py-1 bg-white rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-3 shadow-sm border border-gray-100">
        Daily Idiom {toneEmoji}
      </div>
      <h3 className="text-lg font-bold text-gray-700 leading-tight mb-2">"{idiom.text}"</h3>
      <p className="text-sm text-gray-500 italic max-w-xs mx-auto leading-relaxed">
        {idiom.meaning}
      </p>
    </div>
  );
};

export default IdiomSection;
