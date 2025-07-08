import React from 'react';

const JTVoxLogo: React.FC = () => {
  const logoStyles: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0033A0 0%, #002875 100%)',
    width: '320px',
    height: '220px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(0,51,160,0.3)',
    margin: '20px auto',
  };

  const brandContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    marginBottom: '22px',
    zIndex: 2,
    position: 'relative',
  };

  const jtBubbleStyles: React.CSSProperties = {
    background: '#FFFFFF',
    color: '#0033A0',
    padding: '14px 20px',
    borderRadius: '18px',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 900,
    fontSize: '28px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    position: 'relative',
  };

  const soundWavesStyles: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  };

  const waveBaseStyles: React.CSSProperties = {
    width: '5px',
    background: '#00A651',
    borderRadius: '3px',
    boxShadow: '0 2px 8px rgba(0,166,81,0.3)',
  };

  const voxTextStyles: React.CSSProperties = {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '40px',
    fontWeight: 700,
    letterSpacing: '3px',
    marginBottom: '10px',
    zIndex: 2,
    position: 'relative',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const byTextStyles: React.CSSProperties = {
    fontFamily: 'Open Sans, sans-serif',
    fontSize: '16px',
    opacity: 0.85,
    fontWeight: 300,
    zIndex: 2,
    position: 'relative',
    letterSpacing: '0.5px',
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&family=Open+Sans:wght@300;400;600&display=swap');
          
          @keyframes wave {
            0%, 100% { 
              transform: scaleY(1); 
              opacity: 0.7; 
            }
            50% { 
              transform: scaleY(1.5); 
              opacity: 1; 
            }
          }
          
          .wave-1 { 
            height: 18px; 
            animation: wave 1.5s ease-in-out infinite 0s; 
          }
          .wave-2 { 
            height: 28px; 
            animation: wave 1.5s ease-in-out infinite 0.2s; 
          }
          .wave-3 { 
            height: 22px; 
            animation: wave 1.5s ease-in-out infinite 0.4s; 
          }
          .wave-4 { 
            height: 34px; 
            animation: wave 1.5s ease-in-out infinite 0.6s; 
          }
          .wave-5 { 
            height: 16px; 
            animation: wave 1.5s ease-in-out infinite 0.8s; 
          }
          
          @media (max-width: 768px) {
            .jt-vox-responsive {
              width: 280px !important;
              height: 200px !important;
            }
            .vox-text-responsive {
              font-size: 32px !important;
            }
            .jt-bubble-responsive {
              font-size: 24px !important;
              padding: 12px 16px !important;
            }
          }
          
          @media (max-width: 480px) {
            .jt-vox-responsive {
              width: 260px !important;
              height: 180px !important;
            }
            .vox-text-responsive {
              font-size: 28px !important;
            }
            .jt-bubble-responsive {
              font-size: 20px !important;
              padding: 10px 14px !important;
            }
            .wave-responsive {
              width: 4px !important;
            }
          }
        `}
      </style>
      
      <div style={logoStyles} className="jt-vox-responsive">
        <div style={brandContainerStyles}>
          <div style={jtBubbleStyles} className="jt-bubble-responsive">JT</div>
          <div style={soundWavesStyles}>
            <div style={{...waveBaseStyles}} className="wave-1 wave-responsive"></div>
            <div style={{...waveBaseStyles}} className="wave-2 wave-responsive"></div>
            <div style={{...waveBaseStyles}} className="wave-3 wave-responsive"></div>
            <div style={{...waveBaseStyles}} className="wave-4 wave-responsive"></div>
            <div style={{...waveBaseStyles}} className="wave-5 wave-responsive"></div>
          </div>
        </div>
        <div style={voxTextStyles} className="vox-text-responsive">VOX CRM</div>
        <div style={byTextStyles}>by JT Telecom</div>
      </div>
    </>
  );
};

export default JTVoxLogo;

