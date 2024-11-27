import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion, AnimatePresence } from 'framer-motion';
import { selectTasks, selectLists, addTask } from '../store/taskSlice';
import { format, parseISO } from 'date-fns';

function Calendar({ onEditTask }) {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const lists = useSelector(selectLists);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
        important: task.important
      }
    }));

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
  };

  const handleDateSelect = (selectInfo) => {
    const title = window.prompt('Enter task title:');
    if (title) {
      const newTask = {
        title,
        dueDate: selectInfo.start.toISOString(),
        list: lists[0].id,
        priority: 'normal'
      };
      dispatch(addTask(newTask));
    }
    selectInfo.view.calendar.unselect();
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

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedEvent.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {format(selectedEvent.start, 'PPP')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditTask(tasks.find(t => t.id === selectedEvent.id))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            {selectedEvent.extendedProps.description && (
              <p className="text-gray-600 mb-4">
                {selectedEvent.extendedProps.description}
              </p>
            )}

            <div className="flex gap-2">
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: lists.find(
                    list => list.id === selectedEvent.extendedProps.list
                  )?.color,
                  color: 'white'
                }}
              >
                {lists.find(
                  list => list.id === selectedEvent.extendedProps.list
                )?.name}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium priority-${selectedEvent.extendedProps.priority}`}>
                {selectedEvent.extendedProps.priority}
              </span>
              {selectedEvent.extendedProps.important && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-white">
                  Important
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Calendar;
