export type TabEntry = {
  label: string;
  href: string;
  icon?: string;
};

export type ProductSolutionTabsProps = {
  title?: string | undefined;
  items: TabEntry[];
};

export function ProductSolutionTabs({ items, title }: ProductSolutionTabsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-labelledby="energy-storage-solution-tabs-heading" className="energy-storage-solution-tabs">
      <div className="energy-storage-solution-tabs__track">
        {title ? (
          <h2 className="energy-storage-solution-tabs__heading" id="energy-storage-solution-tabs-heading">
            {title}
          </h2>
        ) : null}
        <ul className="energy-storage-solution-tabs__list" role="list">
          {items.map((entry) => (
            <li className="energy-storage-solution-tabs__item" key={`${entry.label}-${entry.href}`}>
              <a className="energy-storage-solution-tabs__link" href={entry.href}>
                {entry.icon ? (
                  <span aria-hidden className="energy-storage-solution-tabs__icon">
                    {entry.icon}
                  </span>
                ) : null}
                <span>{entry.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
