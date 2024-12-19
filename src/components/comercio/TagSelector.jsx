import React from 'react';
import Select, { components } from 'react-select';

const CheckboxOption = (props) => {
    return (
        <components.Option 
            {...props} 
            isSelected={props.isSelected}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                    type="checkbox"
                    checked={props.isSelected}
                    onChange={() => {
                        props.selectOption(props.data);
                    }}
                    style={{ marginRight: '10px' }}
                />
                <label>{props.label}</label>
            </div>
        </components.Option>
    );
};

const MultiValue = (props) => {
    return (
        <components.MultiValue {...props}>
            <span>{props.children}</span>
        </components.MultiValue>
    );
};

const TagSelector = ({ tags, selectedTags, onChange }) => {
    // Convertir los tags a un formato compatible con react-select
    const options = tags.map(tag => ({ 
        value: tag.id, 
        label: tag.nombre 
    }));

    // Filtrar los tags seleccionados
    const currentSelectedOptions = options.filter(option => 
        selectedTags.some(selectedTag => 
            typeof selectedTag === 'number' 
                ? selectedTag === option.value 
                : selectedTag.id === option.value
        )
    );

    return (
        <Select
            isMulti
            options={options}
            value={currentSelectedOptions}
            onChange={(selectedOptions) => {
                const selectedIds = selectedOptions 
                    ? selectedOptions.map(option => option.value) 
                    : [];
                onChange(selectedIds);
            }}
            components={{
                Option: (props) => (
                    <CheckboxOption 
                        {...props} 
                        selectOption={(option) => {
                            // Si el tag ya está seleccionado, lo deseleccionamos
                            const currentSelected = currentSelectedOptions.map(opt => opt.value);
                            const newSelected = currentSelected.includes(option.value)
                                ? currentSelected.filter(id => id !== option.value)
                                : [...currentSelected, option.value];
                            
                            // Llamar a onChange con los nuevos tags seleccionados
                            onChange(newSelected);
                        }}
                    />
                ),
                MultiValue: MultiValue
            }}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            placeholder="Selecciona tags"
            styles={{
                option: (provided, state) => ({
                    ...provided,
                    display: 'flex',
                    alignItems: 'center'
                })
            }}
        />
    );
};

export default TagSelector;
