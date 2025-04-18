import Select from 'react-select';

function SelectDropdown({ options, value, onChange, placeholder }) {
  return (
    <div className='select_dropdown'>
      <Select
        options={options}
        value={options.find(option => option.value === value)}
        onChange={(selected) => onChange(selected.value)}
        isSearchable
        placeholder={placeholder}
        styles={{minwidth:'250px'}}
      />
    </div>
  );
}

export default SelectDropdown;
