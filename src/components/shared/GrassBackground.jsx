/**
 * Abstract Background Component
 * Creates an elegant abstract background effect with purple/violet tones
 */

export const GrassBackground = () => {
  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50" />
        
        {/* Abstract texture overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(139, 92, 246, 0.05) 10px,
                rgba(139, 92, 246, 0.05) 20px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 10px,
                rgba(124, 58, 237, 0.05) 10px,
                rgba(124, 58, 237, 0.05) 20px
              )
            `,
          }}
        />
        
        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-purple-300/20 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-violet-300/20 rounded-full blur-2xl" />
      </div>
    </>
  );
};

export default GrassBackground;
