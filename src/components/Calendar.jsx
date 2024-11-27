import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion, AnimatePresence } from 'framer-motion';
import { selectTasks, selectLists } from '../store/slices/taskSlice';
import { format, parseISO } from 'date-fns';
import TaskModal from './TaskModal';
import TaskDetails from './TaskDetails';

function Calendar({ onEditTask }) {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const lists = useSelector(selectLists);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  const events = tasks
    .filter(task => !task.deleted)
    .map(task => ({
      id: task.id,
      title: task.title,
      start: task.startDate || task.dueDate,
      end: task.endDate || task.dueDate,
      backgroundColor: lists.find(list => list.id === task.list)?.color || '#4299E1',
      borderColor: 'transparent',
      classNames: [
        'transition-transform',
        'hover:scale-[1.02]',
        task.completed ? 'opacity-50' : '',
        `priority-${task.priority}`,
        task.important ? 'important' : ''
      ],
      extendedProps: {
        description: task.description,
        list: task.list,
        priority: task.priority,
        completed: task.completed,
        important: task.important,
        taskData: task // Store the full task data
      }
    }));

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setShowTaskDetails(true);
  };

  const handleDateSelect = (selectInfo) => {
    setNewTaskDate(selectInfo.start);
    setShowTaskModal(true);
    selectInfo.view.calendar.unselect();
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setNewTaskDate(null);
  };

  const handleCloseTaskDetails = () => {
    setShowTaskDetails(false);
    setSelectedEvent(null);
  };

  return (
    <div className="h-full flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white rounded-xl shadow-lg p-6"
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          selectable={true}
          select={handleDateSelect}
          height="100%"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
          }}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          dayMaxEvents={true}
          nowIndicator={true}
          eventDidMount={(info) => {
            // Add hover effect
            info.el.addEventListener('mouseenter', () => {
              info.el.style.transform = 'scale(1.02)';
              info.el.style.transition = 'transform 0.2s ease';
            });
            info.el.addEventListener('mouseleave', () => {
              info.el.style.transform = 'scale(1)';
            });
          }}
        />
      </motion.div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={handleCloseTaskModal}
        initialDate={newTaskDate}
      />

      {/* Task Details Sidebar */}
      <AnimatePresence>
        {showTaskDetails && selectedEvent && (
          <TaskDetails
            task={selectedEvent.extendedProps.taskData}
            onClose={handleCloseTaskDetails}
            onEdit={onEditTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Calendar;
