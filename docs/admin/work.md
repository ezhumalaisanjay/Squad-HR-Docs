---
title: Inline Add Form with Testing Checklists
---

import React, { useState, useEffect } from 'react';

export default function InlineAddForm() {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([]);

  // Define checklist categories
  const checklistCategories = {
    "Functional Testing": [
      "Verify that all features and functionalities work as expected.",
      "Check form validations (mandatory fields, input formats, error messages).",
      "Validate user authentication (login, logout, password reset).",
      "Test user roles & permissions (admin, user, guest access).",
      "Verify data integrity (correct data retrieval and storage).",
      "Check file uploads and downloads functionality.",
      "Ensure correct behavior of front-end actions (Filtering, Bulk actions, Detailed view)."
    ],
    "UI/UX Testing": [
      "Ensure responsive design across devices and screen sizes.",
      "Validate UI elements' alignment, spacing, colors, fonts, and consistency.",
      "Verify navigation flow (all links and buttons work correctly).",
      "Check for broken images, icons, and missing elements.",
      "Validate error messages are user-friendly and clear.",
      "Ensure interactive elements (buttons, dropdowns, checkboxes) function properly."
    ],
    "Performance Testing": [
      "Test page load speed and responsiveness under different network conditions.",
      "Perform stress testing (handling multiple concurrent users).",
      "Check API response times and identify slow queries.",
      "Ensure caching and data optimization mechanisms are in place."
    ],
    "Security Testing": [
      "Test login attempts with incorrect credentials and brute-force attack prevention.",
      "Validate session timeout and re-authentication handling.",
      "Check encryption of sensitive data (passwords, tokens, API keys, etc.).",
      "Test for SQL Injection, XSS, CSRF, and other vulnerabilities.",
      "Verify role-based access control (RBAC) and restricted actions."
    ]
  };

  // Load saved items from local storage
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('checklistItems'));
    setItems(Array.isArray(savedItems) ? savedItems : []);
  }, []);

  // Save items to local storage
  useEffect(() => {
    localStorage.setItem('checklistItems', JSON.stringify(items));
  }, [items]);

  // Add a new checklist category
  const handleAdd = () => {
    if (!title.trim()) return;

    if (Array.isArray(items) && !items.some(item => item.title === title)) {
      setItems([...items, { title, expanded: false, checks: (checklistCategories[title] || []).map(text => ({ text, checked: false })) }]);
      setTitle('');
    }
  };

  // Toggle checklist visibility
  const toggleExpand = (index) => {
    setItems(items.map((item, i) => i === index ? { ...item, expanded: !item.expanded } : item));
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (index, checkIndex) => {
    const updatedItems = items.map((item, i) =>
      i === index
        ? { ...item, checks: item.checks.map((check, j) => (j === checkIndex ? { ...check, checked: !check.checked } : check)) }
        : item
    );
    setItems(updatedItems);
  };

  // Delete a checklist category
  const handleDelete = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Testing Checklist</h2>

      {/* Input for adding new categories */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Enter Testing Category"
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
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            border: '1px solid #ddd',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd', width: '50%' }}>Testing Category</th>
                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #ddd', width: '20%' }}>Completion</th>
                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #ddd', width: '10%' }}>Expand ▼</th>
                <th style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #ddd', width: '10%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const completed = item.checks.filter(check => check.checked).length;
                const total = item.checks.length;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <>
                    {/* Main Row */}
                    <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.title}</td>
                      <td style={{ textAlign: 'center', padding: '10px' }}>{percentage}%</td>
                      <td style={{ textAlign: 'center', padding: '10px', cursor: 'pointer' }} onClick={() => toggleExpand(index)}>
                        {item.expanded ? '▲' : '▼'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px' }}>
                        <button onClick={() => handleDelete(index)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                          Delete
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Checklist Table */}
                    {item.expanded && (
                      <tr>
                        <td colSpan="4" style={{ padding: '10px' }}>
                          <table width="100%" border="1" style={{ borderCollapse: 'collapse' }}>
                            <tbody>
                              {item.checks.map((check, checkIndex) => (
                                <tr key={checkIndex}>
                                  <td style={{ padding: '8px' }}>
                                    <input type="checkbox" checked={check.checked} onChange={() => handleCheckboxChange(index, checkIndex)} />
                                  </td>
                                  <td style={{ padding: '8px' }}>{check.text}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
