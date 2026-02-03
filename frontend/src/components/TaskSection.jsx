import TaskItem from './TaskItem';

export default function TaskSection({ title, tasks, onToggle, isCarriedOver }) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <section className="mt-4">
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        {title}
      </h3>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          isCarriedOver={isCarriedOver}
        />
      ))}
    </section>
  );
}
