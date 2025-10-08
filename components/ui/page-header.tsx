import React from 'react'

export function PageHeader({ title, subtitle, className = '' }: { title: string; subtitle?: string; className?: string }) {
  return (
    <header className={`page-header mb-6 ${className}`}>
      <h1>{title}</h1>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </header>
  );
}

export default PageHeader;
