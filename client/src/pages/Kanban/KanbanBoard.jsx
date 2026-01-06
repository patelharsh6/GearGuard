import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMoreHorizontal, FiUser, FiFilter, FiX, FiAlertCircle, FiCheckCircle, FiPlayCircle, FiXCircle } from "react-icons/fi";
import "./Kanban.css";

/* ---------------- DATA SKELETON ---------------- */
const initialData = {
  new: [],
  progress: [],
  repaired: [],
  scrap: []
};

/* ---------------- MAIN COMPONENT ---------------- */
export default function KanbanBoard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [columns, setColumns] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [equipmentFilter, setEquipmentFilter] = useState(searchParams.get("equipment") || "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:5000/api/maintenance', config);
      const requests = response.data;
      
      const organizedData = { new: [], progress: [], repaired: [], scrap: [] };
      
      requests.forEach(request => {
        let stage = 'new';
        if (request.state === 'in_progress') stage = 'progress';
        else if (request.state === 'completed') stage = 'repaired';
        else if (request.state === 'cancelled') stage = 'scrap';
        else if (request.state === 'assigned') stage = 'new'; 
        
        if (organizedData[stage]) {
          organizedData[stage].push({
            id: request._id || request.id,
            title: request.name, 
            tech: request.technician_id ? request.technician_id.name : 'Unassigned',
            priority: request.priority === '0' ? 'Low' : request.priority === '1' ? 'Medium' : request.priority === '2' ? 'High' : 'Critical',
            equipment: request.equipment?.code || request.equipment_id || "Unknown", 
            equipmentName: request.equipment?.name || request.equipmentName || "Unknown Equipment",
            dueDate: request.scheduled_date,
            state: request.state // Keep track of current state
          });
        }
      });
      
      setColumns(organizedData);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const filteredColumns = equipmentFilter ? 
    Object.keys(columns).reduce((acc, colId) => {
      acc[colId] = columns[colId].filter(item => item.equipment === equipmentFilter);
      return acc;
    }, {}) : columns;

  function onDragStart(event) {
    const { active } = event;
    setActiveId(active.id);
    const sourceColId = findColumn(active.id);
    const item = columns[sourceColId]?.find(i => i.id === active.id);
    setActiveItem(item);
  }

  function onDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    const sourceColId = findColumn(active.id);
    let destColId = over.id;
    
    if (!['new', 'progress', 'repaired', 'scrap'].includes(destColId)) {
      destColId = findColumn(over.id);
    }

    if (!sourceColId || !destColId || sourceColId === destColId) return;

    const movedItem = columns[sourceColId]?.find(i => i.id === active.id);
    if (!movedItem) return;

    // Optimistic Update
    const sourceItems = [...columns[sourceColId]];
    const destItems = [...columns[destColId]];
    const itemIndex = sourceItems.findIndex((i) => i.id === active.id);
    
    const [moved] = sourceItems.splice(itemIndex, 1);
    destItems.push(moved);

    setColumns({ ...columns, [sourceColId]: sourceItems, [destColId]: destItems });
    updateRequestState(movedItem.id, destColId);
  }

  // ✅ NEW FUNCTION: Handle Manual Status Change from Menu
  async function handleManualMove(requestId, newColumnId) {
    const sourceColId = findColumn(requestId);
    if (sourceColId === newColumnId) return;

    const sourceItems = [...columns[sourceColId]];
    const destItems = [...columns[newColumnId]];
    const itemIndex = sourceItems.findIndex((i) => i.id === requestId);
    
    if (itemIndex === -1) return;

    const [moved] = sourceItems.splice(itemIndex, 1);
    destItems.push(moved);

    setColumns({ ...columns, [sourceColId]: sourceItems, [newColumnId]: destItems });
    await updateRequestState(requestId, newColumnId);
  }

  async function updateRequestState(requestId, columnId) {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const stateMap = { 'new': 'draft', 'progress': 'in_progress', 'repaired': 'completed', 'scrap': 'cancelled' };
      const newState = stateMap[columnId] || 'draft';
      
      await axios.patch(`http://localhost:5000/api/maintenance/${requestId}/state`, { state: newState }, config);
    } catch (error) {
      console.error('Error updating state:', error);
      fetchRequests(); // Revert on error
    }
  }

  function findColumn(itemId) {
    return Object.keys(columns).find((key) => columns[key].some((i) => i.id === itemId));
  }

  function clearFilter() {
    setEquipmentFilter("");
    navigate("/kanban", { replace: true });
  }

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <div>
          <h1>Maintenance Board</h1>
          <p>Drag tickets or use the menu to update status</p>
        </div>
        
        <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
          <FiFilter /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>Filter by Equipment</h3>
            {equipmentFilter && <button className="clear-filter-btn" onClick={clearFilter}><FiX /> Clear</button>}
          </div>
          <div className="filter-options">
            {["EQ-001", "EQ-002", "EQ-003", "EQ-004"].map(eq => (
              <button key={eq} className={`filter-chip ${equipmentFilter === eq ? "active" : ""}`} onClick={() => setEquipmentFilter(eq === equipmentFilter ? "" : eq)}>
                {eq}
              </button>
            ))}
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {Object.entries(filteredColumns).map(([colId, items]) => (
            <KanbanColumn 
              key={colId} 
              id={colId} 
              items={items} 
              onMove={handleManualMove} // 👈 Passing the move function down
            />
          ))}
        </div>
        <DragOverlay>
          {activeItem ? <KanbanCard item={activeItem} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/* ---------------- COLUMN ---------------- */
function KanbanColumn({ id, items, onMove }) {
  const { setNodeRef } = useSortable({ id });
  const titleMap = { new: "Open / To Do", progress: "In Progress", repaired: "Completed", scrap: "Cancelled" };
  const colorMap = { new: '#3b82f6', progress: '#f59e0b', repaired: '#22c55e', scrap: '#64748b' };

  return (
    <div ref={setNodeRef} className="kanban-column">
      <div className="column-header">
        <span className="column-title">
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: colorMap[id], display: "inline-block", marginRight: 8 }}></span>
          {titleMap[id]}
        </span>
        <span className="task-count">{items.length}</span>
      </div>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="column-content">
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} onMove={onMove} currentColumn={id} />
          ))}
          {items.length === 0 && <div className="empty-placeholder">No tickets</div>}
        </div>
      </SortableContext>
    </div>
  );
}

/* ---------------- CARD WITH MENU ---------------- */
function KanbanCard({ item, onMove, currentColumn, isOverlay }) {
  const navigate = useNavigate();
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: item.id });
  
  // Menu State
  const [showMenu, setShowMenu] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    borderLeft: `4px solid ${priorityColor(item.priority)}`,
  };

  const handleMenuClick = (e, targetCol) => {
    e.stopPropagation(); // Stop card click
    setShowMenu(false);
    onMove(item.id, targetCol);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="kanban-card"
      onClick={() => !isDragging && navigate(`/maintenance/${item.id}`)}
    >
      <div className="card-header-row">
        <span className="card-title">{item.title}</span>
        
        {/* MENU BUTTON */}
        {!isOverlay && (
          <div className="menu-container">
            <button 
              className="menu-btn"
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            >
              <FiMoreHorizontal />
            </button>
            
            {/* DROPDOWN MENU */}
            {showMenu && (
              <div className="card-dropdown">
                <div className="dropdown-label">Move to...</div>
                {currentColumn !== 'new' && (
                  <button onClick={(e) => handleMenuClick(e, 'new')}>
                    <div className="dot blue"></div> Open
                  </button>
                )}
                {currentColumn !== 'progress' && (
                  <button onClick={(e) => handleMenuClick(e, 'progress')}>
                     <div className="dot orange"></div> In Progress
                  </button>
                )}
                {currentColumn !== 'repaired' && (
                  <button onClick={(e) => handleMenuClick(e, 'repaired')}>
                     <div className="dot green"></div> Completed
                  </button>
                )}
                <div className="divider"></div>
                <button className="danger" onClick={(e) => handleMenuClick(e, 'scrap')}>
                  <FiXCircle size={14}/> Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card-subtext">{item.equipmentName}</div>
      <PriorityBadge value={item.priority} />
      
      <div className="card-meta">
        <div className="tech-row"><FiUser /> {item.tech}</div>
        <span>#{item.id.slice(-4)}</span>
      </div>
    </div>
  );
}

/* HELPERS */
function priorityColor(p) {
  if (p === "High" || p === "Critical") return "#ef4444";
  if (p === "Medium") return "#f59e0b";
  return "#22c55e"; 
}

function PriorityBadge({ value }) {
  const map = { Critical: "#7f1d1d", High: "#b91c1c", Medium: "#b45309", Low: "#15803d" };
  const bgMap = { Critical: "#fef2f2", High: "#fff7ed", Medium: "#fffbeb", Low: "#f0fdf4" };
  
  return (
    <span style={{ background: bgMap[value] || bgMap.Low, color: map[value] || map.Low, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "700", display: "inline-block", marginTop: "8px" }}>
      {value.toUpperCase()}
    </span>
  );
}