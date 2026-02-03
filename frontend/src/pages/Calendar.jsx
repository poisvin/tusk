import Header from '../components/Header';

export default function Calendar() {
  return (
    <>
      <Header
        title="Task Scheduler"
        leftIcon="calendar_month"
        rightAction={
          <button className="flex items-center justify-center text-white">
            <span className="material-symbols-outlined">search</span>
          </button>
        }
      />
      <main className="flex-1 pb-24 p-4">
        <div className="text-center text-slate-400 py-12">
          <span className="material-symbols-outlined text-6xl mb-4 block">calendar_month</span>
          <p>Calendar view coming soon</p>
        </div>
      </main>
    </>
  );
}
