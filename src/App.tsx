import React, { useEffect, useState, useRef } from 'react';
import './App.css';

type JsonItem = {
  id: string;
  isActive: boolean;
  picture: string;
  age: number;
  name: string;
  email: string;
  address: string;
  about: string;
  registered: string;
};

const App: React.FC = () => {
  const [data, setData] = useState<JsonItem[]>([]);
  const [editableIndex, setEditableIndex] = useState<number | null>(null);
  const [originalData, setOriginalData] = useState<JsonItem[]>([]);
  const [visibleItems, setVisibleItems] = useState<JsonItem[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);
  const loader = useRef<HTMLDivElement | null>(null);

  const loadMoreItems = () => {
    const newVisibleCount = visibleItems.length + 20;
    setVisibleItems(data.slice(0, newVisibleCount));
  };

  useEffect(() => {
    fetch('/data.json')
      .then((response) => response.json())
      .then((jsonData) => {

        const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
        const randomCount = getRandomInt(1, 1000);
        const randomData = jsonData.slice(0, randomCount);
        console.log(randomData);
        setData(randomData);
        setOriginalData(randomData);
        setVisibleItems(randomData.slice(0, 20)); // Initially load 20 items
      });
  }, []);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreItems();
      }
    });

    if (loader.current) {
      observer.current.observe(loader.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [visibleItems]);

  const handleEdit = (index: number) => {
    setEditableIndex(index);
  };

  const handleCancel = () => {
    setEditableIndex(null);
    setData(originalData);
  };

  const handleChange = (index: number, key: string, value: string | number | boolean) => {
    setData(prevData => prevData.map((item, idx) =>
      idx === index ? { ...item, [key]: value } : item,
    ));
  };
  
  const formatDateString = (dateString: string): string => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().substr(0, 10);
  };

  return (
    <div className="App">
      {visibleItems.map((item, index) => (
        <div key={item.id} className="json-row">
          <div className="json-controls">
            {editableIndex !== index ? (
              <button onClick={() => handleEdit(index)}>
                Edit
              </button>
            ) : (
              <button onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className="json-field">
              {key !== 'id' ? (
                typeof value === 'boolean' ? (
                  <>
                    <label>{key}: </label>
                    {editableIndex === index ? (
                      <>
                        <input
                          type="radio"
                          name={`${index}-${key}`}
                          checked={value === true}
                          onChange={() => handleChange(index, key, true)}
                        />
                        True
                        <input
                          type="radio"
                          name={`${index}-${key}`}
                          checked={value === false}
                          onChange={() => handleChange(index, key, false)}
                        />
                        False
                      </>
                    ) : (
                      <span>{value ? 'True' : 'False'}</span>
                    )}
                  </>
                ) : typeof value === 'number' ? (
                  <>
                    <label>{key}: </label>
                    {editableIndex === index ? (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleChange(index, key, parseInt(e.target.value, 10))}
                      />
                    ) : (
                      <span>{value}</span>
                    )}
                  </>
                ) : key === 'email' ? (
                  <>
                    <label>{key}: </label>
                    {editableIndex === index ? (
                      <input
                        type="email"
                        value={value}
                        onChange={(e) => handleChange(index, key, e.target.value)}
                      />
                    ) : (
                      <span>{value}</span>
                    )}
                  </>
                ) : key === 'registered' ? (
                  <>
                    <label>{key}: </label>
                    {editableIndex === index ? (
                      <input
                        type="date"
                        value={formatDateString(value)}
                        onChange={(e) => handleChange(index, key, e.target.value)}
                      />
                    ) : (
                      <span>{formatDateString(value)}</span>
                    )}
                  </>
                ) : typeof value === 'string' && value.length > 100 ? (
                  <>
                    <label>{key}: </label>
                    {editableIndex === index ? (
                      <textarea
                        value={value}
                        onChange={(e) => handleChange(index, key, e.target.value)}
                      />
                    ) : (
                      <span>{value}</span>
                    )}
                  </>
                ) : (
                  <>
                    <label>{key}: </label>
                    {editableIndex === index ? (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(index, key, e.target.value)}
                      />
                    ) : (
                      <span>{value}</span>
                    )}
                  </>
                )
              ) : (
                <div>{`${key}: ${value}`}</div>
              )}
            </div>
          ))}
        </div>
      ))}
      <div ref={loader} className="loader">Loading more items...</div>
    </div>
  );
};

export default App;
