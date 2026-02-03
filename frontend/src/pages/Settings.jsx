import Header from '../components/Header';

export default function Settings() {
  return (
    <>
      <Header
        title="Settings"
        leftIcon="settings"
      />
      <main className="flex-1 pb-24 p-4">
        <div className="text-center text-slate-400 py-12">
          <span className="material-symbols-outlined text-6xl mb-4 block">settings</span>
          <p>Settings coming soon</p>
        </div>
      </main>
    </>
  );
}
