export default function Header({ title, leftIcon, rightAction, onLeftIconClick }) {
  return (
    <header className="sticky top-0 z-10 flex items-center bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between">
      <div
        className={`text-white flex size-12 shrink-0 items-center ${onLeftIconClick ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
        onClick={onLeftIconClick}
      >
        <span className="material-symbols-outlined text-[28px]">{leftIcon}</span>
      </div>
      <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
        {title}
      </h2>
      <div className="flex w-12 items-center justify-end">
        {rightAction}
      </div>
    </header>
  );
}
