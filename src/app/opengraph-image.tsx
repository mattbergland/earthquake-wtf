import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "earthquake.wtf — Was that an earthquake?";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Seismograph line background */}
        <svg
          width="1200"
          height="200"
          viewBox="0 0 1200 200"
          style={{
            position: "absolute",
            top: "50%",
            left: "0",
            transform: "translateY(-50%)",
            opacity: 0.15,
          }}
        >
          <path
            d="M0 100 L100 100 L150 40 L200 160 L250 20 L300 180 L350 60 L400 140 L450 80 L500 120 L550 90 L600 100 L700 100 L750 50 L800 150 L850 30 L900 170 L950 70 L1000 130 L1050 85 L1100 100 L1200 100"
            stroke="#4ade80"
            strokeWidth="4"
            fill="none"
          />
        </svg>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Question bubble */}
          <div
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              padding: "24px 48px",
              borderRadius: "32px",
              marginBottom: "40px",
              boxShadow: "0 20px 60px rgba(59, 130, 246, 0.4)",
              display: "flex",
            }}
          >
            <span style={{ fontSize: "36px", color: "white", fontWeight: 600 }}>
              was that an earthquake? 🤔
            </span>
          </div>

          {/* Main title */}
          <div
            style={{
              fontSize: "120px",
              fontWeight: 900,
              color: "white",
              letterSpacing: "-4px",
              textShadow: "0 4px 30px rgba(0,0,0,0.3)",
              display: "flex",
            }}
          >
            earthquake
            <span style={{ color: "#4ade80" }}>.wtf</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "28px",
              color: "#94a3b8",
              marginTop: "20px",
              display: "flex",
            }}
          >
            Real-time Bay Area earthquake detection
          </div>
        </div>

        {/* Corner accent */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "40px",
            fontSize: "20px",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>also at</span>
          <span style={{ color: "#4ade80", fontWeight: 600 }}>earthquake.lol</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
