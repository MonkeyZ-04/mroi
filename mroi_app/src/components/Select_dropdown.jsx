import Select from 'react-select';

function SelectDropdown({ options, value, onChange, placeholder }) {
  return (
    <div className=''>
      <Select
        options={options}
        value={options.find(option => option.value === value)}
        onChange={(selected) => onChange(selected.value)}
        isSearchable
        placeholder={placeholder}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: 'white',
            borderColor: '#ccc',
            boxShadow: 'none',
            '&:hover': { borderColor: '#999' },
            minHeight: '36px',
            width:'220px',
            borderRadius:'7px',
            border:'1.5px solid rgb(222, 222, 222)'
          }),
          menu: (base) => ({
            ...base,
            zIndex: 9999
          }),

        }}
      />

    </div>
  );
}

export default SelectDropdown;