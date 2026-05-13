import React from 'react';

export const Ruler = ({ className = "" }) => {
  const marks = [];
  for (let i = 1; i <= 240; i++) {
    if (i === 1 || i % 10 === 0) {
      marks.push(
        <div key={i} className="relative flex-shrink-0" style={{ width: '1ch' }}>
          <div className="absolute top-0 left-0 flex flex-col items-center">
            <span className="text-[9px] font-mono font-bold text-slate-500 leading-none mb-1">{i}</span>
            <div className="w-[1px] h-1.5 bg-slate-700" />
          </div>
        </div>
      );
    } else if (i % 5 === 0) {
      marks.push(
        <div key={i} className="relative flex-shrink-0" style={{ width: '1ch' }}>
          <div className="absolute bottom-0 left-0 w-[1px] h-1 bg-slate-800" />
        </div>
      );
    } else {
      marks.push(
        <div key={i} className="relative flex-shrink-0" style={{ width: '1ch' }}>
          <div className="absolute bottom-0 left-0 w-[1px] h-0.5 bg-slate-800/50" />
        </div>
      );
    }
  }

  return (
    <div className={`flex items-end h-7 select-none pointer-events-none ${className}`} style={{ paddingLeft: '72px' }}>
      <div className="flex border-b border-slate-800/50 h-full items-end pb-0.5">
        {marks}
      </div>
    </div>
  );
};
