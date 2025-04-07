
'use client';
import React, { useState, useRef, useEffect } from 'react';
const renderGroundwaterTrend = () => (
    <div>
      <h3 className="font-medium text-blue-600 mb-4">Groundwater Trend</h3>
      
      {renderWellSelection()}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Method for Computing Trend</label>
        <select className="w-full p-2 border rounded-md text-sm">
          <option value="">Select Method...</option>
          <option value="linear">Mann-Kendall Test</option>
          <option value="mann">Sen’sSlope Estimator</option>
          <option value="moving">Change Point Analysis</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
        <select className="w-full p-2 border rounded-md text-sm">
          <option value="">Select Period...</option>
          <option value="5years">Last 5 Years</option>
          <option value="10years">Last 10 Years</option>
          <option value="all">All Available Data</option>
        </select>
      </div>
      
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md">
        Apply
      </button>
    </div>
  );
