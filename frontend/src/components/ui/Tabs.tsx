import { type ReactNode } from 'react';

interface TabItem {
  id: string;
  label: string;
  content?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  variant?: 'default' | 'pills';
}

function Tabs({ items, activeTab, onTabChange, variant = 'default' }: TabsProps) {
  const containerClass =
    variant === 'pills'
      ? 'flex gap-2 flex-wrap'
      : 'flex gap-0 border-b border-slate-200 dark:border-slate-700 overflow-x-auto';

  const tabClass = (isActive: boolean) =>
    variant === 'pills'
      ? `
        px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
        ${
          isActive
            ? 'bg-primary-600 text-white dark:bg-primary-500'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
        }
      `
      : `
        px-4 py-3 font-medium text-sm transition-colors duration-200 border-b-2 whitespace-nowrap
        ${
          isActive
            ? 'border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400'
            : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }
      `;

  return (
    <div>
      <div className={containerClass}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={tabClass(activeTab === item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 animate-fadeIn">
        {items.find((item) => item.id === activeTab)?.content}
      </div>
    </div>
  );
}

export { Tabs };
