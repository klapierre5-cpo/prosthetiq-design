import logo from './assets/prosthetiq_logic_logo.png';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

function App() {

  const designPhases = [
  'Immediate Post-Operative',
  'Initial',
  'Preparatory',
  'Definitive',
  'Socket Replacement',
];
  
  const [answers, setAnswers] = useState({});
  const [designRows, setDesignRows] = useState([]);
  const [selectedDesignPhase, setSelectedDesignPhase] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [replacementReason, setReplacementReason] = useState('');
  const [selectedDesignFeatures, setSelectedDesignFeatures] = useState([]);
  const [selectedBaseCode, setSelectedBaseCode] = useState(null);
  const [selectedFunctionalTasks, setSelectedFunctionalTasks] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [designSessionId, setDesignSessionId] = useState('');

const [expandedSections, setExpandedSections] = useState({
  socketDesign: false,
  suspension: false,
  softGoods: false,
  protectiveCovers: false,
});

const clearAll = async () => {
  if (designSessionId) {
    const { error } = await supabase
      .from('design_component_selections')
      .delete()
      .eq('session_id', designSessionId);

    if (error) {
      console.error(
        'Error clearing design component selections:',
        error
      );
    }
  }

  setAnswers({});
  setSelectedDesignPhase('');
  setSelectedCategory('');
  setReplacementReason('');
  setSelectedDesignFeatures([]);
  setSelectedBaseCode(null);
  setSelectedFunctionalTasks([]);
  setSelectedComponents([]);

  setExpandedSections({
    socketDesign: false,
    suspension: false,
    softGoods: false,
    protectiveCovers: false,
  });

  const newSessionId = crypto.randomUUID();

  localStorage.setItem(
    'designSessionId',
    newSessionId
  );

  setDesignSessionId(newSessionId);
};

useEffect(() => {
  const params = new URLSearchParams(
    window.location.search
  );

  const sessionFromUrl =
    params.get('designSession');

  if (sessionFromUrl) {
    localStorage.setItem(
      'designSessionId',
      sessionFromUrl
    );

    setDesignSessionId(sessionFromUrl);

    console.log(
      'Design Session From URL:',
      sessionFromUrl
    );

    return;
  }

  const existingSession =
    localStorage.getItem('designSessionId');

  if (
  existingSession &&
  existingSession !== 'test123'
) {
  setDesignSessionId(existingSession);
}
else {
    const newSessionId =
      crypto.randomUUID();

    localStorage.setItem(
      'designSessionId',
      newSessionId
    );

    setDesignSessionId(newSessionId);
  }
}, []);

useEffect(() => {
  const fetchDesignRows = async () => {
    const { data, error } = await supabase
      .from('clinical_benefits_library_design')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('Design rows:', data);
      setDesignRows(data);
    }
  };

  fetchDesignRows();
}, []);

const fetchSelectedComponents = useCallback(async () => {
  if (!designSessionId) return;

  const { data, error } = await supabase
    .from('design_component_selections')
    .select('*')
    .eq('session_id', designSessionId);

  if (error) {
    console.error(
      'Error fetching selected components:',
      error
    );
  } else {
    console.log(
      'Selected components:',
      data
    );

    setSelectedComponents(data || []);
  }
}, [designSessionId]);

useEffect(() => {
  fetchSelectedComponents();
}, [fetchSelectedComponents]);

useEffect(() => {
  const handleFocus = () => {
    fetchSelectedComponents();
  };

  window.addEventListener('focus', handleFocus);

  return () => {
    window.removeEventListener(
      'focus',
      handleFocus
    );
  };
}, [fetchSelectedComponents]);

const filteredCategories = [
  ...new Set(
    designRows
      .filter(
        (row) =>
          row.device_phase?.includes(selectedDesignPhase)
      )
      .map((row) => row.category)
      .filter(Boolean)
  ),
];

const socketDesignRows = designRows.filter(
  (row) =>
    row.category ===
    `${selectedCategory.replace(' Base', '')} Socket Design`
);

const softGoodsRows = designRows.filter(
  (row) =>
    row.category ===
    `${selectedCategory.replace(' Base', '')} Soft Goods`
);

const miscellaneousRows = designRows.filter(
  (row) =>
    row.category ===
    `${selectedCategory.replace(' Base', '')} Miscellaneous`
);

const suspensionRows = designRows.filter(
  (row) =>
    row.category ===
    'Lower Extremity Fit & Suspension'
);

const baseCodeRows = designRows.filter(
  (row) =>
    row.category === selectedCategory &&
    row.device_phase?.includes(selectedDesignPhase)
);

const functionalTasks = {
  K1: [
    'Cognitive ability to safely use a prosthesis',
    'Safe transfers',
    'Ambulation on a flat surface inside the home',
  ],

  K2: [
    'Ambulation on flat, smooth surfaces outside the home',
    'Negotiation of a curb',
    'Access to public or private transportation',
    'Negotiation of 1–2 stairs',
    'Traversal of low-level environmental barriers (e.g. ADA-compliant ramp)',
  ],

  K3: [
    'Walking on terrain that varies in texture and level',
    'Negotiation of 3–7 consecutive stairs',
    'Opening and closing doors while ambulating',
    'Ambulation through crowded areas',
    'Variable cadence ambulation',
    'Crossing a controlled intersection within the allowed time',
    'Dual ambulation tasks (e.g. carrying an item while walking)',
  ],

  K4: [
    'Running',
    'Repetitive stair climbing',
    'Climbing steep hills',
    'Caregiving for another individual',
    'Home maintenance (e.g. repairs, cleaning)',
  ],
};

  const instructionStyle = {
    color: '#007BFF',
    fontWeight: '700',
    marginBottom: '15px',
  };
  
  const getKLevel = () => {
  if (answers.K_LEVEL === 'K1') return 'K1';
  if (answers.K_LEVEL === 'K2') return 'K2';
  if (answers.K_LEVEL === 'K3') return 'K3';
  if (answers.K_LEVEL === 'K4') return 'K4';
  return 'Unknown';
};

  const getKLevelSentence = () => {
    const kLevel = getKLevel();

    if (kLevel === 'K1') {
      return 'The patient demonstrates K1-level ambulation with household mobility potential.';
    }
    if (kLevel === 'K2') {
      return 'The patient demonstrates K2-level ambulation with limited community mobility.';
    }
    if (kLevel === 'K3') {
      return 'The patient demonstrates K3-level ambulation with variable cadence and community mobility demands.';
    }
    if (kLevel === 'K4') {
      return 'The patient demonstrates K4-level ambulation with high-level activity demands beyond basic ambulation.';
    }
    return 'The patient’s functional level is currently unclear based on the information provided.';
  };


const kLevel = getKLevel();
const kLevelSentence = getKLevelSentence();

const copyClinicalSummary = async () => {
  const selectedFeatureRows = designRows.filter((row) =>
    selectedDesignFeatures.includes(row.id)
  );

  const text = `
Clinical Design Summary

K-Level: ${kLevel}

The patient is being evaluated for a ${selectedDesignPhase || '________'} prosthetic design.

${kLevelSentence}

Functional Characteristics Demonstrated:
${selectedFunctionalTasks.length > 0
  ? selectedFunctionalTasks.map((task) => `• ${task}`).join('\n')
  : '• No functional characteristics selected'}

Patient Presentation:
${answers.NEW_PROSTHETIC_USER === 'yes'
  ? 'The patient presents as a new prosthetic user with the motivation of achieving safe and functional ambulation using a prosthetic device. Prosthetic intervention is expected to improve mobility, independence with activities of daily living, and facilitate return toward the patient’s prior level of function.'
  : replacementReason === 'irreparable'
  ? 'The patient presents as an established prosthetic user whose current prosthesis demonstrates irreparable wear and is no longer able to safely or effectively meet the patient’s functional needs.'
  : replacementReason === 'physiological'
  ? 'The patient presents with physiological changes affecting socket fit and prosthetic function, necessitating replacement prosthetic management to restore safe and effective ambulation.'
  : replacementReason === 'repair_cost'
  ? 'The patient’s current prosthesis requires extensive repair, with projected repair costs exceeding 60% of replacement value, making replacement prosthetic intervention medically and economically appropriate.'
  : 'The patient is an existing prosthetic user requiring replacement prosthetic evaluation.'}

Selected Base Prosthetic Design:
${selectedBaseCode
  ? `(${selectedBaseCode.code}) ${selectedBaseCode.construction_type} — ${selectedBaseCode.clinical_benefit_statement}`
  : 'No base prosthetic design selected'}

Selected Design Features:
${selectedFeatureRows.length > 0
  ? selectedFeatureRows
      .map(
        (row) =>
          `(${row.code}) ${row.construction_type} — ${row.clinical_benefit_statement}`
      )
      .join('\n')
  : 'No design features selected'}

Selected Prosthetic Components:
${selectedComponents.length > 0
  ? selectedComponents
      .map(
        (component) =>
          `• ${component.product_name}\n${component.category}\n${
            component.selected_benefits
              ?.map(
                (benefit) =>
                  `(${benefit.code}) ${benefit.category} ${benefit.clinical_benefit_statement}`
              )
              .join('\n') || ''
          }`
      )
      .join('\n\n')
  : 'No prosthetic components selected'}
`;

  await navigator.clipboard.writeText(text.trim());
  alert('Clinical Design Summary copied to clipboard.');
};

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <img src={logo} alt="ProsthetIQ Logic Logo" style={{ height: '100px' }} />
        <h1>ProsthetIQ Design</h1>
<p style={{ fontSize: '12px', color: '#666' }}>
  Session ID: {designSessionId}
</p>
      </div>

<h2>Treatment Phase</h2>

<p style={instructionStyle}>
  Select the current phase of treatment.
</p>

<select
  value={selectedDesignPhase}
  onChange={(e) => setSelectedDesignPhase(e.target.value)}
  style={{
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '25px',
    minWidth: '300px',
  }}
>
  <option value="">Select Design Phase</option>

  {designPhases.map((phase) => (
    <option key={phase} value={phase}>
      {phase}
    </option>
  ))}
</select>

{selectedDesignPhase && (
  <>
    <h2>Amputation Level</h2>

    <p style={instructionStyle}>
      Select the Amputation Level.
    </p>

    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      style={{
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '25px',
        minWidth: '300px',
      }}
    >
      <option value="">Select Category</option>

      {filteredCategories.map((category) => (
        <option key={category} value={category}>
          {category.replace(' Base', '')}
        </option>
      ))}
    </select>
  </>
)}

<h2>Functional Level</h2>

<p style={instructionStyle}>
  Select the patient’s current functional level.
</p>

<div
  style={{
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '25px',
  }}
>
  {['K1', 'K2', 'K3', 'K4'].map((level) => (
    <button
      key={level}
      onClick={() => {
  setAnswers((prev) => ({
    ...prev,
    K_LEVEL: level,
  }));

  setSelectedFunctionalTasks(
    functionalTasks[level]
  );
}}
      style={{
        padding: '12px 20px',
        borderRadius: '8px',
        border:
          answers.K_LEVEL === level
            ? '2px solid #6f42c1'
            : '1px solid #ccc',
        backgroundColor:
          answers.K_LEVEL === level ? '#f3ebff' : 'white',
        cursor: 'pointer',
        fontWeight: '700',
        minWidth: '80px',
      }}
    >
      {level}
    </button>
  ))}
</div>

{answers.K_LEVEL && (
  <div style={{ marginBottom: '25px' }}>
    <h3>
      {answers.K_LEVEL} Functional Characteristics
    </h3>

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '15px',
      }}
    >
      {functionalTasks[answers.K_LEVEL]?.map((task) => {
        const isSelected =
          selectedFunctionalTasks.includes(task);

        return (
          <label
            key={task}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {
                if (isSelected) {
                  setSelectedFunctionalTasks(
                    selectedFunctionalTasks.filter(
                      (t) => t !== task
                    )
                  );
                } else {
                  setSelectedFunctionalTasks([
                    ...selectedFunctionalTasks,
                    task,
                  ]);
                }
              }}
              style={{ marginTop: '4px' }}
            />

            <span>{task}</span>
          </label>
        );
      })}
    </div>
  </div>
)}


      <h2>Patient Presentation</h2>

<p style={instructionStyle}>
  Is the patient a new prosthetic user?
</p>

<label style={{ display: 'block', marginBottom: '8px' }}>
  <input
    type="radio"
    name="newProstheticUser"
    checked={answers.NEW_PROSTHETIC_USER === 'yes'}
    onChange={() =>
      setAnswers((prev) => ({
        ...prev,
        NEW_PROSTHETIC_USER: 'yes',
        CC001: false,
        CC002: false,
        CC003: false,
        CC004: false,
      }))
    }
    style={{ marginRight: '8px' }}
  />
  Yes — new prosthetic user
</label>

<label style={{ display: 'block', marginBottom: '12px' }}>
  <input
    type="radio"
    name="newProstheticUser"
    checked={answers.NEW_PROSTHETIC_USER === 'no'}
    onChange={() =>
      setAnswers((prev) => ({
        ...prev,
        NEW_PROSTHETIC_USER: 'no',
      }))
    }
    style={{ marginRight: '8px' }}
  />
  No — patient has an existing prosthesis
</label>

{answers.NEW_PROSTHETIC_USER === 'no' && (
  <>
    <p style={instructionStyle}>
      Select the primary reason replacement prosthetic care is required.
    </p>

    <select
      value={replacementReason}
      onChange={(e) =>
        setReplacementReason(e.target.value)
      }
      style={{
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '25px',
        minWidth: '350px',
      }}
    >
      <option value="">
        Select Replacement Reason
      </option>

      <option value="irreparable">
        Irreparable wear or damage
      </option>

      <option value="physiological">
        Physiological change (weight or residual limb change)
      </option>

      <option value="repair_cost">
        Repair cost exceeds 60% of replacement
      </option>
    </select>
  </>
)}

{baseCodeRows.length > 0 && (
  <div style={{ marginBottom: '25px' }}>
    <h2>Base Code</h2>

    <p style={instructionStyle}>
      Select the base design.
    </p>

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {baseCodeRows.map((row) => (
        <label
          key={row.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <input
            type="radio"
            name="baseCode"
            checked={selectedBaseCode?.id === row.id}
            onChange={() => setSelectedBaseCode(row)}
            style={{ marginTop: '4px' }}
          />

          <span>
            <strong>({row.code})</strong>{' '}
            {row.construction_type}
          </span>
        </label>
      ))}
    </div>
  </div>
)}

{socketDesignRows.length > 0 && (
  <>
    <button
  onClick={() =>
    setExpandedSections((prev) => ({
      ...prev,
      socketDesign: !prev.socketDesign,
    }))
  }
  style={{
    width: '100%',
    textAlign: 'left',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#f3ebff',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '10px',
  }}
>
  {expandedSections.socketDesign ? '▼' : '▶'} Socket Design
</button>

    {expandedSections.socketDesign && (
  <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '25px',
      }}
    >
      {socketDesignRows.map((row) => {
        const isSelected =
          selectedDesignFeatures.includes(row.id);

        return (
          <label
            key={row.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {
                if (isSelected) {
                  setSelectedDesignFeatures(
                    selectedDesignFeatures.filter(
                      (id) => id !== row.id
                    )
                  );
                } else {
                  setSelectedDesignFeatures([
                    ...selectedDesignFeatures,
                    row.id,
                  ]);
                }
              }}
              style={{ marginTop: '4px' }}
            />

            <span>
  {row.construction_type}
</span>

          </label>
        );
      })}
    </div>
)}
  </>
)}

{suspensionRows.length > 0 && (
  <>
    <button
  onClick={() =>
    setExpandedSections((prev) => ({
      ...prev,
      suspension: !prev.suspension,
    }))
  }
  style={{
    width: '100%',
    textAlign: 'left',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#f3ebff',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '10px',
  }}
>
  {expandedSections.suspension ? '▼' : '▶'} Suspension
</button>

    {expandedSections.suspension && (
  <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '25px',
      }}
    >
      {suspensionRows.map((row) => {
        const isSelected =
          selectedDesignFeatures.includes(row.id);

        return (
          <label
            key={row.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {
                if (isSelected) {
                  setSelectedDesignFeatures(
                    selectedDesignFeatures.filter(
                      (id) => id !== row.id
                    )
                  );
                } else {
                  setSelectedDesignFeatures([
                    ...selectedDesignFeatures,
                    row.id,
                  ]);
                }
              }}
              style={{ marginTop: '4px' }}
            />

            <span>
  {row.construction_type}
</span>

          </label>
        );
      })}
    </div>
)}
  </>
)}

{softGoodsRows.length > 0 && (
  <>
    <button
  onClick={() =>
    setExpandedSections((prev) => ({
      ...prev,
      softGoods: !prev.softGoods,
    }))
  }
  style={{
    width: '100%',
    textAlign: 'left',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#f3ebff',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '10px',
  }}
>
  {expandedSections.softGoods ? '▼' : '▶'} Soft Goods
</button>

    {expandedSections.softGoods && (
  <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '25px',
      }}
    >
      {softGoodsRows.map((row) => {
        const isSelected =
          selectedDesignFeatures.includes(row.id);

        return (
          <label
            key={row.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {
                if (isSelected) {
                  setSelectedDesignFeatures(
                    selectedDesignFeatures.filter(
                      (id) => id !== row.id
                    )
                  );
                } else {
                  setSelectedDesignFeatures([
                    ...selectedDesignFeatures,
                    row.id,
                  ]);
                }
              }}
              style={{ marginTop: '4px' }}
            />

            <span>
  {row.construction_type}
</span>

          </label>
        );
      })}
    </div>
)}
  </>
)}

{miscellaneousRows.length > 0 && (
  <>
    <button
  onClick={() =>
    setExpandedSections((prev) => ({
      ...prev,
      protectiveCovers: !prev.protectiveCovers,
    }))
  }
  style={{
    width: '100%',
    textAlign: 'left',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#f3ebff',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '10px',
  }}
>
  {expandedSections.protectiveCovers ? '▼' : '▶'} Protective Covers
</button>

    {expandedSections.protectiveCovers && (
  <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '25px',
      }}
    >
      {miscellaneousRows.map((row) => {
        const isSelected =
          selectedDesignFeatures.includes(row.id);

        return (
          <label
            key={row.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {
                if (isSelected) {
                  setSelectedDesignFeatures(
                    selectedDesignFeatures.filter(
                      (id) => id !== row.id
                    )
                  );
                } else {
                  setSelectedDesignFeatures([
                    ...selectedDesignFeatures,
                    row.id,
                  ]);
                }
              }}
              style={{ marginTop: '4px' }}
            />

            <span>
  {row.construction_type}
</span>
          </label>
        );
      })}
    </div>
)}
  </>
)}
             <div
  style={{
    marginTop: '20px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  }}
>
  <button
    onClick={clearAll}
    style={{
      padding: '10px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#444',
      color: 'white',
      cursor: 'pointer',
    }}
  >
    Clear All
  </button>

  <button
    onClick={copyClinicalSummary}
    style={{
      padding: '10px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#6f42c1',
      color: 'white',
      cursor: 'pointer',
      fontWeight: '700',
    }}
  >
    Copy Text
  </button>
</div>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <h2>Clinical Design Summary</h2>
<button
  onClick={() => {
    window.open(
      `https://prosthetiq.org?designSession=${designSessionId}`,
      '_blank'
    );
  }}
  style={{
  display: 'inline-block',
  padding: '12px 18px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#6f42c1',
  color: 'white',
  cursor: 'pointer',
  marginTop: '10px',
  marginBottom: '20px',
  fontWeight: '700',
  fontSize: '16px',
  minWidth: '280px',
}}
>
  Select Components in ProsthetIQ
</button>
        <p>
          <strong>K-Level:</strong> {kLevel}
        </p>
        <p>
  	The patient is being evaluated for a{' '}
  	<strong>{selectedDesignPhase}</strong> prosthetic design.
	</p>
        <p>{kLevelSentence}</p>

{selectedFunctionalTasks.length > 0 && (
  <div style={{ marginTop: '15px' }}>
    <h3>Functional Characteristics Demonstrated</h3>

    {selectedFunctionalTasks.map((task) => (
      <p key={task}>• {task}</p>
    ))}
  </div>
)}

	<p>
  {answers.NEW_PROSTHETIC_USER === 'yes'
    ? 'The patient presents as a new prosthetic user with the motivation of achieving safe and functional ambulation using a prosthetic device. Prosthetic intervention is expected to improve mobility, independence with activities of daily living, and facilitate return toward the patient’s prior level of function.'
    : replacementReason === 'irreparable'
? 'The patient presents as an established prosthetic user whose current prosthesis demonstrates irreparable wear and is no longer able to safely or effectively meet the patient’s functional needs.'

: replacementReason === 'physiological'
? 'The patient presents with physiological changes affecting socket fit and prosthetic function, necessitating replacement prosthetic management to restore safe and effective ambulation.'

: replacementReason === 'repair_cost'
? 'The patient’s current prosthesis requires extensive repair, with projected repair costs exceeding 60% of replacement value, making replacement prosthetic intervention medically and economically appropriate.'

: 'The patient is an existing prosthetic user requiring replacement prosthetic evaluation.'}
</p>

{selectedBaseCode && (
  <div style={{ marginTop: '20px' }}>
    <h3>Selected Base Prosthetic Design</h3>

    <p>
      <strong>({selectedBaseCode.code})</strong>{' '}
      <strong>{selectedBaseCode.construction_type}</strong>{' '}
      — {selectedBaseCode.clinical_benefit_statement}
    </p>
  </div>
)}

{selectedDesignFeatures.length > 0 && (
  <div style={{ marginTop: '20px' }}>
    <h3>Selected Design Features</h3>

    {designRows
      .filter((row) =>
        selectedDesignFeatures.includes(row.id)
      )
      .map((row) => (
        <p key={row.id}>
  <strong>({row.code})</strong>{' '}
  <strong>{row.construction_type}</strong> —{' '}
  {row.clinical_benefit_statement}
</p>
      ))}
  </div>
)}
{selectedComponents.length > 0 && (
  <div style={{ marginTop: '20px' }}>
    <h3>Selected Prosthetic Components</h3>

    {[
  'FOOT',
  'KNEE',
  'HIP',
  'INTEGRATED'
].map((type) => {
      const componentsForType =
  selectedComponents.filter(
    (component) =>
      component.category
        ?.toUpperCase()
        .includes(type)
  );

      if (componentsForType.length === 0)
        return null;

      return (
        <div
          key={type}
          style={{ marginBottom: '20px' }}
        >
          <h4>
            {type.charAt(0) +
              type.slice(1).toLowerCase()}
            :
          </h4>

          {componentsForType.map(
            (component) => (
              <div
                key={component.id}
                style={{
                  marginBottom: '12px',
                }}
              >
                <p>
                  •{' '}
                  <strong>
                    {component.product_name}
                  </strong>
                </p>

		<p>{component.category}</p>

                {component.selected_benefits?.map(
                  (benefit, index) => (
                    <p
                      key={index}
                      style={{
                        marginLeft: '20px',
                      }}
                    >
                      <strong>
  			(
  			{benefit.code}
  			)
			</strong>{' '}
			{benefit.category}{' '}
			{
  			benefit.clinical_benefit_statement
			}
                    </p>
                  )
                )}
              </div>
            )
          )}
        </div>
      );
    })}
  </div>
)}
      </div>

            <p
        style={{
          marginTop: '20px',
          fontSize: '13px',
          color: '#666',
          textAlign: 'center',
          lineHeight: '1.5',
        }}
      >
        ProsthetIQ is intended to support clinical decision-making and
        documentation workflows. Clinicians remain responsible for
        verifying medical necessity, product specifications, coverage
        criteria, and the accuracy of all submitted documentation.
      </p>
    </div>
  );
}

export default App;