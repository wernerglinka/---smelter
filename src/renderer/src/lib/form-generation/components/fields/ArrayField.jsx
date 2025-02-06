import React from 'react';
import { useForm } from '../../context/FormContext';
import { toTitleCase } from '../../utils';
import { DragHandleIcon, CollapseIcon, CollapsedIcon } from '../../../../components/icons';

export const ArrayField = ({ field, implicitDef }) => {
  const { dispatch } = useForm();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="form-element is-array label-exists no-drop" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon className="icon" />
      </span>
      <label className="object-name label-wrapper">
        <span>{field.label}</span>
        <input 
          type="text" 
          className="element-label" 
          placeholder="Array Name" 
          value={field.label} 
          readOnly 
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon className="icon" /> : <CollapseIcon className="icon" />}
        </span>
      </label>
      <div 
        className={`array-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`} 
        data-wrapper="is-array"
      >
        {field.value && field.value.map((item, index) => (
          <div key={index} className="form-element is-object label-exists no-drop" draggable="true">
            {/* Child objects will be rendered here */}
          </div>
        ))}
      </div>
      <div className="button-wrapper">
        {!implicitDef?.noDuplication && (
          <div className="add-button button">
            <AddIcon className="icon" />
          </div>
        )}
        {!implicitDef?.noDeletion && (
          <div className="delete-button">
            <DeleteIcon className="icon" />
          </div>
        )}
      </div>
    </div>
  );
};