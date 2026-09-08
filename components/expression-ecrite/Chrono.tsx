"use client";

import { useEffect, useState } from "react";

interface Props {
  minutes: number;
  resetKey: number;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return (
    String(m).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0")
  );
}

export default function Chrono({ minutes, resetKey }: Props) {
  const [reste, setReste] = useState(minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setReste(minutes * 60);
    setRunning(false);
  }, [minutes, resetKey]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setReste((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const alerte = reste <= 120;
  const termine = reste === 0;

  return (
    <>
      <button
        className="bouton"
        id="btn-chrono"
        onClick={() => {
          if (running) {
            setReste(minutes * 60);
            setRunning(false);
          } else {
            setRunning(true);
          }
        }}
      >
        {termine ? "Temps écoulé" : running ? "Arrêter" : "Démarrer le chrono"}
      </button>
      <span
        className={"chrono" + (alerte ? " alerte" : "")}
        id="chrono"
      >
        {fmt(reste)}
      </span>
    </>
  );
}
