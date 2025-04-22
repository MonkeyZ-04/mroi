import '../styles/tools_control.css';

function Tools({ selectedTool, onChange }) {
  return (
    <div className='tools_box'>
      <p className='title'>Region Type</p>
      <label className="tool">
        <input
          type="radio"
          name="myRadio"
          value="line"
          checked={selectedTool === 'line'}
          onChange={onChange}
        />
        Tripwire
      </label>
      <label  className="tool">
        <input
          type="radio"
          name="myRadio"
          value="poly"
          checked={selectedTool === 'polygon'}
          onChange={onChange}
        />
        Intrusion
      </label>
      <label  className="tool">
        <input
          type="radio"
          name="myRadio"
          value="rect"
          checked={selectedTool === 'rect'}
          onChange={onChange}
        />
        Zoom
      </label>
    </div>
  );
}

export default Tools;
