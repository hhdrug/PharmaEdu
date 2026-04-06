'use client';

function Footer() {
  return (
    <footer className="bg-bg-surface border-t border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted text-center sm:text-left">
            © 2026 PharmaEdu — 약제비 계산 교육 플랫폼
          </p>
          <p className="text-sm text-text-muted">
            v0.1.0
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
