import React, { useMemo, memo } from 'react';
import { useCnabStore } from '../../store/useCnabStore';
import { cnabEngine } from '../../utils/cnab/engine';
import { useCnabLineLogic } from './useCnabLineLogic';
import { CnabField } from './CnabField';
import { CnabExtraField } from './CnabExtraField';

const EMPTY_ARRAY = [];

const CnabLineComponent = ({ index, raw, isSelected, focusedField, cursorOffset, onSelect, showLimitLine }) => {
  const isContinuous = useCnabStore(state => state.visualSettings.isContinuous);
  const activeRules = useCnabStore(state => state.activeRules);
  const disabledFields = useCnabStore(state => state.disabledFields);
  const lineAuditErrors = useCnabStore(state => state.auditErrorsByLine[index] || EMPTY_ARRAY);

  const {
    localVal,
    setLocalVal,
    inputRef,
    handleInputChange,
    handleKeyDown,
    handleFieldClick,
    commitChange,
    schema,
    lastFieldEnd
  } = useCnabLineLogic(index, raw, isSelected, focusedField, cursorOffset, onSelect);

  const parsed = useMemo(() => {
    const lines = useCnabStore.getState().rawLines;
    return cnabEngine.parseLine(raw, { activeRules, disabledFields, rawLines: lines, index });
  }, [raw, activeRules, disabledFields, index]);

  const errorsMap = useMemo(() => {
    const map = {};
    const engineErrors = parsed._metadata?.errors || {};
    Object.entries(engineErrors).forEach(([field, msg]) => {
      map[field] = { message: msg, type: 'validation' };
    });
    lineAuditErrors
      .filter(err => err.fieldName && err.fieldName !== '_line')
      .forEach(err => {
        map[err.fieldName] = { message: err.message, type: err.type || 'validation' };
      });
    return map;
  }, [parsed._metadata?.errors, lineAuditErrors]);

  const renderFields = () => {
    const fields = schema.fields;
    return fields.map((field, idx) => {
      const isFocused = isSelected && focusedField === field.name;
      const val = raw.substring(field.start - 1, field.end);
      const isDynamic = field.isDynamic;
      const groupId = field.groupId;
      const hasGroup = isDynamic || groupId;

      const isGroupStart = hasGroup && (!fields[idx - 1] || (fields[idx - 1].groupId !== groupId || fields[idx - 1].isDynamic !== isDynamic));
      const isGroupEnd = hasGroup && (!fields[idx + 1] || (fields[idx + 1].groupId !== groupId || fields[idx + 1].isDynamic !== isDynamic));

      let groupInfo = null;
      if (hasGroup) {
        let colorClass = 'bg-slate-500/10 border-slate-500/40';
        if (groupId === '09') colorClass = 'bg-indigo-500/10 border-indigo-500/40';
        else if (groupId === '10') colorClass = 'bg-amber-500/10 border-amber-500/40';
        else if (groupId === '11') colorClass = 'bg-teal-500/10 border-teal-500/40';
        else if (groupId === '12') colorClass = 'bg-rose-500/10 border-rose-500/40';
        else if (groupId === '13') colorClass = 'bg-fuchsia-500/10 border-fuchsia-500/40';

        groupInfo = { colorClass, isStart: isGroupStart, isEnd: isGroupEnd };
      }

      return (
        <CnabField
          key={`${field.name}-${idx}`}
          field={field}
          idx={idx}
          val={val}
          isFocused={isFocused}
          localVal={localVal}
          errorInfo={errorsMap[field.name]}
          isContinuous={isContinuous}
          onFieldClick={handleFieldClick}
          inputRef={inputRef}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            commitChange();
            setLocalVal(null);
            useCnabStore.getState().focusField(index, null);
          }}
          fields={fields}
          groupInfo={groupInfo}
        />
      );
    });
  };

  const extraVal = raw.substring(lastFieldEnd);
  const isWrongLength = raw.length !== 240;

  return (
    <div
      className={`group flex items-center h-8 transition-colors border-b border-slate-800/30 ${isSelected ? 'bg-blue-500/10' : 'hover:bg-slate-800/30'}`}
      onClick={() => onSelect(index)}
    >
      <span className="w-12 text-slate-500 text-[10px] font-mono flex-shrink-0 select-none opacity-40 group-hover:opacity-100 flex items-center justify-center border-r border-slate-800/50 h-full bg-slate-900/20">
        {String(index + 1).padStart(5, '0')}
      </span>
      <div className="flex items-center gap-0 overflow-x-visible h-full flex-1">
        <div className="flex items-center gap-0 h-full">
          {renderFields()}
        </div>
        <CnabExtraField
          raw={raw}
          extraVal={extraVal}
          isFocused={isSelected && focusedField === '_extra'}
          localVal={localVal}
          isContinuous={isContinuous}
          onFieldClick={handleFieldClick}
          inputRef={inputRef}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            commitChange();
            setLocalVal(null);
            useCnabStore.getState().focusField(index, null);
          }}
          fieldCount={schema.fields.length}
        />
        {isWrongLength && (
          <div className="flex-shrink-0 ml-auto mr-4 px-2 py-0.5 bg-red-500/30 text-red-300 text-[9px] font-bold rounded border border-red-500/50 whitespace-nowrap">
            {raw.length} posições
          </div>
        )}
      </div>
    </div>
  );
};

export const CnabLine = memo(CnabLineComponent);
export default CnabLine;
