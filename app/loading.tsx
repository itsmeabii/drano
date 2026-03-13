export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7EFE5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Nunito', sans-serif",
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
    }}>
      {/* decorative blobs */}
      <div style={{ position: 'fixed', top: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: '#E2BFD9', opacity: 0.4 }} />
      <div style={{ position: 'fixed', bottom: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: '#C8A1E0', opacity: 0.3 }} />

      {/* logo */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '42px',
        fontWeight: 600,
        color: '#674188',
        letterSpacing: '-1px',
        marginBottom: '8px',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>✦ drano</div>

      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontStyle: 'italic',
        fontSize: '13px',
        color: '#C8A1E0',
        marginBottom: '40px',
      }}>drain the debt. manifest the wealth.</div>

      {/* animated stars */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              fontSize: '20px',
              color: '#674188',
              animation: `bounce 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
              opacity: 0.3,
            }}
          >★</div>
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}