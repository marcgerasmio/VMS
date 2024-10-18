import Sidebar from './Sidebar.jsx';
import { RiArchiveStackFill } from 'react-icons/ri';
import { FaFilePdf } from 'react-icons/fa';
import { MdEventAvailable } from 'react-icons/md';
import supabase from '../supabaseClient.jsx';
import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';


const Archives = () => {
  const [visitorsData, setVisitorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [total_visitors, setTotalVisitors] = useState('');
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');

  const fetch_visitors = async () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const dd = String(today.getDate()).padStart(2, '0'); 

    const formattedDate = `${yyyy}-${mm}-${dd}`;
    try {
      const { error, data } = await supabase
        .from('visitors')
        .select('*');
      
      if (error) throw error;

      setVisitorData(data);
      setTotalVisitors(data.length);
      setFilteredData(data); 

    } catch (error) {
      alert("An unexpected error occurred.");
      console.error('Error during fetching visitors:', error.message);
    }
  }

  const filter_date = async (date) => {
    if (date === '') {
      fetch_visitors();
    } else {
      const { error, data } = await supabase
        .from('visitors')
        .select('*')
        .eq('date', date);
      
      if (error) throw error;

      setVisitorData(data);
      setFilteredData(data);  
    }
  };

  useEffect(() => {
    fetch_visitors();
  }, []);

  useEffect(() => {
    const searchTerm = search.toLowerCase();
    const newData = visitorsData.filter(data =>
      data.name ? data.name.toLowerCase().includes(searchTerm) : false
    );
    setFilteredData(newData);  
  }, [search, visitorsData]); 

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  function extractTimeFromDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.text('Visitor Archives', 14, 16);
    
    const tableData = filteredData.map(visitor => [
      visitor.name,
      visitor.contact_num,
      visitor.visit_purpose,
      visitor.department,
      visitor.vehicle,
      visitor.time_in ? extractTimeFromDate(visitor.time_in) : '',
      visitor.time_out ? extractTimeFromDate(visitor.time_out) : '',
      visitor.date,
    ]);


    doc.autoTable({
      head: [['Name', 'Contact No.', 'Purpose of Visit', 'Department', 'Vehicle', 'Time In', 'Time Out', 'Date']],
      body: tableData,
      startY: 30,
    });

    doc.save('visitor_archives.pdf');
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 font-mono">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
          <div className="w-full bg-white rounded-lg shadow-lg p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
              <div className="flex items-center mb-4 sm:mb-0">
                <span className="mr-2">
                  <RiArchiveStackFill size={30} />
                </span>
                <h2 className="text-lg lg:text-xl font-bolder">
                  Archives & Report Information
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full sm:w-auto">
                <label className="input input-bordered flex items-center gap-2 w-full sm:w-auto">
                  <input type="text" className="grow" placeholder="Search" onChange={handleSearchChange} />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </label>
                <button className="w-full sm:w-auto px-4 py-2 font-medium text-white bg-orange-500 rounded hover:bg-orange-400 flex items-center justify-center"
                 onClick={exportToPDF} >
                  <FaFilePdf className="me-1" size={22} />
                  Export as PDF
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 mt-8">
              <label className="input flex items-center gap-3 w-full sm:w-auto">
                <MdEventAvailable size={20} /> :
                <input type="date" required onChange={(e) => filter_date(e.target.value)} />
              </label>
              <label className="input flex items-center w-full sm:w-auto">
                Total No. of Visitors : &nbsp;
                <input placeholder={total_visitors} type="text" disabled />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Contact No.</th>
                    <th className="text-left p-2">Purpose of Visit</th>
                    <th className="text-left p-2">Department</th>
                    <th className="text-left p-2">Vehicle</th>
                    <th className="text-left p-2 border-b-4 border-green-400">
                      Time In
                    </th>
                    <th className="text-left p-2 border-b-4 border-red-400">
                      Time Out
                    </th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((visitor, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{visitor.name}</td>
                      <td className="p-2">{visitor.contact_num}</td>
                      <td className="p-2">{visitor.visit_purpose}</td>
                      <td className="p-2">{visitor.department}</td>
                      <td className="p-2">{visitor.vehicle}</td>
                      <td className="p-2">{visitor.time_in === null ? '' : extractTimeFromDate(visitor.time_in)}</td>
                      <td className="p-2">{visitor.time_out === null ? '' : extractTimeFromDate(visitor.time_out)}</td>
                      <td className="p-2">{visitor.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Archives;
