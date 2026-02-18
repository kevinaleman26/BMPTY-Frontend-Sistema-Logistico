"use client";

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { alpha } from '@mui/system';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`;

export default function PublicLayout({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#1a1815",
        backgroundImage: noiseTexture,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid overlay - warehouse floor markings */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
                        linear-gradient(rgba(58, 55, 48, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(58, 55, 48, 0.03) 1px, transparent 1px)
                    `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top Navigation */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "transparent",
          borderBottom: "1px solid",
          borderColor: "#2d2a25",
          zIndex: 10,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1.5 }}>
          <Box
            sx={{
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                filter: "drop-shadow(0 0 8px rgba(244, 178, 35, 0.3))",
              },
            }}
          >
            <Image
              src={"/logo.png"}
              width={140}
              height={85}
              alt="BMPTY Sistema Logístico"
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              component={Link}
              href="/registro"
              sx={{
                color: pathname === "/registro" ? "#f4b223" : "#e8e6e0",
                fontFamily: "IBM Plex Sans, sans-serif",
                fontWeight: pathname === "/registro" ? 600 : 500,
                fontSize: "1rem",
                letterSpacing: "0.02em",
                px: 2.5,
                py: 1,
                borderRadius: "8px",
                textTransform: "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: alpha("#2f2c24", 0.6),
                  color: "#f4b223",
                  transform: "translateX(2px)",
                },
              }}
            >
              Registro
            </Button>
            <Button
              component={Link}
              href="/login"
              variant={isLogin ? "contained" : "outlined"}
              sx={{
                fontFamily: "IBM Plex Sans, sans-serif",
                fontSize: "1rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                px: 3,
                py: 1,
                borderRadius: "8px",
                textTransform: "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                ...(isLogin
                  ? {
                      backgroundColor: "#f4b223",
                      color: "#1a1815",
                      boxShadow:
                        "0 4px 6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(244, 178, 35, 0.2)",
                      "&:hover": {
                        backgroundColor: "#f7c14a",
                        transform: "translateY(-2px)",
                        boxShadow:
                          "0 8px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(244, 178, 35, 0.3)",
                      },
                    }
                  : {
                      borderColor: "#3a3730",
                      borderWidth: "1px",
                      color: "#e8e6e0",
                      "&:hover": {
                        borderColor: "#f4b223",
                        backgroundColor: alpha("#2f2c24", 0.6),
                        transform: "translateY(-2px)",
                      },
                    }),
              }}
            >
              Iniciar sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content - Split Screen */}
      <Box
        sx={{
          display: "flex",
          minHeight: "calc(100vh - 102px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left Panel - Form Area */}
        <Box
          sx={{
            width: { xs: "100%", md: "40%" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 4,
            position: "relative",
          }}
        >
          <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
            {children}
          </Container>
        </Box>

        {/* Right Panel - Branding */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            width: "60%",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            backgroundColor: alpha("#252218", 0.5),
            backgroundImage: noiseTexture,
            borderLeft: "1px solid",
            borderColor: "#2d2a25",
            overflow: "hidden",
          }}
        >
          {/* Ambient glow - warehouse safety lighting */}
          <Box
            sx={{
              position: "absolute",
              top: "20%",
              right: "-10%",
              width: "500px",
              height: "500px",
              background: `radial-gradient(circle, ${alpha("#f4b223", 0.08)} 0%, transparent 70%)`,
              pointerEvents: "none",
              animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.6 },
              },
            }}
          />

          <Box
            sx={{
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "scale(1.02)",
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))",
                },
              }}
            >
              <Image
                src={"/logo.png"}
                width={480}
                height={360}
                alt="Sistema Logístico BMPTY"
                style={{
                  opacity: 0.95,
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))",
                }}
              />
            </Box>

            {/* Tracking number aesthetic - warehouse documentation */}
            <Box
              sx={{
                mt: 6,
                display: "flex",
                alignItems: "top",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: "32px",
                  height: "1px",
                  backgroundColor: "#3a3730",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
              <Box
                component="span"
                sx={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.75rem",
                  color: "#6d685f",
                  letterSpacing: "0.15em",
                  fontWeight: 600,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    color: "#f4b223",
                  },
                }}
              >
                TRACKING SYSTEM v2.0
              </Box>
              <Box
                sx={{
                  width: "32px",
                  height: "1px",
                  backgroundColor: "#3a3730",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </Box>

            {/* Industrial badge indicators */}
            <Box
              sx={{
                mt: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
              }}
            >
              {["24/7", "SECURE", "FAST"].map((badge, index) => (
                <Box
                  key={badge}
                  sx={{
                    px: 2,
                    py: 0.75,
                    backgroundColor: alpha("#2f2c24", 0.6),
                    backgroundImage: noiseTexture,
                    border: "1px solid",
                    borderColor: "#3a3730",
                    borderRadius: "6px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    color: "#a8a399",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: `fadeIn 0.5s ease-out ${0.5 + index * 0.1}s both`,
                    "@keyframes fadeIn": {
                      from: { opacity: 0, transform: "translateY(10px)" },
                      to: { opacity: 1, transform: "translateY(0)" },
                    },
                    "&:hover": {
                      borderColor: "#f4b223",
                      color: "#f4b223",
                      backgroundColor: alpha("#2f2c24", 0.9),
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                    },
                  }}
                >
                  {badge}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
