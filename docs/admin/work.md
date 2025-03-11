---
title: Inline Add Form with Checklist
---

import React, { useState, useEffect, useRef } from 'react';

export default function InlineAddForm() {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([]);
  const tableRef = useRef(null);

  // Load saved data from local storage
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('checklistItems')) || [];
    setItems(savedItems);
  }, []);

  // Save to local storage when items change
  useEffect(() => {
    localStorage.setItem('checklistItems', JSON.stringify(items));
  }, [items]);

  // Add new item to the table
  const handleAdd = () => {
    if (title.trim()) {
      setItems([...items, { title, UI: false, Frontend: false, Backend: false, Testing: false }]);
      setTitle('');
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (index, key) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, [key]: !item[key] } : item
    );
    setItems(updatedItems);
  };

  // Handle row deletion
  const handleDelete = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  // Make table columns resizable
  useEffect(() => {
    if (!tableRef.current) return;
    const table = tableRef.current;
    const cols = table.querySelectorAll('th');
    let isResizing = false;
    let startX, startWidth, targetCol;

    cols.forEach((col) => {
      const resizer = document.createElement('div');
      resizer.style.width = '5px';
      resizer.style.cursor = 'col-resize';
      resizer.style.position = 'absolute';
      resizer.style.top = '0';
      resizer.style.right = '0';
      resizer.style.bottom = '0';
      resizer.style.zIndex = '1';
      col.style.position = 'relative';
      col.appendChild(resizer);

      resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.pageX;
        startWidth = col.offsetWidth;
        targetCol = col;
      });

      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const newWidth = startWidth + (e.pageX - startX);
        targetCol.style.width = `${newWidth}px`;
      });

      document.addEventListener('mouseup', () => {
        isResizing = false;
      });
    });
  }, [items]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Inline Add Form</h2>

      {/* Title Input and Add Button */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            flex: '1',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: '8px 15px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>

      {/* Display Table */}
      {items.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table ref={tableRef} style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            border: '1px solid #ddd',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', minWidth: '150px' }}>Title</th>
                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #ddd', minWidth: '100px' }}>UI</th>
                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #ddd', minWidth: '100px' }}>Frontend</th>
                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #ddd', minWidth: '100px' }}>Backend</th>
                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #ddd', minWidth: '100px' }}>Testing</th>
                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #ddd', minWidth: '80px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{item.title}</td>
                  {['UI', 'Frontend', 'Backend', 'Testing'].map((key) => (
                    <td key={key} style={{ textAlign: 'center', padding: '10px' }}>
                      <input
                        type="checkbox"
                        checked={item[key]}
                        onChange={() => handleCheckboxChange(index, key)}
                      />
                    </td>
                  ))}
                  <td style={{ textAlign: 'center', padding: '10px' }}>
                    <button
                      onClick={() => handleDelete(index)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
