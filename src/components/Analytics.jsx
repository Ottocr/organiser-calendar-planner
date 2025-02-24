import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { selectTasks, selectLists, selectPriorities } from '../store/taskSlice';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isWithinInterval,
  parseISO,
  startOfMonth,
  endOfMonth,
  differenceInDays,
} from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
);

function Analytics() {
  const tasks = useSelector(selectTasks);
  const lists = useSelector(selectLists);
  const priorities = useSelector(selectPriorities);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = tasks.filter(task => !task.deleted).length;
    const completed = tasks.filter(task => task.completed && !task.deleted).length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const overdue = tasks.filter(task => 
      !task.completed && 
      !task.deleted && 
      new Date(task.dueDate) < new Date()
    ).length;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate: completionRate.toFixed(1)
    };
  }, [tasks]);

  // Prepare data for list distribution chart
  const listData = useMemo(() => {
    const distribution = lists.map(list => ({
      list: list.name,
      count: tasks.filter(task => task.list === list.id && !task.deleted).length,
      color: list.color
    }));

    return {
      labels: distribution.map(d => d.list),
      datasets: [{
        data: distribution.map(d => d.count),
        backgroundColor: distribution.map(d => d.color),
        borderWidth: 0
      }]
    };
  }, [tasks, lists]);

  // Prepare data for weekly completion chart
  const weeklyData = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now);
    const end = endOfWeek(now);
    const days = eachDayOfInterval({ start, end });

    const completedByDay = days.map(day => ({
      date: format(day, 'EEE'),
      completed: tasks.filter(task => 
        task.completed && 
        !task.deleted &&
        isWithinInterval(parseISO(task.completedAt || task.dueDate), {
          start: day,
          end: day
        })
      ).length,
      created: tasks.filter(task => 
        !task.deleted &&
        isWithinInterval(parseISO(task.createdAt), {
          start: day,
          end: day
        })
      ).length
    }));

    return {
      labels: completedByDay.map(d => d.date),
      datasets: [
        {
          label: 'Tasks Completed',
          data: completedByDay.map(d => d.completed),
          borderColor: '#4FD1C5',
          backgroundColor: 'rgba(79, 209, 197, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Tasks Created',
          data: completedByDay.map(d => d.created),
          borderColor: '#9F7AEA',
          backgroundColor: 'rgba(159, 122, 234, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [tasks]);

  // Calculate productivity trends
  const productivityTrends = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
    
    const tasksThisMonth = tasks.filter(task => 
      !task.deleted &&
      isWithinInterval(parseISO(task.createdAt), {
        start: monthStart,
        end: monthEnd
      })
    );

    const completedThisMonth = tasksThisMonth.filter(task => task.completed);
    
    const avgTasksPerDay = tasksThisMonth.length / daysInMonth;
    const avgCompletionTime = completedThisMonth.length > 0
      ? completedThisMonth.reduce((acc, task) => {
          const created = parseISO(task.createdAt);
          const completed = parseISO(task.completedAt);
          return acc + differenceInDays(completed, created);
        }, 0) / completedThisMonth.length
      : 0;

    return {
      avgTasksPerDay: avgTasksPerDay.toFixed(1),
      avgCompletionTime: avgCompletionTime.toFixed(1)
    };
  }, [tasks]);

  return (
    <div className="h-full space-y-6 overflow-y-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'bg-blue-500' },
          { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
          { label: 'Completion Rate', value: `${stats.completionRate}%`, color: 'bg-purple-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-lg mb-4 flex items-center justify-center`}>
              <span className="text-white text-xl font-bold">
                {stat.label.charAt(0)}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Productivity Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-6"
      >
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Daily Average
          </h3>
          <p className="text-3xl font-bold text-primary">
            {productivityTrends.avgTasksPerDay}
          </p>
          <p className="text-gray-500 mt-1">tasks per day</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Completion Time
          </h3>
          <p className="text-3xl font-bold text-primary">
            {productivityTrends.avgCompletionTime}
          </p>
          <p className="text-gray-500 mt-1">days on average</p>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            List Distribution
          </h3>
          <div className="h-64">
            <Doughnut
              data={listData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20
                    }
                  }
                },
                cutout: '60%'
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Weekly Activity
          </h3>
          <div className="h-64">
            <Line
              data={weeklyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Priority Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Task Priority Distribution
        </h3>
        <div className="h-64">
          <Bar
            data={{
              labels: priorities.map(p => p.name),
              datasets: [{
                data: priorities.map(priority => 
                  tasks.filter(t => t.priority === priority.id && !t.deleted).length
                ),
                backgroundColor: priorities.map(p => p.color)
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default Analytics;
