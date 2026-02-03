import Header from '../components/Header';

export default function Notes() {
  return (
    <>
      <Header
        title="Notes Repository"
        leftIcon="notes"
        rightAction={
          <button className="flex items-center justify-center text-white">
            <span className="material-symbols-outlined">info</span>
          </button>
        }
      />
      <main className="flex-1 pb-24 p-4">
        <div className="text-center text-slate-400 py-12">
          <span className="material-symbols-outlined text-6xl mb-4 block">notes</span>
          <p>Notes feature coming soon</p>
        </div>
      </main>
    </>
  );
}
