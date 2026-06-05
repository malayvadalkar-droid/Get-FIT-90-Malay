import BottomNav from '@/components/BottomNav';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '80px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
