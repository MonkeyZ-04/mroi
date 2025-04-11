import '../styles/tools_control.css';

function Tools({ selectedTool, onChange }) {
  return (
    <div className='tools_box'>
      <p className='title'>Select tools</p>
      <label className="tool">
        <input
          type="radio"
          name="myRadio"
          value="line"
          checked={selectedTool === 'line'}
          onChange={onChange}
        />
        Line
      </label>
      <label  className="tool">
        <input
          type="radio"
          name="myRadio"
          value="poly"
          checked={selectedTool === 'poly'}
          onChange={onChange}
        />
        Poly
      </label>
      <label  className="tool">
        <input
          type="radio"
          name="myRadio"
          value="rect"
          checked={selectedTool === 'rect'}
          onChange={onChange}
        />
        Rectangle
      </label>
    </div>
  );
}

export default Tools;
